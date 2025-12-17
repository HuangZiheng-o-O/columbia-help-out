import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAern_h0xwxU3BOb-8Ec1cOIvQAUrDol4w",
  authDomain: "columbia-help-out.firebaseapp.com",
  projectId: "columbia-help-out",
  storageBucket: "columbia-help-out.firebasestorage.app",
  messagingSenderId: "458865852516",
  appId: "1:458865852516:web:1528571df66533bc8e5f71",
  measurementId: "G-VZHG2NC40B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

