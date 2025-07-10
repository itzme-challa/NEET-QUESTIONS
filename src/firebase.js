import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

let db = null;
let initializationError = null;

try {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
  };

  // Log config (without sensitive data) for debugging
  console.log('Firebase config loaded:', {
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId,
    hasApiKey: !!firebaseConfig.apiKey
  });

  // Validate required config fields
  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration fields: apiKey, databaseURL, or projectId');
  }

  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error.message, error.stack);
  initializationError = `Firebase initialization failed: ${error.message}`;
}

export { db, initializationError };
