import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { createUserProfile } from "../globalFunctions/firebaseFunctions";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [currentUserProfile, setCurrentUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function signup(email, password, fullname) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    createUserProfile(email, fullname, result.user.uid);
  }

  async function login(email, password) {
    //return await signInWithEmailAndPassword(auth, email, password);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return "";
    } catch (error) {
      return error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function updateFirebaseEmail(email) {
    return updateEmail(currentUser, email);
  }

  function updateFirebasePassword(password) {
    return updatePassword(currentUser, password);
  }

  const fetchUserData = async (uid) => {
    try {
      const docRef = doc(db, "userprofile", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentUserProfile(docSnap.data());
      }
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      //fetchUserData(user.uid);
      setLoading(false);
      setError("");
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    currentUserProfile,
    login,
    signup,
    logout,
    resetPassword,
    updateFirebaseEmail,
    updateFirebasePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
