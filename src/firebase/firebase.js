import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxMaCYs1tKtCSNJ1WP-fccCQYrptZWgO4",
  authDomain: "planapp-20506.firebaseapp.com",
  projectId: "planapp-20506",
  storageBucket: "planapp-20506.appspot.com",
  messagingSenderId: "255819345433",
  appId: "1:255819345433:web:b26f4aea25bcf6eb044488",
  measurementId: "G-KGXLWQ5FDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
