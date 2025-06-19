// firebase.js
// Import Firebase SDKs
import firebase from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
import 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
import 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD54FxWUlPn03bxD0UnD0oxVcMkI9ovCeQ",
  authDomain: "community-604af.firebaseapp.com",
  databaseURL: "https://community-604af-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "community-604af",
  storageBucket: "community-604af.appspot.com",
  messagingSenderId: "735063146170",
  appId: "1:735063146170:web:725bce2c3c64afc0f30c83",
  measurementId: "G-7YD8RLH33Q"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const auth = firebase.auth();
const database = firebase.database();
const firestore = firebase.firestore();

export { auth, database, firestore };
