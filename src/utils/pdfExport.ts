import { jsPDF } from 'jspdf';
import type { Assessment } from '../services/assessmentService';
import type { FallbackHistoricalRecord } from './studentProfileHelpers';
import { formatAssessmentDateTime } from './studentProfileHelpers';

export function exportStudentProfilePdf(params: {
  studentName: string;
  studentGrade: string;
  hasRealData: boolean;
  history: Assessment[];
  realReadinessScore: number;
  fallbackHistoricalData: FallbackHistoricalRecord[];
  predictiveReadinessSummary: string;
}): void {
  const {
    studentName,
    studentGrade,
    hasRealData,
    history,
    realReadinessScore,
    fallbackHistoricalData,
    predictiveReadinessSummary,
  } = params;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  const maxWidth = 180;
  let y = 20;
  const lineHeight = 6;
  const smallLineHeight = 5;

  const addText = (text: string, fontSize?: number, isBold?: boolean) => {
    if (y > 277) {
      doc.addPage();
      y = 20;
    }
    if (fontSize) doc.setFontSize(fontSize);
    if (isBold) doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * (fontSize && fontSize <= 10 ? smallLineHeight : lineHeight);
    if (isBold) doc.setFont('helvetica', 'normal');
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Profile Report', margin, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  addText(`${studentName} — ${studentGrade}`);
  y += 4;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Longitudinal History', margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (hasRealData) {
    history.forEach((assessment) => {
      const dateStr = formatAssessmentDateTime(assessment.timestamp);
      addText(`${assessment.type} Assessment — ${dateStr}`, 10, true);
      addText('Diagnosis:', 10, true);
      addText(assessment.diagnosis, 10);
      addText('Recommended Remedial Plan:', 10, true);
      addText(assessment.remedialPlan, 10);
      y += 4;
    });
    doc.setFont('helvetica', 'bold');
    addText(`JHS Readiness Score: ${realReadinessScore}% (based on ${history.length} assessment(s))`, 11);
    doc.setFont('helvetica', 'normal');
    addText(
      realReadinessScore >= 70
        ? 'Student is on track for Junior High School.'
        : 'Student requires targeted intervention using the recommended lesson plans to reach JHS readiness.',
      10
    );
  } else {
    addText('No AI assessments on record. Baseline / placeholder summary below.', 10);
    y += 2;
    fallbackHistoricalData.forEach((record) => {
      addText(`${record.grade}: ${record.notes}`, 10);
      addText(`Literacy ${record.literacy}% — Numeracy ${record.numeracy}%`, 10);
      y += 2;
    });
    addText(predictiveReadinessSummary, 10, true);
  }

  const safeName = studentName.replace(/[^a-zA-Z0-9\s-]/g, '').trim() || 'Student';
  doc.save(`BaseCamp-Report-${safeName}.pdf`);
}
