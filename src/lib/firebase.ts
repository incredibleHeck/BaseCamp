/**
 * Firebase Initialization for BaseCamp Diagnostics
 * 
 * To set up Firebase, add the following variables to your .env file:
 * 
 * VITE_FIREBASE_API_KEY=your_api_key
 * VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=your_project_id
 * VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
 * VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
 * VITE_FIREBASE_APP_ID=your_app_id
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
};

const hasValidConfig =
  typeof firebaseConfig.apiKey === 'string' &&
  firebaseConfig.apiKey.length > 0 &&
  typeof firebaseConfig.projectId === 'string' &&
  firebaseConfig.projectId.length > 0;

let app: FirebaseApp;
try {
  if (!hasValidConfig) {
    console.warn(
      'BaseCamp: Firebase env vars (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.) are missing or empty. Using placeholder config so the app can load. Sign-in and data will not work until you add a .env file.'
    );
    app = initializeApp({
      apiKey: 'demo-basecamp',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo-basecamp',
      storageBucket: 'demo-basecamp.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
    });
  } else {
    app = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error('BaseCamp: Firebase initialization failed.', error);
  app = initializeApp({
    apiKey: 'demo-basecamp',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo-basecamp',
    storageBucket: 'demo-basecamp.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
  });
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
