import React, { useState, useEffect } from "react";

import { db } from "../firebase/firebase";

import {
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export async function createUserProfile(email, fullname, uid) {
    try {
      await setDoc(doc(db, "userprofile", uid), {
        Email: email,
        FullName: fullname,
      });
    } catch (error) {
      console.error("There was an error adding to the database: " + error);
    }
  }