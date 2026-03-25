import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'demo-basecamp',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'demo-basecamp',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-basecamp.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'users'));
  console.log(`Found ${snapshot.size} users`);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().username, doc.data().role);
  });
  process.exit(0);
}

check();
