// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMFrRT_LT0qhzg2ci8Digb3hJYiVk4Uqg",
  authDomain: "official-tasklinkers.firebaseapp.com",
  projectId: "official-tasklinkers",
  storageBucket: "official-tasklinkers.appspot.com", // ✅ Fixed storage bucket URL
  messagingSenderId: "835920894065",
  appId: "1:835920894065:web:764eba694c6569abed23d0",
  measurementId: "G-CX2F0Q09VX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleAuthProvider = new GoogleAuthProvider();

// ✅ Helper function: Upload file to Firebase Storage
const uploadFile = async (file, userId, filePath) => {
  try {
    const fileRef = ref(storage, `${filePath}/${userId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// ✅ Helper function: Save user resume URL in Firestore
const saveResumeToFirestore = async (userId, resumeURL) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { resumeName: resumeURL });
  } catch (error) {
    console.error("Error saving resume:", error);
    throw error;
  }
};

// Export Firebase services & functions
export { 
  auth, 
  db, 
  storage, 
  googleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  setDoc, 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  uploadFile, 
  saveResumeToFirestore 
};
