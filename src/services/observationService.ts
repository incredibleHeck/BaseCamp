import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION = 'voiceObservations';

export interface VoiceObservationAnalysis {
  transcript: string;
  eslNotes: string;
  phoneticObservations: string;
  suggestedTeacherActions: string[];
  senScreeningHints: string;
}

export interface VoiceObservationDoc {
  id?: string;
  studentId: string;
  analysis: VoiceObservationAnalysis;
  durationMs: number;
  createdAt: Timestamp | number;
  source: 'voice';
}

export async function saveVoiceObservation(
  studentId: string,
  analysis: VoiceObservationAnalysis,
  durationMs: number
): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      studentId,
      analysis,
      durationMs,
      createdAt: Timestamp.now(),
      source: 'voice',
    });
    return ref.id;
  } catch (e) {
    console.error('saveVoiceObservation failed', e);
    return null;
  }
}

export async function getVoiceObservationsForStudent(studentId: string): Promise<VoiceObservationDoc[]> {
  try {
    const q = query(collection(db, COLLECTION), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    const out: VoiceObservationDoc[] = [];
    snap.forEach((d) => {
      const data = d.data();
      out.push({
        id: d.id,
        studentId: data.studentId,
        analysis: data.analysis as VoiceObservationAnalysis,
        durationMs: data.durationMs ?? 0,
        createdAt: data.createdAt,
        source: 'voice',
      });
    });
    const toMs = (c: Timestamp | number) =>
      typeof c === 'number' ? c : c.toMillis?.() ?? 0;
    out.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    return out;
  } catch (e) {
    console.error('getVoiceObservationsForStudent failed', e);
    return [];
  }
}
