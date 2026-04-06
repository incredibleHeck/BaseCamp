import { GoogleGenerativeAI } from '@google/generative-ai';

export const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set. Please add it to your .env file.');
}

export const genAI = new GoogleGenerativeAI(API_KEY || '');
export const GEMINI_MODEL = 'gemini-3-flash-preview';
