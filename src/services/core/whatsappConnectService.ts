import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

/** Sandbox / demo — replace with Meta Cloud API + BSP in production. */
export const WHATSAPP_TEMPLATE_STUB_ID = 'heckteck_weekly_progress_v1_demo';

export interface WhatsAppOutboxRecord {
  id?: string;
  studentId: string;
  guardianPhone: string;
  guardianLanguage: string;
  bodyEn: string;
  bodyLocal: string;
  templateId: string;
  status: 'demo_queued' | 'sent_mock' | 'failed_mock';
  channel: string;
  createdAt: Timestamp;
}

/**
 * Writes a row for ops to pick up (or demo). Does not call Meta APIs.
 */
export async function queueWeeklyDigestWhatsApp(params: {
  studentId: string;
  guardianPhone: string;
  guardianLanguage: string;
  bodyEn: string;
  bodyLocal: string;
}): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'whatsappOutbox'), {
      studentId: params.studentId,
      guardianPhone: params.guardianPhone.trim(),
      guardianLanguage: params.guardianLanguage,
      bodyEn: params.bodyEn,
      bodyLocal: params.bodyLocal,
      templateId: WHATSAPP_TEMPLATE_STUB_ID,
      status: 'demo_queued',
      channel: 'whatsapp_meta_sandbox_stub',
      createdAt: Timestamp.now(),
    });
    return ref.id;
  } catch (e) {
    console.error('queueWeeklyDigestWhatsApp', e);
    return null;
  }
}
