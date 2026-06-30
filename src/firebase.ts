import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBl-qaaugXQFqzDdFdDaTwTY0OfQs6Kaok",
  authDomain: "nairobi-rental-finder-d2e2f.firebaseapp.com",
  projectId: "nairobi-rental-finder-d2e2f",
  storageBucket: "nairobi-rental-finder-d2e2f.firebasestorage.app",
  messagingSenderId: "123769038952",
  appId: "1:123769038952:web:8aaac371b8d00e0887f3dd",
  measurementId: "G-SSDH6WEVK3"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with the default database
const db = getFirestore(app);

const storage = getStorage(app);

export { app, auth, db, storage, googleProvider };
