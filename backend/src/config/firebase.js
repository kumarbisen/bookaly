import admin from 'firebase-admin';

let firebaseApp;

const loadServiceAccount = () => {
  const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!encodedServiceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable');
  }

  const decodedServiceAccount = Buffer.from(encodedServiceAccount, 'base64').toString('utf8').trim();
  const serviceAccountJson = decodedServiceAccount.startsWith('{') ? decodedServiceAccount : encodedServiceAccount;
  const serviceAccount = JSON.parse(serviceAccountJson);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
};

export const getFirebaseAdminApp = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  const serviceAccount = loadServiceAccount();
  firebaseApp = admin.apps.length ? admin.app() : admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return firebaseApp;
};

export default admin;