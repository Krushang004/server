// Firebase Admin SDK initialization
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseAdmin;

if (!admin.apps.length) {
  try {
    // Check if we have the service account key as an environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        // Parse the service account key from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields (project_id, private_key, client_email)');
        }
        
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
      } catch (parseError) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}. Make sure it's valid JSON.`);
      }
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Alternative: Use individual environment variables
      try {
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
      } catch (certError) {
        throw new Error(`Failed to initialize Firebase with individual env vars: ${certError.message}`);
      }
    } else {
      // Don't try applicationDefault() on Vercel - it will fail
      throw new Error(
        'Firebase Admin SDK not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable in Vercel. ' +
        'Get it from Firebase Console > Project Settings > Service Accounts > Generate New Private Key'
      );
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
    // Re-throw with a clearer message
    throw error;
  }
} else {
  firebaseAdmin = admin.app();
}

export default firebaseAdmin;
export const auth = firebaseAdmin.auth();


