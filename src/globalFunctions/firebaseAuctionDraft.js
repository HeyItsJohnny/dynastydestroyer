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

import { getPlayerWeeklyPoints } from "./firebasePlayerFunctions";

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

    const KTCIdentifier = playerData.KTCIdentifier;

    const Week1Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week1"
    );
    const Week2Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week2"
    );
    const Week3Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week3"
    );
    const Week4Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week4"
    );
    const Week5Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week5"
    );
    const Week6Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week6"
    );
    const Week7Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week7"
    );
    const Week8Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week8"
    );
    const Week9Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week9"
    );
    const Week10Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week10"
    );
    const Week11Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week11"
    );
    const Week12Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week12"
    );
    const Week13Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week13"
    );
    const Week14Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week14"
    );
    const Week15Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week15"
    );
    const Week16Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week16"
    );
    const Week17Points = await getPlayerWeeklyPoints(
      KTCIdentifier,
      "2023",
      "Week17"
    );

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
      Week1Points: Week1Points,
      Week2Points: Week2Points,
      Week3Points: Week3Points,
      Week4Points: Week4Points,
      Week5Points: Week5Points,
      Week6Points: Week6Points,
      Week7Points: Week7Points,
      Week8Points: Week8Points,
      Week9Points: Week9Points,
      Week10Points: Week10Points,
      Week11Points: Week11Points,
      Week12Points: Week12Points,
      Week13Points: Week13Points,
      Week14Points: Week14Points,
      Week15Points: Week15Points,
      Week16Points: Week16Points,
      Week17Points: Week17Points,
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
