// js/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDks7wx8Lua2rX-BW6SL_OKd83oRdTRj_Q",
  authDomain: "mini-apps-2c0ad.firebaseapp.com",
  projectId: "mini-apps-2c0ad",
  storageBucket: "mini-apps-2c0ad.appspot.com",
  messagingSenderId: "420068130976",
  appId: "1:420068130976:web:f4d61f2cd1d8d13adcc9c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
