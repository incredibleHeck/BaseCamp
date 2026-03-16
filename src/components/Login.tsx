import React, { useState } from 'react';
import { User, Building2, School, Loader2, Lock } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { addStudent } from '../services/studentService';
import { saveAssessment } from '../services/assessmentService';

type Role = 'teacher' | 'headteacher' | 'district';

export function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState<Role | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const handleDemoLogin = async (role: Role) => {
    setIsLoggingIn(role);
    const email = `${role}@basecamp.com`;
    const password = 'HeckTeck@2026!';
    
    try {
      // Mock role assignment by storing it in localStorage before signing in
      localStorage.setItem('mockUserRole', role);
      await signInWithEmailAndPassword(auth, email, password);
      // App.tsx's onAuthStateChanged listener handles the rest
    } catch (error) {
      console.error(`Authentication failed for ${role}:`, error);
      setIsLoggingIn(null);
      alert('Login failed. Please check the console for details.');
    }
  };

  const handleSeedDemoData = async () => {
    if (seedDone || isSeeding) return;
    setIsSeeding(true);
    try {
      // 1) Wipe existing students and assessments so the demo starts from a clean slate.
      const assessmentsSnap = await getDocs(collection(db, 'assessments'));
      await Promise.all(
        assessmentsSnap.docs.map((d) => deleteDoc(doc(db, 'assessments', d.id)))
      );

      const studentsSnap = await getDocs(collection(db, 'students'));
      await Promise.all(
        studentsSnap.docs.map((d) => deleteDoc(doc(db, 'students', d.id)))
      );

      // 2) Seed fresh demo students and assessments.
      const demoStudents = [
        { name: 'Kofi Boateng', grade: 'Primary 6A' },
        { name: 'Esi Mensah', grade: 'Primary 6B' },
        { name: 'Yaw Asante', grade: 'Primary 6C' },
        { name: 'Ama Owusu', grade: 'Primary 6A' },
        { name: 'Kwame Adjei', grade: 'Primary 6B' },
      ];

      const numeracyTemplates = [
        {
          diagnosis: 'Struggles with fraction equivalence when denominators differ.',
          masteredConcepts: 'Understands basic addition and subtraction of whole numbers.',
          gapTags: ['Fraction Equivalence', 'Word Problems'],
          masteryTags: ['Addition', 'Subtraction'],
          remedialPlan:
            'Use bottle caps to group fractions with different denominators and show they represent the same quantity.',
          lessonPlan: {
            title: 'Bottle Cap Fractions',
            instructions: [
              'Give the learner 8 bottle caps and draw two fraction bars on paper.',
              'Label one bar 1/2 and the other 2/4.',
              'Ask the learner to group caps to show each fraction and discuss why they are the same amount.',
            ],
          },
        },
        {
          diagnosis: 'Has difficulty performing multi-step word problems involving division with remainders.',
          masteredConcepts: 'Comfortable with single-step multiplication facts up to 5×5.',
          gapTags: ['Division Word Problems', 'Remainders'],
          masteryTags: ['Multiplication Facts'],
          remedialPlan:
            'Use stones in small groups to act out sharing scenarios, asking the learner to explain what the remainder represents.',
          lessonPlan: {
            title: 'Sharing Stones Fairly',
            instructions: [
              'Give the learner 15 stones and draw 4 circles on the ground.',
              'Ask them to share the stones equally among the circles.',
              'Discuss how many are in each group and what to do with the leftover stones.',
            ],
          },
        },
      ];

      const literacyTemplates = [
        {
          diagnosis: 'Struggles to infer meaning from short paragraphs even when decoding is accurate.',
          masteredConcepts: 'Can read simple sentences with familiar vocabulary.',
          gapTags: ['Reading Comprehension', 'Inference'],
          masteryTags: ['Decoding'],
          remedialPlan:
            'Use a short local story and pause after each sentence to ask the learner to retell it in their own words.',
          lessonPlan: {
            title: 'Retell the Story',
            instructions: [
              'Choose a 4–5 sentence story in simple English.',
              'Read each sentence aloud and ask the learner to explain it in their own words.',
              'At the end, ask them to retell the full story without looking at the page.',
            ],
          },
        },
        {
          diagnosis: 'Has difficulty sounding out multi-syllable words and often guesses based on the first letter.',
          masteredConcepts: 'Recognises most single-syllable high-frequency words.',
          gapTags: ['Phonics', 'Multi-syllable Words'],
          masteryTags: ['High-frequency Words'],
          remedialPlan:
            'Break longer words into claps or beats and let the learner tap each syllable while reading it slowly.',
          lessonPlan: {
            title: 'Clap the Syllables',
            instructions: [
              'Write 5 common two- and three-syllable words on paper (e.g. “teacher”, “banana”).',
              'Say each word together and clap for each syllable.',
              'Ask the learner to read the word slowly while tapping each syllable with their finger.',
            ],
          },
        },
      ];

      const studentIds: string[] = [];
      for (const s of demoStudents) {
        const id = await addStudent(s);
        if (id) studentIds.push(id);
      }

      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      for (let index = 0; index < studentIds.length; index++) {
        const studentId = studentIds[index];
        const count = 2 + Math.floor(Math.random() * 3); // 2–4 assessments
        for (let i = 0; i < count; i++) {
          const daysAgo = 1 + i * 3;
          const isNumeracy = i % 2 === 0;
          const template = isNumeracy
            ? numeracyTemplates[(index + i) % numeracyTemplates.length]
            : literacyTemplates[(index + i) % literacyTemplates.length];

          await saveAssessment({
            studentId,
            type: isNumeracy ? 'Numeracy' : 'Literacy',
            diagnosis: template.diagnosis,
            masteredConcepts: template.masteredConcepts,
            gapTags: template.gapTags,
            masteryTags: template.masteryTags,
            remedialPlan: template.remedialPlan,
            lessonPlan: template.lessonPlan,
            timestamp: now - daysAgo * oneDayMs,
            status: 'Completed',
          });
        }
      }

      setSeedDone(true);
      alert('Demo students and assessments seeded successfully.');
    } catch (error) {
      console.error('Seeding demo data failed', error);
      alert('Seeding demo data failed. Check the console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative background elements for a polished look */}
      <div className="absolute top-0 left-0 w-full h-96 bg-amber-500 transform -skew-y-6 -translate-y-32 z-0"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
              <span className="text-black font-bold text-2xl tracking-tighter">HT</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">BaseCamp Diagnostics</h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">by HeckTeck</p>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">Select your access level</h2>
            <div className="space-y-3">
              <RoleCard 
                role="teacher" 
                icon={<User />} 
                title="Teacher Portal" 
                desc="Manage classroom & assessments" 
                onClick={() => handleDemoLogin('teacher')}
                isLoading={isLoggingIn === 'teacher'}
                disabled={isLoggingIn !== null}
              />
              <RoleCard 
                role="headteacher" 
                icon={<School />} 
                title="Headteacher Portal" 
                desc="Monitor school performance" 
                onClick={() => handleDemoLogin('headteacher')}
                isLoading={isLoggingIn === 'headteacher'}
                disabled={isLoggingIn !== null}
              />
              <RoleCard 
                role="district" 
                icon={<Building2 />} 
                title="District Director Portal" 
                desc="View regional analytics" 
                onClick={() => handleDemoLogin('district')}
                isLoading={isLoggingIn === 'district'}
                disabled={isLoggingIn !== null}
              />
            </div>

            {import.meta.env.DEV && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleSeedDemoData}
                  disabled={isSeeding || seedDone}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-dashed border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Seeding demo data…
                    </>
                  ) : seedDone ? (
                    <>Demo data seeded</>
                  ) : (
                    <>Seed demo students & assessments</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
            <Lock size={12} /> Secure Demo Access
          </p>
          <p className="text-[10px] text-gray-400">
            Protected by end-to-end encryption • Ghana Data Protection Compliant
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean mapping
function RoleCard({ 
  role, 
  icon, 
  title, 
  desc, 
  onClick, 
  isLoading,
  disabled
}: { 
  role: string, 
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  onClick: () => void,
  isLoading: boolean,
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full group relative flex items-center p-4 border rounded-xl transition-all duration-200 text-left bg-white ${
        disabled 
          ? 'opacity-60 cursor-not-allowed border-gray-200' 
          : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
      }`}
    >
      <div className={`p-3 rounded-lg transition-colors ${
        isLoading 
          ? 'bg-blue-100 text-blue-600' 
          : disabled 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
      }`}>
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })
        )}
      </div>
      <div className="ml-4 flex-grow">
        <p className={`text-base font-bold ${disabled && !isLoading ? 'text-gray-500' : 'text-gray-900'}`}>
          {title}
        </p>
        <p className={`text-xs ${disabled && !isLoading ? 'text-gray-400' : 'text-gray-500'}`}>
          {isLoading ? 'Authenticating...' : desc}
        </p>
      </div>
    </button>
  );
}
