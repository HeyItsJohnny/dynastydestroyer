import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzmbqfVNR5OtYc0MwbKR8gHexbF4Ti5rI",
  authDomain: "dynastydestroyerapp.firebaseapp.com",
  projectId: "dynastydestroyerapp",
  storageBucket: "dynastydestroyerapp.appspot.com",
  messagingSenderId: "989034933670",
  appId: "1:989034933670:web:91fcbbf35eb082e1df3367",
  measurementId: "G-R81CCPKM57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
