// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// TODO: Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDY4Krtj2eMKObfhK-BK0If8YXwKgreq6A",
  authDomain: "bonkblitz-8f2f2.firebaseapp.com",
  projectId: "bonkblitz-8f2f2",
  storageBucket: "bonkblitz-8f2f2.firebasestorage.app",
  messagingSenderId: "1041721651848",
  appId: "1:1041721651848:web:6b18a9406c46f04dd9a53d",
  measurementId: "G-YXX0FC6QYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;