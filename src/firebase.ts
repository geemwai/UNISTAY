import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsISzBTdfdbnaNpQElvvDO0PXeSeQctJo",
  authDomain: "unistay-8d1db.firebaseapp.com",
  projectId: "unistay-8d1db",
  storageBucket: "unistay-8d1db.firebasestorage.app",
  messagingSenderId: "1051507088352",
  appId: "1:1051507088352:web:be6bf07ece829b5925a985",
  measurementId: "G-VHK17TGJF1"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with the default database
const db = getFirestore(app);

const storage = getStorage(app);

export { app, auth, db, storage, googleProvider };
