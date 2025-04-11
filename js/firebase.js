// Replace the module specifiers with full URLs from the Firebase CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP2gXpsg_e1kO8vwSuUjVNYC1K5xuyyLU",
  authDomain: "car-management-ihc.firebaseapp.com",
  projectId: "car-management-ihc",
  storageBucket: "car-management-ihc.firebasestorage.app",
  messagingSenderId: "1096272017189",
  appId: "1:1096272017189:web:7e62944a8138e469920ccc",
  measurementId: "G-FH9V6D0XPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app); // Export the auth instance
window.auth = auth; // Make auth available globally for debugging
export const db = getFirestore(app); // Export Firestore database