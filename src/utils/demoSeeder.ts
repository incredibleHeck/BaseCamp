import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

/**
 * Seeds the demo environment with realistic, relational Ghanaian school data.
 * Targets: 1 District, 2 Schools, 4 Teachers, 4 Cohorts, 40 Students, ~160 Assessments.
 */
export async function seedDemoEnvironment() {
  const batch = writeBatch(db);
  const districtId = 'dist-demo-1';
  
  // 1. Create District
  const districtRef = doc(db, 'districts', districtId);
  batch.set(districtRef, {
    name: 'Greater Accra Demo District',
    region: 'Greater Accra',
    createdAt: Date.now(),
  });

  // 2. Create Schools
  const schools = [
    { id: 'sch-achimota', name: 'Achimota Basic School' },
    { id: 'sch-mando', name: 'Mando Primary' }
  ];

  for (const school of schools) {
    batch.set(doc(db, 'schools', school.id), {
      name: school.name,
      districtId: districtId,
      location: school.id === 'sch-achimota' ? 'Achimota, Accra' : 'Mando, Central Region',
    });
  }

  // 3. Create Teachers (2 per school) and Cohorts
  const teacherIds: string[] = [];
  const cohortData: Array<{ id: string; schoolId: string; name: string; grade: number; teacherId: string }> = [];

  schools.forEach((school, sIdx) => {
    [1, 2].forEach((tIdx) => {
      const teacherId = `teacher-${school.id}-${tIdx}`;
      teacherIds.push(teacherId);

      // User Doc for Teacher
      batch.set(doc(db, 'users', teacherId), {
        name: generateName(),
        role: 'teacher',
        schoolId: school.id,
        districtId: districtId,
        location: school.name,
        email: `${teacherId}@example.edu.gh`,
      });

      // 4. Create Cohort assigned to this teacher
      const grade = sIdx === 0 ? 4 : 6; 
      const cohortName = `Primary ${grade}${tIdx === 1 ? 'A' : 'B'}`;
      const cohortId = `cohort-${school.id}-${grade}${tIdx === 1 ? 'A' : 'B'}`;
      
      batch.set(doc(db, 'cohorts', cohortId), {
        name: cohortName,
        schoolId: school.id,
        teacherId: teacherId,
        gradeLevel: grade,
      });

      cohortData.push({ id: cohortId, schoolId: school.id, name: cohortName, grade, teacherId });
    });
  });

  const now = Date.now();
  const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;

  // 5. Create 40 Students (10 per cohort) + Assessment History
  cohortData.forEach((cohort) => {
    for (let i = 1; i <= 10; i++) {
      const studentId = `student-${cohort.id}-${i}`;
      const hasSen = Math.random() < 0.15; // ~15% SEN
      
      batch.set(doc(db, 'students', studentId), {
        name: generateName(),
        grade: cohort.name,
        cohortId: cohort.id,
        numericGradeLevel: cohort.grade,
        schoolId: cohort.schoolId,
        primaryLanguage: getRandomElement(PRIMARY_LANGUAGES),
        dataProcessingConsent: true,
        createdAt: now - Math.floor(Math.random() * threeMonthsMs),
        ...(hasSen ? { officialSenStatus: getRandomElement(SEN_STATUSES) } : {}),
      });

      // Generate 3-5 Assessments per student
      const assessmentCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < assessmentCount; j++) {
        const assessmentId = `assess-${studentId}-${j}`;
        const template = getRandomElement(ASSESSMENT_TEMPLATES);
        const rawScore = 40 + Math.floor(Math.random() * 56); // 40-95
        
        // Spread over last 3 months
        const updatedAt = now - (Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);

        batch.set(doc(db, 'assessments', assessmentId), {
          studentId,
          type: template.type,
          diagnosis: template.diagnosis,
          score: rawScore,
          rawScore: rawScore,
          masteryLevel: getMasteryLevel(rawScore),
          schoolId: cohort.schoolId,
          cohortId: cohort.id,
          updatedAt: updatedAt,
          timestamp: updatedAt,
          status: 'Completed',
          createdByUserId: cohort.teacherId
        });
      }
    }
  });

  // Execute Batch
  try {
    await batch.commit();
    console.log('✅ Demo environment successfully seeded with Ghanaian school data and history.');
  } catch (error) {
    console.error('❌ Failed to seed demo environment:', error);
    throw error;
  }
}
