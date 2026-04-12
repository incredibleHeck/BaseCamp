import { collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { normalizeAccessLookupKey } from './accessLookupKeys';

const GHANAIAN_FIRST_NAMES = [
  'Kwame', 'Abena', 'Kofi', 'Ama', 'Osei', 'Mensah', 'Adjoa', 'Yaw', 
  'Esi', 'Akua', 'Kwadwo', 'Efua', 'Kwabena', 'Baaba', 'Kweku', 'Abiba', 
  'Kwesi', 'Akosua', 'Nana', 'Afia'
];

const GHANAIAN_SURNAMES = [
  'Osei', 'Mensah', 'Appiah', 'Boateng', 'Asante', 'Owusu', 'Addo', 
  'Agyemang', 'Darko', 'Kwarteng', 'Annan', 'Quansah', 'Danquah', 'Tetteh', 
  'Acheampong', 'Sarpong'
];

const PRIMARY_LANGUAGES = ['English', 'Twi', 'Ga', 'Ewe', 'Fante', 'Dagbani'];
const SEN_STATUSES = ['Dyslexia', 'Dysgraphia', 'ADHD', 'Autism Spectrum'];

const ASSESSMENT_TEMPLATES = [
  { type: 'Literacy' as const, diagnosis: 'Struggles with decoding multi-syllable words.' },
  { type: 'Literacy' as const, diagnosis: 'Good reading fluency but weak inference skills.' },
  { type: 'Numeracy' as const, diagnosis: 'Confuses multiplication with repeated addition.' },
  { type: 'Numeracy' as const, diagnosis: 'Difficulty with place value beyond 100.' },
  { type: 'Literacy' as const, diagnosis: 'Needs support with subject-verb agreement.' },
  { type: 'Numeracy' as const, diagnosis: 'Excellent arithmetic but avoids word problems.' }
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(): string {
  return `${getRandomElement(GHANAIAN_FIRST_NAMES)} ${getRandomElement(GHANAIAN_SURNAMES)}`;
}

function getMasteryLevel(score: number): string {
  if (score >= 85) return 'advanced';
  if (score >= 70) return 'proficient';
  if (score >= 50) return 'developing';
  return 'intervention_needed';
}

/** @param preserveDocumentId When set (e.g. signed-in super admin UID), that document is not deleted. */
async function clearCollection(collectionName: string, preserveDocumentId?: string) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  if (querySnapshot.empty) return;

  const batch = writeBatch(db);
  let deletes = 0;
  querySnapshot.forEach((document) => {
    if (preserveDocumentId && document.id === preserveDocumentId) {
      return;
    }
    batch.delete(document.ref);
    deletes += 1;
  });
  if (deletes === 0) return;
  await batch.commit();
}

/**
 * Seeds the demo environment with realistic, relational Ghanaian school data.
 * Targets: 1 District, 3 Schools, 3 Headteachers, 9 Teachers, 9 Cohorts, 45 Students, ~135 Assessments.
 */
export async function seedDemoEnvironment() {
  const seedingUserUid = auth.currentUser?.uid;

  console.log('Purging existing demo data...');
  await clearCollection('users', seedingUserUid);
  await clearCollection('accessLookups');
  await clearCollection('cohorts');
  await clearCollection('students');
  await clearCollection('assessments');
  await clearCollection('senAlerts');

  console.log('Seeding new demo environment...');
  const batch = writeBatch(db);
  const districtId = 'dist-demo-1';
  
  // 1. Create District
  const districtRef = doc(db, 'districts', districtId);
  batch.set(districtRef, {
    name: 'Greater Accra Demo District',
    region: 'Greater Accra',
    createdAt: Date.now(),
  });

  const now = Date.now();
  const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;

  // 2. Create Schools & Headteachers
  for (let s = 1; s <= 3; s++) {
    const schoolId = `school${s}`;
    
    batch.set(doc(db, 'schools', schoolId), {
      name: `Demo School ${s}`,
      districtId: districtId,
      location: 'Greater Accra',
    });

    const headteacherId = `ht-${schoolId}`;
    const headEmail = `headteacher@school${s}.com`;
    batch.set(doc(db, 'users', headteacherId), {
      name: `Headteacher ${s}`,
      role: 'headteacher',
      email: headEmail,
      username: headEmail,
      schoolId: schoolId,
      districtId: districtId,
    });
    batch.set(doc(db, 'accessLookups', normalizeAccessLookupKey(headEmail)), {
      profileUserId: headteacherId,
      role: 'headteacher',
      name: `Headteacher ${s}`,
      schoolId,
      districtId,
      email: headEmail,
      username: headEmail,
    });

    // 3. Create Teachers
    for (let t = 1; t <= 3; t++) {
      const teacherId = `teacher-${schoolId}-${t}`;
      const teacherUsername = `teacher${t}@school${s}.com`;
      batch.set(doc(db, 'users', teacherId), {
        name: `Teacher ${t}`,
        role: 'teacher',
        email: teacherUsername,
        username: teacherUsername,
        schoolId: schoolId,
        districtId: districtId,
      });
      batch.set(doc(db, 'accessLookups', normalizeAccessLookupKey(teacherUsername)), {
        profileUserId: teacherId,
        role: 'teacher',
        name: `Teacher ${t}`,
        schoolId,
        districtId,
        email: teacherUsername,
        username: teacherUsername,
      });

      // 4. Create Cohort
      const grade = 3 + t; // Basic 4, 5, 6
      const cohortId = `cohort-${schoolId}-${t}`;
      batch.set(doc(db, 'cohorts', cohortId), {
        name: `Basic ${grade}`,
        schoolId: schoolId,
        teacherId: teacherId,
        gradeLevel: grade,
        numericGradeLevel: grade,
      });

      // 5. Create Students
      for (let st = 1; st <= 5; st++) {
        const studentId = `student-${cohortId}-${st}`;
        const hasSen = Math.random() < 0.20; // ~20% SEN
        const officialSenStatus = hasSen ? getRandomElement(SEN_STATUSES) : null;

        batch.set(doc(db, 'students', studentId), {
          name: generateName(),
          grade: `Basic ${grade}`,
          cohortId: cohortId,
          cohortTeacherId: teacherId,
          numericGradeLevel: grade,
          schoolId: schoolId,
          primaryLanguage: getRandomElement(PRIMARY_LANGUAGES),
          dataProcessingConsent: true,
          createdAt: now - Math.floor(Math.random() * threeMonthsMs),
          ...(officialSenStatus ? { officialSenStatus } : {}),
        });

        // 6. Generate SEN Alert if student has SEN status
        if (officialSenStatus) {
          const senAlertId = `sen-${studentId}`;
          batch.set(doc(db, 'senAlerts', senAlertId), {
            studentId,
            schoolId,
            cohortId,
            cohortTeacherId: teacherId,
            status: 'open',
            riskLevel: 'high',
            condition: officialSenStatus,
            createdAt: now - Math.floor(Math.random() * threeMonthsMs),
          });
        }

        // 7. Generate 2-3 Assessments per student
        const assessmentCount = 2 + Math.floor(Math.random() * 2);
        for (let a = 0; a < assessmentCount; a++) {
          const assessmentId = `assess-${studentId}-${a}`;
          const template = getRandomElement(ASSESSMENT_TEMPLATES);
          const rawScore = 40 + Math.floor(Math.random() * 56); // 40-95
          const updatedAt = now - (Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);

          batch.set(doc(db, 'assessments', assessmentId), {
            studentId,
            type: template.type,
            diagnosis: template.diagnosis,
            score: rawScore,
            rawScore: rawScore,
            masteryLevel: getMasteryLevel(rawScore),
            schoolId: schoolId,
            cohortId: cohortId,
            cohortTeacherId: teacherId,
            updatedAt: updatedAt,
            timestamp: updatedAt,
            status: 'Completed',
            createdByUserId: teacherId
          });
        }
      }
    }
  }

  // Execute Batch
  try {
    await batch.commit();
    // Restore signed-in super admin profile (purge skipped this UID; merge ensures role + district after seed).
    const user = auth.currentUser;
    if (user?.uid) {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          role: 'super_admin',
          name: 'Super Admin',
          email: user.email ?? '',
          districtId,
        },
        { merge: true }
      );
    }
    console.log('Demo Environment Seeded Successfully!');
  } catch (error) {
    console.error('❌ Failed to seed demo environment:', error);
    throw error;
  }
}
