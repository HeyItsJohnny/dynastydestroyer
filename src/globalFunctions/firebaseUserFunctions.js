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

export async function createOrUpdateTierData(uid, playerData, tier) {
  const docRef = doc(
    db,
    "userprofile",
    uid,
    "playertiers",
    playerData.KeepTradeCutIdentifier
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updatePlayerTierData(uid, playerData, tier);
  } else {
    createPlayerTierData(uid, playerData, tier);
  }
}

export async function createPlayerTierData(uid, playerData, tier) {
  try {
    await setDoc(
      doc(
        db,
        "userprofile",
        uid,
        "playertiers",
        playerData.KeepTradeCutIdentifier
      ),
      {
        FullName: playerData.FullName ?? "",
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier ?? "",
        DatabaseID: playerData.SleeperID ?? "",
        Team: playerData.Team ?? "",
        Position: playerData.Position ?? "",
        Tier: tier,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updatePlayerTierData(uid, playerData, tier) {
  try {
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "playertiers",
        playerData.KeepTradeCutIdentifier
      ),
      {
        FullName: playerData.FullName ?? "",
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
        DatabaseID: playerData.SleeperID,
        Team: playerData.Team ?? "",
        Position: playerData.Position ?? "",
        Tier: tier,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function getUserTierList(uid, positionToSearch) {
    return new Promise((resolve, reject) => {
      const docCollection = query(
        collection(db, "userprofile", uid, "playertiers"),
        where("Position", "==", positionToSearch),
      );
      onSnapshot(
        docCollection,
        (querySnapshot) => {
          const list = [];
          querySnapshot.forEach((doc) => {
            var data = {
              Id: doc.id,
              FullName: doc.data().FullName,
              KeepTradeCutIdentifier: doc.data().KeepTradeCutIdentifier,
              DatabaseID: doc.data().DatabaseID,
              Position: doc.data().Position,
              Team: doc.data().Team,
              Tier: doc.data().Tier
            };
            list.push(data);
          });
  
          resolve(list); // Resolve the promise with the list when the data is ready
        },
        (error) => {
          reject(error); // Reject the promise if there's an error
        }
      );
    });
  }
