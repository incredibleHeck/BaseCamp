import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info, Loader2 } from 'lucide-react';
import type { Assessment } from '../services/assessmentService';
import type { SenRiskReport } from '../services/aiPrompts';
import { formatAssessmentDateTime, type FallbackHistoricalRecord, type Readiness } from '../utils/studentProfileHelpers';

interface StudentProfileAnalyticalViewProps {
  hasRealData: boolean;
  history: Assessment[];
  fallbackHistoricalData: FallbackHistoricalRecord[];
  realReadinessScore: number;
  numeracyScores: number[];
  literacyScores: number[];
  numeracyTrajectory: number;
  literacyTrajectory: number;
  numeracyReadiness: Readiness;
  literacyReadiness: Readiness;
  isHighRisk: boolean;
  recentGaps: string[];
  recentMastery: string[];
  senReport: SenRiskReport | null;
  isAnalyzingSEN: boolean;
  onRunDeepPatternAnalysis: () => void;
}

export function StudentProfileAnalyticalView({
  hasRealData,
  history,
  fallbackHistoricalData,
  realReadinessScore,
  numeracyScores,
  literacyScores,
  numeracyTrajectory,
  literacyTrajectory,
  numeracyReadiness,
  literacyReadiness,
  isHighRisk,
  recentGaps,
  recentMastery,
  senReport,
  isAnalyzingSEN,
  onRunDeepPatternAnalysis,
}: StudentProfileAnalyticalViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Longitudinal History</h3>

        {hasRealData ? (
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
            {history.map((assessment, index) => {
              const isRecent = index === 0;
              const dateTimeStr = formatAssessmentDateTime(assessment.timestamp);
              return (
                <div key={assessment.id || index} className="relative pl-6">
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                      isRecent ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                  />
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{assessment.type} Assessment</h4>
                    <span className="text-xs font-medium text-gray-500">{dateTimeStr}</span>
                  </div>
                  {typeof assessment.score === 'number' ? (
                    <p className="text-xs text-slate-600 mt-1">
                      Score: <span className="font-semibold text-slate-900">{assessment.score}</span>/100
                      {assessment.gesObjectiveId ? (
                        <span className="ml-2 text-amber-800">
                          · GES: {assessment.gesObjectiveId}
                          {assessment.gesVerified ? ' (verified)' : ''}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
                    <p className="text-sm text-gray-800 font-semibold mb-1">Diagnosis:</p>
                    <p className="text-sm text-gray-600 mb-3">{assessment.diagnosis}</p>
                    <p className="text-sm text-emerald-800 font-semibold mb-1">Recommended Remedial Plan:</p>
                    <p className="text-sm text-gray-600">{assessment.remedialPlan}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 italic mb-6">
              No real AI assessments found for this student. Showing baseline placeholder data.
            </p>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 opacity-70">
              {[...fallbackHistoricalData].reverse().map((record, index) => (
                <div key={record.grade} className="relative pl-6">
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                  />
                  <h4 className="font-semibold text-gray-900">{record.grade}</h4>
                  <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="space-y-8">
        {hasRealData ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">JHS Readiness Score</h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-lg shadow-sm">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-900 block">Overall Readiness</span>
                    <span className="text-xs text-blue-700 mt-0.5 block">
                      Based on {history.length} recent AI assessments
                    </span>
                  </div>
                </div>
                <span className="text-3xl font-black text-blue-700">{realReadinessScore}%</span>
              </div>
              <div className="w-full bg-blue-200/50 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${realReadinessScore}%` }}
                />
              </div>
              <p className="text-sm text-blue-800 mt-4 font-medium">
                {realReadinessScore >= 70
                  ? 'Student is on track for Junior High School.'
                  : 'Student requires targeted intervention using the recommended lesson plans to reach JHS readiness.'}
              </p>
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Neurodevelopmental & SEN Risk Screening</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Deep pattern analysis across longitudinal assessment history (e.g., Dyslexia, Dyscalculia).
                  </p>
                </div>
              </div>

              {history.length < 3 ? (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Insufficient data. At least 3 assessments over time are required to analyze learning disability
                    patterns.
                  </p>
                </div>
              ) : !senReport ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-700">
                    This scans all historical AI assessments to flag repeated traits consistent with learning differences
                    (e.g., reading/number processing patterns).
                  </p>
                  <button
                    type="button"
                    onClick={onRunDeepPatternAnalysis}
                    disabled={isAnalyzingSEN}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAnalyzingSEN ? <Loader2 size={16} className="animate-spin" /> : null}🔍 Run Deep Pattern Analysis
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-600">Risk Level</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        senReport.riskLevel === 'Low'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : senReport.riskLevel === 'Moderate'
                            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {senReport.riskLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Identified Patterns</h4>
                      {senReport.identifiedPatterns.length > 0 ? (
                        <ul className="space-y-2 text-sm text-gray-700">
                          {senReport.identifiedPatterns.map((p, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-gray-400 shrink-0">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No clear longitudinal patterns detected.</p>
                      )}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Potential Indicators</h4>
                      {senReport.potentialIndicators.length > 0 ? (
                        <ul className="space-y-2 text-sm text-gray-700">
                          {senReport.potentialIndicators.map((p, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-gray-400 shrink-0">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No specific indicators flagged.</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs font-semibold text-indigo-900 mb-1">Specialist Recommendation</p>
                    <p className="text-sm text-indigo-900">{senReport.specialistRecommendation}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Note: This is a pedagogical pattern analysis, not a medical diagnosis. Consult a GES Special
                    Education Coordinator for formal evaluation.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Skill Progression (Baseline)</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Literacy</span>
                    {literacyTrajectory >= 0 ? (
                      <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    {literacyScores[literacyScores.length - 1]}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${literacyScores[literacyScores.length - 1]}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Numeracy</span>
                    {numeracyTrajectory >= 0 ? (
                      <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {numeracyScores[numeracyScores.length - 1]}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${numeracyScores[numeracyScores.length - 1]}%` }}
                  />
                </div>
              </div>
            </div>
            <div
              className={`mt-8 rounded-xl p-5 border ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-base font-bold ${isHighRisk ? 'text-red-900' : 'text-gray-900'}`}>
                    Predictive JHS 1 Readiness
                  </h3>
                  <p className={`text-xs mt-1 ${isHighRisk ? 'text-red-700' : 'text-gray-500'}`}>
                    Based on trajectory analysis
                  </p>
                </div>
                {isHighRisk && <AlertTriangle className="text-red-600" size={20} />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium block mb-1">Numeracy Risk</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${numeracyReadiness.color}`}
                  >
                    {numeracyReadiness.icon} {numeracyReadiness.level} Readiness
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium block mb-1">Literacy Risk</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${literacyReadiness.color}`}
                  >
                    {literacyReadiness.icon} {literacyReadiness.level} Readiness
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-emerald-900 mb-3">🏔️ Mastered Concepts</h3>
            {recentMastery.length > 0 ? (
              <ul className="space-y-2 text-sm text-emerald-800">
                {recentMastery.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-500 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-700/80 italic">No mastered concepts recorded yet.</p>
            )}
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-orange-900 mb-3">🚧 Current Learning Gaps</h3>
            {recentGaps.length > 0 ? (
              <ul className="space-y-2 text-sm text-orange-800">
                {recentGaps.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-orange-500 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-orange-700/80 italic">No learning gaps identified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
