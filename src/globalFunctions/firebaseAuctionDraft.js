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

export async function getAuctionDataSettings() {
  try {
    const docRef = doc(db, "auctiondraft", "settings");
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

export async function createOrUpdateAuctionDraftSettings(auctionSettings) {
  const docRef = doc(db, "auctiondraft", "settings");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updateAuctionDraftSettings(auctionSettings);
  } else {
    CreateAuctionDraftSettings(auctionSettings);
  }
}

export async function updateAuctionDraftSettings(auctionSettings) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "auctiondraft", "settings"), {
      AuctionAmount: auctionSettings.AuctionAmount * 1,
      QBPercent: auctionSettings.QBPercent * 1,
      RBPercent: auctionSettings.RBPercent * 1,
      WRPercent: auctionSettings.WRPercent * 1,
      TEPercent: auctionSettings.TEPercent * 1,
      KPercent: auctionSettings.KPercent * 1,
      DEFPercent: auctionSettings.DEFPercent * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function CreateAuctionDraftSettings(auctionSettings) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(doc(db, "auctiondraft", "settings"), {
      AuctionAmount: auctionSettings.AuctionAmount * 1,
      QBPercent: auctionSettings.QBPercent * 1,
      RBPercent: auctionSettings.RBPercent * 1,
      WRPercent: auctionSettings.WRPercent * 1,
      TEPercent: auctionSettings.TEPercent * 1,
      KPercent: auctionSettings.KPercent * 1,
      DEFPercent: auctionSettings.DEFPercent * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function createOrUpdatePlayerAuctionData(playerData, auctionRank) {
  const docRef = doc(
    db,
    "auctiondraft",
    "players",
    playerData.Position,
    playerData.KeepTradeCutIdentifier
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updatePlayerAuctionData(playerData);
  } else {
    createPlayerAuctionData(playerData, auctionRank);
  }
}

export async function updatePlayerAuctionData(playerData) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "auctiondraft", "players", playerData.Position, playerData.KeepTradeCutIdentifier), {
      Age: playerData.Age,
      College: playerData.College,
      DepthChartOrder: playerData.DepthChartOrder,
      FullName: playerData.FullName,
      InjuryNotes: playerData.InjuryNotes,
      InjuryStatus: playerData.InjuryStatus,
      KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
      NonSuperFlexValue: playerData.NonSuperFlexValue,
      Position: playerData.Position,
      SleeperID: playerData.SleeperID,
      SearchRank: playerData.SearchRank,
      Status: playerData.Status,
      SuperFlexValue: playerData.SuperFlexValue,
      Team: playerData.Team,
      YearsExperience: playerData.YearsExperience,
      FantasyPointsAgainst: playerData.FantasyPointsAgainst,
      Fumbles: playerData.Fumbles,
      PassingINT: playerData.PassingINT,
      PassingTD: playerData.PassingTD,
      PassingYDS: playerData.PassingYDS,
      Rank: playerData.Rank,
      ReceivingRec: playerData.ReceivingRec,
      ReceivingTD: playerData.ReceivingTD,
      ReceivingYDS: playerData.ReceivingYDS,
      ReceptionPercentage: playerData.ReceptionPercentage,
      RushingTD: playerData.RushingTD,
      RushingYDS: playerData.RushingYDS,
      RedzoneGoalToGo: playerData.RedzoneGoalToGo,
      RedzoneTargets: playerData.RedzoneTargets,
      RedZoneTouches: playerData.RedZoneTouches,
      ReceivingTargets: playerData.ReceivingTargets,
      TargetsReceiptions: playerData.TargetsReceiptions,
      TotalPoints: playerData.TotalPoints,
      TotalCarries: playerData.TotalCarries,
      TotalTouches: playerData.TotalTouches,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function createPlayerAuctionData(playerData, auctionRank) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(doc(db, "auctiondraft", "players", playerData.Position, playerData.KeepTradeCutIdentifier), {
      AuctionRank: auctionRank,
      Age: playerData.Age,
      College: playerData.College,
      DepthChartOrder: playerData.DepthChartOrder,
      FullName: playerData.FullName,
      InjuryNotes: playerData.InjuryNotes,
      InjuryStatus: playerData.InjuryStatus,
      KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
      NonSuperFlexValue: playerData.NonSuperFlexValue,
      Position: playerData.Position,
      SleeperID: playerData.SleeperID,
      SearchRank: playerData.SearchRank,
      Status: playerData.Status,
      SuperFlexValue: playerData.SuperFlexValue,
      Team: playerData.Team,
      YearsExperience: playerData.YearsExperience,
      FantasyPointsAgainst: playerData.FantasyPointsAgainst,
      Fumbles: playerData.Fumbles,
      PassingINT: playerData.PassingINT,
      PassingTD: playerData.PassingTD,
      PassingYDS: playerData.PassingYDS,
      Rank: playerData.Rank,
      ReceivingRec: playerData.ReceivingRec,
      ReceivingTD: playerData.ReceivingTD,
      ReceivingYDS: playerData.ReceivingYDS,
      ReceptionPercentage: playerData.ReceptionPercentage,
      RushingTD: playerData.RushingTD,
      RushingYDS: playerData.RushingYDS,
      RedzoneGoalToGo: playerData.RedzoneGoalToGo,
      RedzoneTargets: playerData.RedzoneTargets,
      RedZoneTouches: playerData.RedZoneTouches,
      ReceivingTargets: playerData.ReceivingTargets,
      TargetsReceiptions: playerData.TargetsReceiptions,
      TotalPoints: playerData.TotalPoints,
      TotalCarries: playerData.TotalCarries,
      TotalTouches: playerData.TotalTouches,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}
