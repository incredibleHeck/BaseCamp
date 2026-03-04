import React, { useState } from 'react';
import { Download, User, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Mountain, LineChart, Flag } from 'lucide-react';

// 1. Data Models
export interface HistoricalScore {
  grade: string;
  literacy: number;
  numeracy: number;
  notes: string;
}

export interface StudentData {
  id: string;
  name: string;
  currentGrade: string;
  historicalData: HistoricalScore[];
  masteredConceptsCount: number; // Used for the gamified view
}

interface StudentProfileProps {
  student?: StudentData;
}

type ReadinessLevel = 'High' | 'Medium' | 'Low';

interface Readiness {
  level: ReadinessLevel;
  color: string;
  icon: React.ReactNode;
}

// 2. Helper Functions (Safeguarded)
const calculateTrajectory = (scores: number[]) => {
  if (!scores || scores.length < 2) return 0;
  return (scores[scores.length - 1] - scores[0]) / (scores.length - 1);
};

const getReadinessDetails = (finalScore: number, trajectory: number): Readiness => {
  if (finalScore >= 70 && trajectory >= -5) {
    return { level: 'High', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> };
  }
  if (finalScore < 50 || trajectory < -10) {
    return { level: 'Low', color: 'text-red-700 bg-red-50 border-red-200', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> };
  }
  return { level: 'Medium', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: <AlertTriangle className="w-5 h-5 text-yellow-600" /> };
};

export function StudentProfile({ student }: StudentProfileProps) {
  const [viewMode, setViewMode] = useState<'analytical' | 'gamified'>('analytical');

  // Fallback data if API hasn't loaded yet
  const data = student || {
    id: '1',
    name: 'Kwame Mensah',
    currentGrade: 'Primary 6 - Transitioning to JHS 1',
    masteredConceptsCount: 15,
    historicalData: [
      { grade: 'Primary 4', literacy: 60, numeracy: 50, notes: 'Baseline: Needs Intervention (Fractions)' },
      { grade: 'Primary 5', literacy: 70, numeracy: 45, notes: 'Mid-Year: Approaching Target' },
      { grade: 'Primary 6', literacy: 75, numeracy: 40, notes: 'Recent AI Diagnosis: Critical Gap' },
    ]
  };

  const numeracyScores = data.historicalData.map(d => d.numeracy);
  const numeracyTrajectory = calculateTrajectory(numeracyScores);
  const numeracyReadiness = getReadinessDetails(numeracyScores[numeracyScores.length - 1], numeracyTrajectory);

  const literacyScores = data.historicalData.map(d => d.literacy);
  const literacyTrajectory = calculateTrajectory(literacyScores);
  const literacyReadiness = getReadinessDetails(literacyScores[literacyScores.length - 1], literacyTrajectory);
  
  const isHighRisk = numeracyReadiness.level === 'Low' || literacyReadiness.level === 'Low';

  // Calculate mountain progress (max 20 concepts for demo)
  const mountainProgress = Math.min((data.masteredConceptsCount / 20) * 100, 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 w-full animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-2 border-blue-200 shrink-0 shadow-inner">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
            <p className="text-gray-600 font-medium">{data.currentGrade}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 3. View Toggle for Gamification */}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setViewMode('analytical')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'analytical' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LineChart size={16} /> Data View
            </button>
            <button 
              onClick={() => setViewMode('gamified')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'gamified' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Mountain size={16} /> Student View
            </button>
          </div>
          <button className="hidden sm:inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {viewMode === 'analytical' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
          {/* Analytical View (Left: History, Right: Skills & Risk) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Longitudinal History</h3>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
              {[...data.historicalData].reverse().map((record, index) => (
                <div key={record.grade} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                    index === 0 ? 'bg-red-500' : index === 1 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}></div>
                  <h4 className="font-semibold text-gray-900">{record.grade}</h4>
                  <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Skill Progression</h3>
              <div className="space-y-6">
                {/* Literacy Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Literacy</span>
                      {literacyTrajectory >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{literacyScores[literacyScores.length - 1]}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${literacyScores[literacyScores.length - 1]}%` }}></div>
                  </div>
                </div>

                {/* Numeracy Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Numeracy</span>
                      {numeracyTrajectory >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                    </div>
                    <span className="text-sm font-bold text-orange-600">{numeracyScores[numeracyScores.length - 1]}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${numeracyScores[numeracyScores.length - 1]}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Risk Analysis Card */}
            <div className={`rounded-xl p-5 border ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-base font-bold ${isHighRisk ? 'text-red-900' : 'text-gray-900'}`}>Predictive JHS 1 Readiness</h3>
                  <p className={`text-xs mt-1 ${isHighRisk ? 'text-red-700' : 'text-gray-500'}`}>Based on trajectory analysis</p>
                </div>
                {isHighRisk && <AlertTriangle className="text-red-600" size={20} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium block mb-1">Numeracy Risk</span>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${numeracyReadiness.color}`}>
                    {numeracyReadiness.icon} {numeracyReadiness.level} Readiness
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium block mb-1">Literacy Risk</span>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${literacyReadiness.color}`}>
                    {literacyReadiness.icon} {literacyReadiness.level} Readiness
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 4. The Gamified Mountain View */
        <div className="py-8 animate-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Your BaseCamp Journey</h3>
            <p className="text-gray-500">Master concepts to plant your flag at the JHS Summit!</p>
          </div>
          
          <div className="relative w-full max-w-2xl h-64 bg-gradient-to-t from-purple-50 to-white rounded-2xl border border-purple-100 overflow-hidden flex items-end justify-center pb-8">
            {/* Simple CSS Mountain representation */}
            <div className="absolute bottom-0 w-[120%] h-48 bg-purple-100 rounded-[100%] blur-sm translate-y-24"></div>
            <div className="absolute bottom-0 w-3/4 h-56 bg-purple-200 rounded-[100%] translate-y-16"></div>
            <div className="absolute bottom-0 w-1/2 h-64 bg-purple-300 rounded-t-[100%]"></div>
            
            {/* Student Progress Indicator */}
            <div 
              className="absolute z-10 transition-all duration-1000 ease-out flex flex-col items-center"
              style={{ bottom: `${mountainProgress}%`, left: '50%', transform: 'translateX(-50%)' }}
            >
              <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-purple-700 shadow-md mb-2 animate-bounce">
                {data.masteredConceptsCount} Concepts Mastered!
              </div>
              <Flag className="text-red-500 fill-red-500 w-8 h-8" />
            </div>

            {/* Summit Label */}
            <div className="absolute top-4 font-black text-purple-900/40 text-xl tracking-widest">
              JHS SUMMIT
            </div>
          </div>
        </div>
      )}
    </div>
  );
}