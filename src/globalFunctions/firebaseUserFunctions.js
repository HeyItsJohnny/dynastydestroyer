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
  getDocs,
} from "firebase/firestore";

//JCL USED
export async function getTeamDataByID(uid,teamid) {
  try {
    const docRef = doc(db, "userprofile", uid, "teams", teamid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Document does not exist");
    }
  } catch (error) {
    console.error("Error fetching player stats:", error);
    throw error; // Propagate the error
  }
}

//JCL USED
export async function updateTeamSettings(uid, teamid, teamname, ismyteam, teamamount) {
  try {
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "teams",
        teamid
      ),
      {
        TeamName: teamname ?? "",
        MyTeam: ismyteam ?? false,
        TeamAmount: teamamount ?? 0
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function createBigDawgsTeam(uid, teamname) {
  try {
    await addDoc(collection(db, "userprofile", uid, "teams"), {
      TeamName: teamname
    });
  } catch (error) {
    alert("Error adding data to Database: " + error);
  }
}

//JCL USED
export async function updateBigDawgsTeam(uid, teamid, teamname) {
  try {
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "teams",
        teamid
      ),
      {
        TeamName: teamname ?? "",
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function createOrUpdateTierData(uid, playerData, tier) {
  const docRef = doc(
    db,
    "userprofile",
    uid,
    "playertiers",
    playerData.DatabaseID
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updatePlayerTierData(uid, playerData, tier);
  } else {
    createPlayerTierData(uid, playerData, tier);
  }
}

//JCL USED
export async function createPlayerTierData(uid, playerData, tier) {
  try {
    await setDoc(
      doc(
        db,
        "userprofile",
        uid,
        "playertiers",
        playerData.DatabaseID
      ),
      {
        FullName: playerData.FullName ?? "",
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier ?? "",
        DatabaseID: playerData.DatabaseID ?? "",
        Team: playerData.Team ?? "",
        Position: playerData.Position ?? "",
        Tier: tier,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function updatePlayerTierData(uid, playerData, tier) {
  try {
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "playertiers",
        playerData.DatabaseID
      ),
      {
        FullName: playerData.FullName ?? "",
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
        DatabaseID: playerData.DatabaseID,
        Team: playerData.Team ?? "",
        Position: playerData.Position ?? "",
        Tier: tier,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL Used
export async function updatePlayerTier(uid, id, tier) {
  try {
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "playertiers",
        id
      ),
      {
        Tier: tier,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL Used
export async function deletePlayerTierData(uid, playerData) {
  try {
    await deleteDoc(
      doc(
        db,
        "userprofile",
        uid,
        "playertiers",
        playerData.DatabaseID
      )
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export function getUserTierList(uid, positionToSearch, callback, errorCallback) {
  const docCollection = query(
    collection(db, "userprofile", uid, "playertiers"),
    where("Position", "==", positionToSearch),
  );

  const unsubscribe = onSnapshot(
    docCollection,
    (querySnapshot) => {
      const list = querySnapshot.docs.map(doc => ({
        Id: doc.id,
        FullName: doc.data().FullName,
        KeepTradeCutIdentifier: doc.data().KeepTradeCutIdentifier,
        DatabaseID: doc.data().DatabaseID,
        Position: doc.data().Position,
        Team: doc.data().Team,
        Tier: doc.data().Tier
      }));
      callback(list); // Pass updated data to your component
    },
    (error) => {
      if (errorCallback) errorCallback(error);
    }
  );

  return unsubscribe; // Return so we can clean it up later
}


