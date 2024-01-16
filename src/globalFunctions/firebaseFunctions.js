import React, { useState, useEffect } from "react";

import { db } from "../firebase/firebase";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  updateDoc,
  addDoc,
  where,
  getDocs
} from "firebase/firestore";

export async function createUserProfile(email, fullname, uid) {
  try {
    await setDoc(doc(db, "userprofile", uid), {
      Email: email,
      FullName: fullname,
      SleeperUserName: "",
      SleeperUserID: "",
      LastSleeperDataUpdate: null,
      LastKTCDataUpdate: null,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateSleeperUsername(
  uid,
  sleeperusername,
  sleeperuserid
) {
  try {
    await updateDoc(doc(db, "userprofile", uid), {
      SleeperUserName: sleeperusername,
      SleeperUserID: sleeperuserid,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function timestampSleeperData(uid) {
  try {
    await updateDoc(doc(db, "settings", "datasettings"), {
      LastSleeperDataUpdate: new Date(),
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function timestampKTCData(uid) {
  try {
    await updateDoc(doc(db, "settings", "datasettings"), {
      LastKTCDataUpdate: new Date(),
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function saveUserSleeperLeague(uid, leagueid, leaguename) {
  try {
    await setDoc(doc(db, "userprofile", uid, "leagues", leagueid), {
      LeagueName: leaguename
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function deleteLeagueDocument(uid, leagueid) {
  try {
    await deleteDoc(doc(db, "userprofile", uid, "leagues", leagueid));
  } catch (error) {
    alert("Error deleting data from Firestore:", error);
  }
}

export async function createOrUpdatePlayerData(playerData) {
  const docRef = doc(
    db,
    "players",
    playerData.search_full_name +
      "-" +
      playerData.position +
      "-" +
      playerData.team
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updatePlayerData(playerData);
  } else {
    createPlayerData(playerData);
  }
}

export async function createPlayerData(playerData) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(doc(db, "players", playerData.player_id), {
      Age: playerData.age ?? "",
      College: playerData.college ?? "",
      DepthChartOrder: playerData.depth_chart_order ?? 0,
      FirstName: playerData.first_name ?? "",
      FullName: playerData.full_name ?? "",
      InjuryNotes: playerData.injury_notes ?? "",
      InjuryStatus: playerData.injury_status ?? "",
      KeepTradeCutIdentifier: playerData.search_full_name + "-" + playerData.position,
      LastName: playerData.last_name ?? "",
      NonSuperFlexValue: 0,
      Position: playerData.position ?? "",
      SleeperID: playerData.player_id ?? "",
      SearchFirstName: playerData.search_first_name ?? "",
      SearchFullName: playerData.search_full_name ?? "",
      SearchLastName: playerData.search_last_name ?? "",
      SearchRank: playerData.search_rank ?? 0,
      Status: playerData.status ?? "",
      SuperFlexValue: 0,
      Team: playerData.team ?? "",
      YearsExperience: playerData.years_exp ?? "",
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updatePlayerData(playerData) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "players", playerData.player_id), {
      Age: playerData.age ?? "",
      DepthChartOrder: playerData.depth_chart_order ?? 0,
      InjuryNotes: playerData.injury_notes ?? "",
      InjuryStatus: playerData.injury_status ?? "",
      KeepTradeCutIdentifier: playerData.search_full_name + "-" + playerData.position,
      NonSuperFlexValue: 0,
      Position: playerData.position ?? "",
      SleeperID: playerData.player_id ?? "",
      SearchRank: playerData.search_rank ?? 0,
      Status: playerData.status ?? "",
      SuperFlexValue: 0,
      Team: playerData.team ?? "",
      YearsExperience: playerData.years_exp ?? "",
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateFields(collectionName,fieldToSearch,valueToSearch,updatedData) {
  try {
    const q = query(collection(db, collectionName),where(fieldToSearch, "==", valueToSearch));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      updatePlayerValues(doc.id,updatedData)
    });
  } catch (error) {
    console.log("Error updating fields:", error);
  }
}

export async function updatePlayerValues(playerID, updatedData) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "players", playerID), {
      NonSuperFlexValue: parseFloat(updatedData.NonSuperFlexValue),
      SuperFlexValue: parseFloat(updatedData.SuperFlexValue),
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}
