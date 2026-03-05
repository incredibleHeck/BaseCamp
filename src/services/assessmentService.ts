import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Assessment {
  id?: string;
  studentId: string;
  type: 'Literacy' | 'Numeracy';
  diagnosis: string;
  remedialPlan: string;
  timestamp: Date | Timestamp | number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

/**
 * Saves a new assessment to the Firestore "assessments" collection.
 * @param data The assessment data to save.
 * @returns The generated document ID, or null if an error occurred.
 */
export const saveAssessment = async (data: Assessment): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'assessments'), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding assessment document: ', error);
    return null;
  }
};

/**
 * Retrieves the assessment history for a specific student, ordered by timestamp descending.
 * @param studentId The ID of the student.
 * @returns An array of Assessment objects.
 */
export const getStudentHistory = async (studentId: string): Promise<Assessment[]> => {
  try {
    const q = query(
      collection(db, 'assessments'),
      where('studentId', '==', studentId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history: Assessment[] = [];
    
    querySnapshot.forEach((doc) => {
      // Extract data and include the document ID
      const data = doc.data();
      history.push({ 
        id: doc.id,
        studentId: data.studentId,
        type: data.type,
        diagnosis: data.diagnosis,
        remedialPlan: data.remedialPlan,
        timestamp: data.timestamp,
        status: data.status,
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching student assessment history: ', error);
    return [];
  }
};
