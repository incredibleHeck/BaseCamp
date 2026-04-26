/**
 * RTDB Live Classroom Load Test
 *
 * Simulates 30 students joining a live session, writing presence, and answering
 * 10 questions with sub-second intervals. Measures write latency and verifies
 * the RTDB tree can handle classroom-scale concurrency.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/sa.json \
 *   RTDB_URL=https://your-project-default-rtdb.firebaseio.com \
 *   npx tsx scripts/loadTestRtdb.ts
 *
 * Or to run against the emulator:
 *   FIREBASE_DATABASE_EMULATOR_HOST=localhost:9000 \
 *   npx tsx scripts/loadTestRtdb.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const STUDENT_COUNT = 30;
const QUESTION_COUNT = 10;
const ANSWER_INTERVAL_MS = 800;

const SESSION_ID = `load-test-${Date.now()}`;

async function main() {
  if (!getApps().length) {
    const rtdbUrl = process.env.RTDB_URL || process.env.FIREBASE_DATABASE_URL;
    const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
      initializeApp({ projectId: 'demo-basecamp', databaseURL: `http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST}` });
    } else if (!rtdbUrl) {
      console.error('Set RTDB_URL or FIREBASE_DATABASE_EMULATOR_HOST');
      process.exit(1);
    } else {
      initializeApp({
        credential: cred ? cert(cred) : undefined,
        databaseURL: rtdbUrl,
      });
    }
  }

  const db = getDatabase();
  const root = db.ref(`live_sessions/${SESSION_ID}`);

  console.log(`\n=== RTDB Load Test ===`);
  console.log(`Session: ${SESSION_ID}`);
  console.log(`Students: ${STUDENT_COUNT}`);
  console.log(`Questions: ${QUESTION_COUNT}`);
  console.log(`Answer interval: ${ANSWER_INTERVAL_MS}ms\n`);

  // 1. Teacher creates session state
  const stateRef = root.child('state');
  const questions = Array.from({ length: QUESTION_COUNT }, (_, i) => ({
    id: `q${i}`,
    prompt: `What is ${i + 1} + ${i + 2}?`,
    options: [`${i * 2}`, `${i * 2 + 1}`, `${(i + 1) + (i + 2)}`, `${i * 3}`],
    correctIndex: 2,
  }));

  await stateRef.set({
    status: 'active',
    teacherId: 'load-test-teacher',
    roundTitle: 'Load Test Round',
    questions,
    activeQuestionIndex: 0,
    startedAtMs: Date.now(),
  });
  console.log('Teacher: session created');

  // 2. All students set presence concurrently
  const studentIds = Array.from({ length: STUDENT_COUNT }, (_, i) => `student-${String(i).padStart(3, '0')}`);

  const presenceStart = performance.now();
  await Promise.all(
    studentIds.map((id) =>
      root.child(`presence/${id}`).set({ online: true, joinedAt: Date.now() })
    )
  );
  const presenceMs = Math.round(performance.now() - presenceStart);
  console.log(`Presence: ${STUDENT_COUNT} students joined in ${presenceMs}ms`);

  // 3. Student links (mapping anon -> firestore student id)
  await Promise.all(
    studentIds.map((id) =>
      root.child(`student_links/${id}`).set({ firestoreStudentId: `fs-${id}` })
    )
  );
  console.log(`Student links: ${STUDENT_COUNT} written`);

  // 4. Simulate answering questions with staggered timing
  const latencies: number[] = [];

  for (let q = 0; q < QUESTION_COUNT; q++) {
    await stateRef.update({ activeQuestionIndex: q });

    const questionStart = performance.now();

    await Promise.all(
      studentIds.map((id) => {
        const answer = Math.floor(Math.random() * 4);
        return root.child(`answers/q${q}/${id}`).set(answer);
      })
    );

    const questionMs = Math.round(performance.now() - questionStart);
    latencies.push(questionMs);
    console.log(`  Q${q}: ${STUDENT_COUNT} answers in ${questionMs}ms`);

    if (q < QUESTION_COUNT - 1) {
      await new Promise((r) => setTimeout(r, ANSWER_INTERVAL_MS));
    }
  }

  // 5. Teacher concludes
  await stateRef.update({ status: 'concluded', endedAtMs: Date.now() });
  console.log('Teacher: session concluded');

  // 6. Summary
  const avgLatency = Math.round(latencies.reduce((s, x) => s + x, 0) / latencies.length);
  const maxLatency = Math.max(...latencies);
  const minLatency = Math.min(...latencies);
  const p95Index = Math.floor(latencies.length * 0.95);
  const sorted = [...latencies].sort((a, b) => a - b);
  const p95 = sorted[p95Index] ?? maxLatency;

  console.log(`\n=== Results ===`);
  console.log(`Total writes: ${STUDENT_COUNT * QUESTION_COUNT + STUDENT_COUNT * 2 + QUESTION_COUNT + 2}`);
  console.log(`Avg question batch latency: ${avgLatency}ms`);
  console.log(`Min: ${minLatency}ms | Max: ${maxLatency}ms | P95: ${p95}ms`);

  if (maxLatency > 2000) {
    console.log(`\n⚠ WARNING: Max latency exceeds 2s — may cause visible lag in the classroom`);
  } else {
    console.log(`\n✓ All batches under 2s — acceptable for classroom use`);
  }

  // 7. Cleanup
  await root.remove();
  console.log(`Cleanup: session removed\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Load test failed:', err);
  process.exit(1);
});
