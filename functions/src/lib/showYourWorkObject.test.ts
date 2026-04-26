import { describe, it, expect } from 'vitest';
import { parseShowYourWorkUpload } from './showYourWorkObject.js';

describe('parseShowYourWorkUpload', () => {
  it('parses valid upload path', () => {
    const result = parseShowYourWorkUpload('students/abc123/showYourWork/1700000000.mp4');
    expect(result).toEqual({
      studentId: 'abc123',
      objectBaseName: '1700000000.mp4',
    });
  });

  it('returns null for non-showYourWork student path', () => {
    expect(parseShowYourWorkUpload('students/abc123/photos/pic.jpg')).toBeNull();
  });

  it('returns null for non-mp4 files', () => {
    expect(parseShowYourWorkUpload('students/abc123/showYourWork/file.webm')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseShowYourWorkUpload('')).toBeNull();
  });

  it('returns null for deeply nested paths', () => {
    expect(parseShowYourWorkUpload('students/abc/showYourWork/sub/file.mp4')).toBeNull();
  });

  it('handles case-insensitive .MP4 extension', () => {
    const result = parseShowYourWorkUpload('students/s1/showYourWork/file.MP4');
    expect(result).toEqual({ studentId: 's1', objectBaseName: 'file.MP4' });
  });

  it('returns null for paths outside students/', () => {
    expect(parseShowYourWorkUpload('uploads/abc/showYourWork/file.mp4')).toBeNull();
  });
});
