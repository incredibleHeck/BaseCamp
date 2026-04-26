import admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
admin.initializeApp();

const uid = process.argv[2];

if (!uid) {
  console.error("Please provide the UID.");
  process.exit(1);
}

console.log(`Setting super_admin claim for UID: ${uid}...`);

admin.auth().setCustomUserClaims(uid, { 
  role: 'super_admin' 
}).then(() => {
  console.log(`Success! User ${uid} is now a Super Admin.`);
  process.exit(0);
}).catch((error) => {
  console.error("Error setting custom claims:", error);
  process.exit(1);
});
