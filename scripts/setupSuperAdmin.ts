import admin from 'firebase-admin';

// Initialize the Firebase Admin SDK.
// This assumes GOOGLE_APPLICATION_CREDENTIALS is set to your service account JSON path.
admin.initializeApp();

// Credential Configuration
const MY_REAL_EMAIL = 'codingwithhector@gmail.com'; 
const MY_NEW_PASSWORD = 'hectechadm1n';

async function setup() {
  console.log("🚀 Bootstrapping Super Admin for HecTech...");
  
  try {
    let user;
    try {
      // Check if user already exists in Firebase Auth
      user = await admin.auth().getUserByEmail(MY_REAL_EMAIL);
      console.log(`Found existing user identity: ${user.uid}`);
      
      // Force update the password for the existing user
      await admin.auth().updateUser(user.uid, {
        password: MY_NEW_PASSWORD,
        emailVerified: true
      });
      console.log("Password updated successfully.");
    } catch (e) {
      // Create user if they don't exist
      user = await admin.auth().createUser({
        email: MY_REAL_EMAIL,
        password: MY_NEW_PASSWORD,
        emailVerified: true
      });
      console.log(`Created new user identity: ${user.uid}`);
    }

    // 2. Set the Super Admin Badge (Custom Claims)
    // This is the "passport stamp" the app looks for to grant master access
    await admin.auth().setCustomUserClaims(user.uid, { 
      role: 'super_admin' 
    });

    // 3. Sync to Firestore (Ensures UI profile consistency)
    const db = admin.firestore();
    await db.collection('users').doc(user.uid).set({
      email: MY_REAL_EMAIL,
      role: 'super_admin',
      name: 'Hector (Super Admin)',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log("✅ SUCCESS! HecTech Super Admin is ready.");
    console.log(`Email: ${MY_REAL_EMAIL}`);
    console.log(`Password: ${MY_NEW_PASSWORD}`);
    console.log("You can now log in at https://basecamp-pilot.web.app");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setup();
