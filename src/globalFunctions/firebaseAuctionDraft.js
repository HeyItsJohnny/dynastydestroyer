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

//JCL USED
export async function CreateOrUpdateCurrentDraftPlayer(uid, player) {
  const docRef = doc(db, "userprofile", uid, "auctiondraft", "currentdraft");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    UpdateCurrentDraftPlayer(uid, player);
  } else {
    CreateCurrentDraftPlayer(uid, player);
  }
}

//JCL USED
export async function CreateCurrentDraftPlayer(uid, player) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(doc(db, "userprofile", uid, "auctiondraft", "currentplayer"), {
      Age: player.Age,
      College: player.College,
      DepthChartOrder: player.DepthChartOrder,
      DraftStatus: player.DraftStatus,
      FirstName: player.FirstName,
      FullName: player.FullName,
      InjuryNotes: player.InjuryNotes,
      InjuryStatus: player.InjuryStatus,
      DatabaseID: player.DatabaseID,
      KeepTradeCutIdentifier: player.KeepTradeCutIdentifier,
      LastName: player.LastName,
      NonSuperFlexValue: player.NonSuperFlexValue,
      Position: player.Position,
      SleeperID: player.SleeperID,
      SearchFirstName: player.SearchFirstName,
      SearchFullName: player.SearchFullName,
      SearchLastName: player.SearchLastName,
      SearchRank: player.SearchRank,
      Status: player.Status,
      SuperFlexValue: player.SuperFlexValue,
      Team: player.Team,
      YearsExperience: player.YearsExperience,
      Fumbles: player.Fumbles,
      PassingYards: player.PassingYards,
      PassingTDs: player.PassingTDs,
      PassingINT: player.PassingINT,
      RushingYDS: player.RushingYDS,
      RushingTDs: player.RushingTDs,
      ReceivingRec: player.ReceivingRec,
      ReceivingYDS: player.ReceivingYDS,
      ReceivingTDs: player.ReceivingTDs,
      ReceivingTargets: player.ReceivingTargets,
      ReceptionPercentage: player.ReceptionPercentage,
      RedzoneTargets: player.RedzoneTargets,
      RedzoneTouches: player.RedzoneTouches,
      PositionRank: player.PositionRank,
      TotalPoints: player.TotalPoints,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function UpdateCurrentDraftPlayer(uid, player) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(
      doc(db, "userprofile", uid, "auctiondraft", "currentplayer"),
      {
        Age: player.Age,
        College: player.College,
        DepthChartOrder: player.DepthChartOrder,
        DraftStatus: player.DraftStatus,
        FirstName: player.FirstName,
        FullName: player.FullName,
        InjuryNotes: player.InjuryNotes,
        InjuryStatus: player.InjuryStatus,
        DatabaseID: player.DatabaseID,
        KeepTradeCutIdentifier: player.KeepTradeCutIdentifier,
        LastName: player.LastName,
        NonSuperFlexValue: player.NonSuperFlexValue,
        Position: player.Position,
        SleeperID: player.SleeperID,
        SearchFirstName: player.SearchFirstName,
        SearchFullName: player.SearchFullName,
        SearchLastName: player.SearchLastName,
        SearchRank: player.SearchRank,
        Status: player.Status,
        SuperFlexValue: player.SuperFlexValue,
        Team: player.Team,
        YearsExperience: player.YearsExperience,
        Fumbles: player.Fumbles,
        PassingYards: player.PassingYards,
        PassingTDs: player.PassingTDs,
        PassingINT: player.PassingINT,
        RushingYDS: player.RushingYDS,
        RushingTDs: player.RushingTDs,
        ReceivingRec: player.ReceivingRec,
        ReceivingYDS: player.ReceivingYDS,
        ReceivingTDs: player.ReceivingTDs,
        ReceivingTargets: player.ReceivingTargets,
        ReceptionPercentage: player.ReceptionPercentage,
        RedzoneTargets: player.RedzoneTargets,
        RedzoneTouches: player.RedzoneTouches,
        PositionRank: player.PositionRank,
        TotalPoints: player.TotalPoints,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function ClearCurrentDraftPlayer(uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(
      doc(db, "userprofile", uid, "auctiondraft", "currentplayer"),
      {
        Age: "",
        College: "",
        DepthChartOrder: "",
        DraftStatus: "",
        FirstName: "",
        FullName: "",
        InjuryNotes: "",
        InjuryStatus: "",
        DatabaseID: "",
        KeepTradeCutIdentifier: "",
        LastName: "",
        NonSuperFlexValue: "",
        Position: "",
        SleeperID: "",
        SearchFirstName: "",
        SearchFullName: "",
        SearchLastName: "",
        SearchRank: "",
        Status: "",
        SuperFlexValue: "",
        Team: "",
        YearsExperience: "",
        Fumbles: "",
        PassingYards: "",
        PassingTDs: "",
        PassingINT: "",
        RushingYDS: "",
        RushingTDs: "",
        ReceivingRec: "",
        ReceivingYDS: "",
        ReceivingTDs: "",
        ReceivingTargets: "",
        ReceptionPercentage: "",
        RedzoneTargets: "",
        RedzoneTouches: "",
        PositionRank: "",
        TotalPoints: "",
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function AddPlayerToTeam(uid, teamid, player, Amount) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(
      doc(
        db,
        "userprofile",
        uid,
        "teams",
        teamid,
        "players",
        player.DatabaseID
      ),
      {
        Age: player.Age,
        College: player.College,
        DepthChartOrder: player.DepthChartOrder,
        FirstName: player.FirstName,
        FullName: player.FullName,
        InjuryNotes: player.InjuryNotes,
        InjuryStatus: player.InjuryStatus,
        DatabaseID: player.DatabaseID,
        KeepTradeCutIdentifier: player.KeepTradeCutIdentifier,
        LastName: player.LastName,
        NonSuperFlexValue: player.NonSuperFlexValue,
        Position: player.Position,
        SleeperID: player.SleeperID,
        SearchFirstName: player.SearchFirstName,
        SearchFullName: player.SearchFullName,
        SearchLastName: player.SearchLastName,
        SearchRank: player.SearchRank,
        Status: player.Status,
        SuperFlexValue: player.SuperFlexValue,
        Team: player.Team,
        YearsExperience: player.YearsExperience,
        Fumbles: player.Fumbles,
        PassingYards: player.PassingYards,
        PassingTDs: player.PassingTDs,
        PassingINT: player.PassingINT,
        RushingYDS: player.RushingYDS,
        RushingTDs: player.RushingTDs,
        ReceivingRec: player.ReceivingRec,
        ReceivingYDS: player.ReceivingYDS,
        ReceivingTDs: player.ReceivingTDs,
        ReceivingTargets: player.ReceivingTargets,
        ReceptionPercentage: player.ReceptionPercentage,
        RedzoneTargets: player.RedzoneTargets,
        RedzoneTouches: player.RedzoneTouches,
        PositionRank: player.PositionRank,
        TotalPoints: player.TotalPoints,
        DraftAmount: Amount,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function getAuctionDataSettings(uid) {
  try {
    const docRef = doc(db, "userprofile", uid, "auctiondraft", "settings");
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
export async function createOrUpdateAuctionDraftSettings(auctionSettings, uid) {
  const docRef = doc(db, "userprofile", uid, "auctiondraft", "settings");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    UpdateAuctionDraftSettings(auctionSettings, uid);
  } else {
    CreateAuctionDraftSettings(auctionSettings, uid);
  }
}

//JCL USED
export async function UpdateAuctionDraftSettings(auctionSettings, uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "userprofile", uid, "auctiondraft", "settings"), {
      AuctionAmount: auctionSettings.AuctionAmount * 1,
      QBPercent: auctionSettings.QBPercent * 1,
      RBPercent: auctionSettings.RBPercent * 1,
      WRPercent: auctionSettings.WRPercent * 1,
      TEPercent: auctionSettings.TEPercent * 1,
      KPercent: auctionSettings.KPercent * 1,
      DEFPercent: auctionSettings.DEFPercent * 1,
      //QBTotalAmount: auctionSettings.QBTotalAmount * 1,
      //RBTotalAmount: auctionSettings.RBTotalAmount * 1,
      //WRTotalAmount: auctionSettings.WRTotalAmount * 1,
      //TETotalAmount: auctionSettings.TETotalAmount * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export async function CreateAuctionDraftSettings(auctionSettings, uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(doc(db, "userprofile", uid, "auctiondraft", "settings"), {
      AuctionAmount: auctionSettings.AuctionAmount * 1,
      QBPercent: auctionSettings.QBPercent * 1,
      RBPercent: auctionSettings.RBPercent * 1,
      WRPercent: auctionSettings.WRPercent * 1,
      TEPercent: auctionSettings.TEPercent * 1,
      KPercent: auctionSettings.KPercent * 1,
      DEFPercent: auctionSettings.DEFPercent * 1,
      //QBTotalAmount: 0 * 1,
      //RBTotalAmount: 0 * 1,
      //WRTotalAmount: 0 * 1,
      //TETotalAmount: 0 * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

//JCL USED
export const listenToTeamSpending = (uid, teamid, callback) => {
  const playersRef = collection(
    db,
    "userprofile",
    uid,
    "teams",
    teamid,
    "players"
  );

  return onSnapshot(playersRef, (snapshot) => {
    let total = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      total += data?.DraftAmount || 0;
    });
    callback(total);
  });
};


export async function updateQBTotal(total, uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "userprofile", uid, "auctiondraft", "settings"), {
      QBTotalAmount: total * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateRBTotal(total, uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "userprofile", uid, "auctiondraft", "settings"), {
      RBTotalAmount: total * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateWRTotal(total, uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "userprofile", uid, "auctiondraft", "settings"), {
      WRTotalAmount: total * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateTETotal(total, uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "userprofile", uid, "auctiondraft", "settings"), {
      TETotalAmount: total * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function createOrUpdatePlayerAuctionData(
  playerData,
  auctionRank,
  uid
) {
  const docRef = doc(
    db,
    "userprofile",
    uid,
    "auctiondraft",
    "players",
    playerData.Position,
    playerData.KeepTradeCutIdentifier
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updatePlayerAuctionData(playerData, uid);
  } else {
    createPlayerAuctionData(playerData, auctionRank, uid);
  }
}

export async function updatePlayerAuctionData(playerData, uid) {
  try {
    const KTCIdentifier = playerData.KeepTradeCutIdentifier;
    const WeekStatsArray = [];
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

    WeekStatsArray.push(Week1Points);
    WeekStatsArray.push(Week2Points);
    WeekStatsArray.push(Week3Points);
    WeekStatsArray.push(Week4Points);
    WeekStatsArray.push(Week5Points);
    WeekStatsArray.push(Week6Points);
    WeekStatsArray.push(Week7Points);
    WeekStatsArray.push(Week8Points);
    WeekStatsArray.push(Week9Points);
    WeekStatsArray.push(Week10Points);
    WeekStatsArray.push(Week11Points);
    WeekStatsArray.push(Week12Points);
    WeekStatsArray.push(Week13Points);
    WeekStatsArray.push(Week14Points);
    WeekStatsArray.push(Week15Points);
    WeekStatsArray.push(Week16Points);
    WeekStatsArray.push(Week17Points);

    const weeklyPointsArray = [
      {
        dataSource: WeekStatsArray,
        xName: "x",
        yName: "y",
        name: "Weekly Points",
        type: "StackingColumn",
        background: "blue",
      },
    ];

    //ID: lowercased firstnamelastname-position-team
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "auctiondraft",
        "players",
        playerData.Position,
        playerData.KeepTradeCutIdentifier
      ),
      {
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
        WeeklyPoints: weeklyPointsArray,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function createPlayerAuctionData(playerData, auctionRank, uid) {
  try {
    const KTCIdentifier = playerData.KeepTradeCutIdentifier;
    const WeekStatsArray = [];
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

    WeekStatsArray.push(Week1Points);
    WeekStatsArray.push(Week2Points);
    WeekStatsArray.push(Week3Points);
    WeekStatsArray.push(Week4Points);
    WeekStatsArray.push(Week5Points);
    WeekStatsArray.push(Week6Points);
    WeekStatsArray.push(Week7Points);
    WeekStatsArray.push(Week8Points);
    WeekStatsArray.push(Week9Points);
    WeekStatsArray.push(Week10Points);
    WeekStatsArray.push(Week11Points);
    WeekStatsArray.push(Week12Points);
    WeekStatsArray.push(Week13Points);
    WeekStatsArray.push(Week14Points);
    WeekStatsArray.push(Week15Points);
    WeekStatsArray.push(Week16Points);
    WeekStatsArray.push(Week17Points);

    const weeklyPointsArray = [
      {
        dataSource: WeekStatsArray,
        xName: "x",
        yName: "y",
        name: "Weekly Points",
        type: "StackingColumn",
        background: "blue",
      },
    ];

    //ID: lowercased firstnamelastname-position-team
    await setDoc(
      doc(
        db,
        "userprofile",
        uid,
        "auctiondraft",
        "players",
        playerData.Position,
        playerData.KeepTradeCutIdentifier
      ),
      {
        Tier: "Tier 4",
        CurrentAuctionRank: auctionRank,
        AuctionRank: auctionRank,
        DraftStatus: "Open",
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
        WeeklyPoints: weeklyPointsArray,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function resetDraftBoard(uid) {
  //Adding Random Players
  /*
  await setDoc(
    doc(
      db,
      "userprofile",uid,
      "auctiondraft",
      "players",
      "RB",
      "kennethwalker-RB"
    ),
    {
      Tier: "Tier 4",
      CurrentAuctionRank: 56,
      AuctionRank: 56,
      DraftStatus: "Open",
      Age: 24,
      College: "",
      DepthChartOrder: 1,
      FullName: "Kenneth Walker",
      InjuryNotes: "",
      InjuryStatus: "",
      KeepTradeCutIdentifier: "kennethwalker-RB",
      NonSuperFlexValue: 0,
      Position: "RB",
      SleeperID: "0000",
      SearchRank: 56,
      Status: "",
      SuperFlexValue: 0,
      Team: "SEA",
      YearsExperience: 3,
      FantasyPointsAgainst: 0,
      Fumbles: 0,
      PassingINT: 0,
      PassingTD: 0,
      PassingYDS: 0,
      Rank: 56,
      ReceivingRec: 0,
      ReceivingTD: 0,
      ReceivingYDS: 0,
      ReceptionPercentage: 0,
      RushingTD: 0,
      RushingYDS: 0,
      RedzoneGoalToGo: 0,
      RedzoneTargets: 0,
      RedZoneTouches: 0,
      ReceivingTargets: 0,
      TargetsReceiptions: 0,
      TotalPoints: 0,
      TotalCarries: 0,
      TotalTouches: 0,
      WeeklyPoints: [],
    }
  );
  */
  /*
  resetQBDraftBoard(uid);
  resetRBDraftBoard(uid);
  resetWRDraftBoard(uid);
  resetTEDraftBoard(uid);
  resetDraftTotals(uid);
  */
}

export async function resetQBDraftBoard(uid) {
  /*
  const docCollection = query(collection(db, "userprofile",uid,"auctiondraft", "players", "QB"));
  onSnapshot(docCollection, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      var data = {
        id: doc.id,
        Position: doc.data().Position,
      };
      list.push(data);
    });
    list.forEach((doc) => {
      updateDraftStatus(doc,"Open",uid,"",0);
    })
  });
  */
}

export async function resetRBDraftBoard(uid) {
  /*
  const docCollection = query(collection(db, "userprofile",uid,"auctiondraft", "players", "RB"));
  onSnapshot(docCollection, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      var data = {
        id: doc.id,
        Position: doc.data().Position
      };
      list.push(data);
    });
    list.forEach((doc) => {
      updateDraftStatus(doc,"Open",uid,"",0);
    })
  });
  */
}

export async function resetWRDraftBoard(uid) {
  /*
  const docCollection = query(collection(db, "userprofile",uid,"auctiondraft", "players", "WR"));
  onSnapshot(docCollection, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      var data = {
        id: doc.id,
        Position: doc.data().Position,
      };
      list.push(data);
    });
    list.forEach((doc) => {
      updateDraftStatus(doc,"Open",uid,"",0);
    })
  });
*/
}

export async function resetTEDraftBoard(uid) {
  /*
  const docCollection = query(collection(db, "userprofile",uid,"auctiondraft", "players", "TE"));
  onSnapshot(docCollection, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      var data = {
        id: doc.id,
        Position: doc.data().Position,
      };
      list.push(data);
    });
    list.forEach((doc) => {
      updateDraftStatus(doc,"Open",uid,"",0);
    })
  });
  */
}

export async function resetDraftTotals(uid) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(doc(db, "userprofile", uid, "auctiondraft", "settings"), {
      QBTotalAmount: 0 * 1,
      RBTotalAmount: 0 * 1,
      WRTotalAmount: 0 * 1,
      TETotalAmount: 0 * 1,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateDraftStatus(
  playerData,
  status,
  uid,
  drafter,
  draftprice
) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "auctiondraft",
        "players",
        playerData.Position,
        playerData.id
      ),
      {
        DraftStatus: status,
        DraftedBy: drafter,
        DraftPrice: draftprice,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updatePlayerTier(
  KeepTradeCutIdentifier,
  position,
  tier,
  uid
) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "auctiondraft",
        "players",
        position,
        KeepTradeCutIdentifier
      ),
      {
        Tier: tier,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function createRookiePlayer(
  position,
  fullname,
  team,
  depthChart,
  ktc,
  uid
) {
  await setDoc(
    doc(db, "userprofile", uid, "auctiondraft", "players", position, ktc),
    {
      Tier: "Tier 4",
      CurrentAuctionRank: 100,
      AuctionRank: 100,
      DraftStatus: "Open",
      Age: 20,
      College: "",
      DepthChartOrder: depthChart,
      FullName: fullname,
      InjuryNotes: "",
      InjuryStatus: "",
      KeepTradeCutIdentifier: ktc,
      NonSuperFlexValue: 0,
      Position: position,
      SleeperID: "0000",
      SearchRank: 100,
      Status: "",
      SuperFlexValue: 0,
      Team: team,
      YearsExperience: 3,
      FantasyPointsAgainst: 0,
      Fumbles: 0,
      PassingINT: 0,
      PassingTD: 0,
      PassingYDS: 0,
      Rank: 56,
      ReceivingRec: 0,
      ReceivingTD: 0,
      ReceivingYDS: 0,
      ReceptionPercentage: 0,
      RushingTD: 0,
      RushingYDS: 0,
      RedzoneGoalToGo: 0,
      RedzoneTargets: 0,
      RedZoneTouches: 0,
      ReceivingTargets: 0,
      TargetsReceiptions: 0,
      TotalPoints: 0,
      TotalCarries: 0,
      TotalTouches: 0,
      WeeklyPoints: [],
    }
  );
}

export async function createSleeperPlayer(position, fullname, team, ktc, uid) {
  await setDoc(
    doc(db, "userprofile", uid, "auctiondraft", "players", "sleepers", ktc),
    {
      Position: position,
      Team: team,
      FullName: fullname,
      KeepTradeCutIdentifier: ktc,
    }
  );
}

export async function deleteSleeperPlayer(uid, ktc) {
  try {
    await deleteDoc(
      doc(db, "userprofile", uid, "auctiondraft", "players", "sleepers", ktc)
    );
  } catch (error) {
    alert("Error deleting data from Firestore:", error);
  }
}
