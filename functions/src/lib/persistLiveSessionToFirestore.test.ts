import { describe, it, expect } from 'vitest';
import { gradeLiveAnswers, liveSessionAssessmentDocId } from './persistLiveSessionToFirestore.js';

describe('gradeLiveAnswers', () => {
  const questions = [
    { id: 'q1', correctIndex: 0 },
    { id: 'q2', correctIndex: 2 },
    { id: 'q3', correctIndex: 1 },
  ];

  it('scores all correct', () => {
    const answers = {
      q1: { student1: 0 },
      q2: { student1: 2 },
      q3: { student1: 1 },
    };
    const result = gradeLiveAnswers(questions, answers, 'student1');
    expect(result).toEqual({ correct: 3, total: 3, score: 100 });
  });

  it('scores all wrong', () => {
    const answers = {
      q1: { student1: 1 },
      q2: { student1: 0 },
      q3: { student1: 0 },
    };
    const result = gradeLiveAnswers(questions, answers, 'student1');
    expect(result).toEqual({ correct: 0, total: 3, score: 0 });
  });

  it('scores partial answers', () => {
    const answers = {
      q1: { student1: 0 },
      q2: { student1: 1 },
      q3: { student1: 1 },
    };
    const result = gradeLiveAnswers(questions, answers, 'student1');
    expect(result).toEqual({ correct: 2, total: 3, score: 67 });
  });

  it('handles missing answers for student', () => {
    const answers = {
      q1: { otherStudent: 0 },
    };
    const result = gradeLiveAnswers(questions, answers, 'student1');
    expect(result).toEqual({ correct: 0, total: 3, score: 0 });
  });

  it('handles null answers', () => {
    const result = gradeLiveAnswers(questions, null, 'student1');
    expect(result).toEqual({ correct: 0, total: 3, score: 0 });
  });

  it('handles empty questions', () => {
    const result = gradeLiveAnswers([], { q1: { s: 0 } }, 's');
    expect(result).toEqual({ correct: 0, total: 0, score: 0 });
  });

  it('coerces string answers to numbers', () => {
    const answers = { q1: { s: '0' } };
    const result = gradeLiveAnswers(questions.slice(0, 1), answers, 's');
    expect(result).toEqual({ correct: 1, total: 1, score: 100 });
  });
});

describe('liveSessionAssessmentDocId', () => {
  it('produces deterministic id', () => {
    expect(liveSessionAssessmentDocId('sess-123', 'stu-456')).toBe('ls_sess-123_stu-456');
  });

  it('replaces forward slashes in session id', () => {
    expect(liveSessionAssessmentDocId('a/b/c', 'stu')).toBe('ls_a_b_c_stu');
  });
});
