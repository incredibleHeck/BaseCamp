import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Student {
  id?: string;
  name: string;
  grade: string;
  // Add any other relevant student fields here
}

/**
 * Saves a new student to the Firestore "students" collection.
 * @param studentData The student data to save.
 * @returns The generated document ID, or null if an error occurred.
 */
export const addStudent = async (studentData: Student): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'students'), studentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding student document: ', error);
    return null;
  }
};

/**
 * Retrieves all students from the Firestore "students" collection.
 * @returns An array of Student objects.
 */
export const getStudents = async (): Promise<Student[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const students: Student[] = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student);
    });
    return students;
  } catch (error) {
    console.error('Error fetching students: ', error);
    return [];
  }
};

/**
 * Retrieves a single student by ID from the Firestore "students" collection.
 * @param studentId The ID of the student.
 * @returns The Student object or null if not found.
 */
export const getStudent = async (studentId: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching student: ', error);
    return null;
  }
};
