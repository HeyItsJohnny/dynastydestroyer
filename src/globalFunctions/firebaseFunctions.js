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
      SleeperUserName: "",
      SleeperUserID: ""
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateSleeperUsername(uid, sleeperusername, sleeperuserid) {
  try {
    await updateDoc(doc(db, "userprofile", uid), {
      SleeperUserName: sleeperusername,
      SleeperUserID: sleeperuserid
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function saveUserSleeperLeague(uid,leagueid,leaguename) {
  try {
    await setDoc(doc(db, "userprofile", uid,"leagues",leagueid), {
      LeagueName: leaguename
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}
