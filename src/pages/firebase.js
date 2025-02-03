// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Import collection and getDocs here

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMFrRT_LT0qhzg2ci8Digb3hJYiVk4Uqg",
  authDomain: "official-tasklinkers.firebaseapp.com",
  projectId: "official-tasklinkers",
  storageBucket: "official-tasklinkers.firebasestorage.app",
  messagingSenderId: "835920894065",
  appId: "1:835920894065:web:764eba694c6569abed23d0",
  measurementId: "G-CX2F0Q09VX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

// Export Auth, Firestore, and Google Auth Provider
export { auth, collection, getDocs, googleAuthProvider, db };
