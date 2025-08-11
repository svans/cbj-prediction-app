// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAy6ewwdFfrjhH7CpbO7kPfh2GVh_Inr14",
  authDomain: "cbj-prediction-app-5c396.firebaseapp.com",
  projectId: "cbj-prediction-app-5c396",
  storageBucket: "cbj-prediction-app-5c396.firebasestorage.app",
  messagingSenderId: "595647330061",
  appId: "1:595647330061:web:83808202884b3c9adae244",
  measurementId: "G-B1T3EFJCGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);