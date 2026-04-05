const admin = require('firebase-admin');

// Read credentials from .env instead of key file
admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

// ─── Helper functions ─────────────────────────────────────────────────────────

const getDoc = async (collection, id) => {
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const getDocs = async (collection) => {
  const snapshot = await db.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const addDoc = async (collection, data) => {
  const ref = await db.collection(collection).add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
};

const updateDoc = async (collection, id, data) => {
  await db.collection(collection).doc(id).update(data);
  return getDoc(collection, id);
};

const deleteDoc = async (collection, id) => {
  await db.collection(collection).doc(id).delete();
};

const queryDocs = async (collection, field, operator, value) => {
  const snapshot = await db.collection(collection).where(field, operator, value).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

module.exports = { db, admin, getDoc, getDocs, addDoc, updateDoc, deleteDoc, queryDocs };