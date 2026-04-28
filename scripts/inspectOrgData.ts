import admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

async function inspectData() {
  console.log('🔍 Inspecting Firestore data for organization consistency...');

  const userEmail = 'owner@sandbox-edu.com';
  const usersSnap = await db.collection('users').where('email', '==', userEmail).get();

  if (usersSnap.empty) {
    console.error(`❌ User ${userEmail} not found in Firestore.`);
    const anyOrgAdmin = await db.collection('users').where('role', '==', 'org_admin').limit(1).get();
    if (!anyOrgAdmin.empty) {
      const u = anyOrgAdmin.docs[0].data();
      console.log(`💡 Found an org_admin with email: ${u.email}, ID: ${anyOrgAdmin.docs[0].id}`);
    }
    return;
  }

  const userDoc = usersSnap.docs[0];
  const userData = userDoc.data();
  const userOrgId =
    typeof userData.organizationId === 'string' && userData.organizationId.trim()
      ? userData.organizationId.trim()
      : null;

  console.log(`👤 User: ${userEmail}`);
  console.log(`   UID: ${userDoc.id}`);
  console.log(`   organizationId: ${userData.organizationId}`);
  console.log(`   Effective Org ID: ${userOrgId}`);

  if (!userOrgId) {
    console.error('❌ This user has no organizationId assigned.');
    return;
  }

  console.log('\n🏫 Inspecting schools...');
  const schoolsSnap = await db.collection('schools').get();

  let foundMatch = false;
  schoolsSnap.forEach((docSnap) => {
    const s = docSnap.data();
    const match = s.organizationId === userOrgId;
    if (match) foundMatch = true;

    console.log(`📍 School: "${s.name}"`);
    console.log(`   ID: ${docSnap.id}`);
    console.log(`   organizationId: ${s.organizationId}`);
    console.log(`   MATCH: ${match ? '✅ YES' : '❌ NO'}`);

    if (!match && !s.organizationId) {
      console.log('   ⚠️ School has no organizationId assigned.');
    }
  });

  if (!foundMatch) {
    console.warn('\n⚠️ No schools currently match this Org Admin’s organizationId.');
  }
}

inspectData().catch(console.error);
