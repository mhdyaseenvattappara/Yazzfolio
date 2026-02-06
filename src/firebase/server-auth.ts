
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

function getServiceAccount() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Cannot authenticate server.');
  }
  try {
    return JSON.parse(serviceAccount);
  } catch (e) {
    throw new Error('Could not parse FIREBASE_SERVICE_ACCOUNT. Make sure it is a valid JSON string.');
  }
}

function initializeAdminApp() {
  if (getApps().some(app => app.name === 'admin-unauthenticated')) {
    return getApp('admin-unauthenticated');
  }

  const serviceAccount = getServiceAccount();

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'admin-unauthenticated');
}

export function getUnauthenticatedFirestore() {
  const app = initializeAdminApp();
  return getFirestore(app);
}
