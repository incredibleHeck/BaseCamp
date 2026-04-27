import admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

async function inspectData() {
  console.log("🔍 Inspecting Firestore data for organization consistency...");
  
  const userEmail = 'owner@sandbox-edu.com';
  const usersSnap = await db.collection('users').where('email', '==', userEmail).get();
  
  if (usersSnap.empty) {
    console.error(`❌ User ${userEmail} not found in Firestore.`);
    // Let's also look for any org_admin just in case the email is different
    const anyOrgAdmin = await db.collection('users').where('role', '==', 'org_admin').limit(1).get();
    if (!anyOrgAdmin.empty) {
      const u = anyOrgAdmin.docs[0].data();
      console.log(`💡 Found an org_admin with email: ${u.email}, ID: ${anyOrgAdmin.docs[0].id}`);
    }
    return;
  }

  const userDoc = usersSnap.docs[0];
  const userData = userDoc.data();
  const userOrgId = userData.organizationId || userData.districtId;
  
  console.log(`👤 User: ${userEmail}`);
  console.log(`   UID: ${userDoc.id}`);
  console.log(`   organizationId: ${userData.organizationId}`);
  console.log(`   districtId: ${userData.districtId}`);
  console.log(`   Effective Org ID: ${userOrgId}`);

  if (!userOrgId) {
    console.error("❌ This user has no organizationId or districtId assigned.");
    return;
  }

  console.log("\n🏫 Inspecting schools...");
  const schoolsSnap = await db.collection('schools').get();
  
  let foundMatch = false;
  schoolsSnap.forEach(doc => {
    const s = doc.data();
    const match = (s.organizationId === userOrgId || s.districtId === userOrgId);
    if (match) foundMatch = true;
    
    console.log(`📍 School: "${s.name}"`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   organizationId: ${s.organizationId}`);
    console.log(`   districtId: ${s.districtId}`);
    console.log(`   MATCH: ${match ? '✅ YES' : '❌ NO'}`);
    
    // If it's a mismatch but looks like it SHOULD belong (e.g. legacy field)
    if (!match && !s.organizationId && !s.districtId) {
       console.log("   ⚠️ School has NO organization ID assigned.");
    }
  });

  if (!foundMatch) {
    console.warn("\n⚠️ No schools currently match this Org Admin's ID.");
  }
}

inspectData().catch(console.error);
