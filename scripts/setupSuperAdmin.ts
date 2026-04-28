import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin/app';

loadEnv({ path: resolve(process.cwd(), '.env') });

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
if (credPath) {
  const abs = resolve(process.cwd(), credPath);
  if (!existsSync(abs)) {
    console.error('Service account file not found:', abs);
    process.exit(1);
  }
  const sa = JSON.parse(readFileSync(abs, 'utf8')) as ServiceAccount;
  initializeApp({ credential: cert(sa) });
} else {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS in .env to your basecamp-pilot service account JSON (relative or absolute path).');
  process.exit(1);
}

// Must match the Auth user in Firebase (basecamp-pilot). Do not commit real passwords long-term.
const MY_REAL_EMAIL = 'codingwithhector@gmail.com';
const MY_NEW_PASSWORD = 'hectech';

async function setup() {
  const auth = getAuth();
  const db = getFirestore();
  console.log('Bootstrapping Super Admin (basecamp-pilot service account must match this project)...');

  try {
    let user;
    try {
      user = await auth.getUserByEmail(MY_REAL_EMAIL);
      console.log(`Found existing user: ${user.uid}`);

      await auth.updateUser(user.uid, {
        password: MY_NEW_PASSWORD,
        emailVerified: true,
      });
      console.log('Password set / updated.');
    } catch {
      user = await auth.createUser({
        email: MY_REAL_EMAIL,
        password: MY_NEW_PASSWORD,
        emailVerified: true,
      });
      console.log(`Created new user: ${user.uid}`);
    }

    await auth.setCustomUserClaims(user.uid, { role: 'super_admin' });

    await db
      .collection('users')
      .doc(user.uid)
      .set(
        {
          email: MY_REAL_EMAIL,
          role: 'super_admin',
          name: 'Hector (Super Admin)',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log('SUCCESS. Super admin claims + users/{uid} are set.');
    console.log(`Log in: ${MY_REAL_EMAIL} / (password in script — rotate after first login)`);
    console.log('Open: https://basecamp-pilot.web.app — sign out first if a session is cached, then sign in to refresh the token.');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();
