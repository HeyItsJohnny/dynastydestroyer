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

export async function timestampSleeperData() {
  try {
    await updateDoc(doc(db, "settings", "datasettings"), {
      LastSleeperDataUpdate: new Date(),
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function timestampStatsData() {
  try {
    await updateDoc(doc(db, "settings", "datasettings"), {
      LastPlayerStatsUpdate: new Date(),
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function timestampKTCData() {
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
      LeagueName: leaguename,
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
  const docRef = doc(db, "players", playerData.player_id);
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
    await setDoc(doc(db, "players", playerData.position + "-" + playerData.search_full_name), {
      Age: playerData.age ?? 0,
      College: playerData.college ?? "",
      DepthChartOrder: playerData.depth_chart_order ?? 0,
      FirstName: playerData.first_name ?? "",
      FullName: playerData.full_name ?? "",
      InjuryNotes: playerData.injury_notes ?? "",
      InjuryStatus: playerData.injury_status ?? "",
      KeepTradeCutIdentifier:
        playerData.search_full_name + "-" + playerData.position,
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
    await updateDoc(doc(db, "players", playerData.position + "-" + playerData.search_full_name), {
      Age: playerData.age ?? "",
      DepthChartOrder: playerData.depth_chart_order ?? 0,
      InjuryNotes: playerData.injury_notes ?? "",
      InjuryStatus: playerData.injury_status ?? "",
      KeepTradeCutIdentifier:
        playerData.search_full_name + "-" + playerData.position,
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

export async function createOrUpdateUserRosterData(
  uid,
  leagueid,
  playerData,
  playerBucket
) {
  const docRef = doc(
    db,
    "userprofile",
    uid,
    "leagues",
    leagueid,
    playerBucket,
    playerData.SleeperID
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updateUserRosterPlayerData(uid, leagueid, playerBucket, playerData);
  } else {
    createUserRosterPlayerData(uid, leagueid, playerBucket, playerData);
  }
}

export async function createUserRosterPlayerData(
  uid,
  leagueid,
  playerBucket,
  playerData
) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(
      doc(
        db,
        "userprofile",
        uid,
        "leagues",
        leagueid,
        playerBucket,
        playerData.SleeperID
      ),
      {
        Age: playerData.Age,
        College: playerData.College,
        DepthChartOrder: playerData.DepthChartOrder,
        FirstName: playerData.FirstName,
        FullName: playerData.FullName,
        InjuryNotes: playerData.InjuryNotes,
        InjuryStatus: playerData.InjuryStatus,
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
        LastName: playerData.LastName,
        NonSuperFlexValue: playerData.NonSuperFlexValue,
        Position: playerData.Position,
        SleeperID: playerData.SleeperID,
        SearchFirstName: playerData.SearchFirstName,
        SearchFullName: playerData.SearchFullName,
        SearchLastName: playerData.SearchLastName,
        SearchRank: playerData.SearchRank,
        Status: playerData.Status,
        SuperFlexValue: playerData.SuperFlexValue,
        Team: playerData.Team,
        YearsExperience: playerData.YearsExperience,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateUserRosterPlayerData(
  uid,
  leagueid,
  playerBucket,
  playerData
) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "leagues",
        leagueid,
        playerBucket,
        playerData.SleeperID
      ),
      {
        Age: playerData.Age,
        College: playerData.College,
        DepthChartOrder: playerData.DepthChartOrder,
        FirstName: playerData.FirstName,
        FullName: playerData.FullName,
        InjuryNotes: playerData.InjuryNotes,
        InjuryStatus: playerData.InjuryStatus,
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
        LastName: playerData.LastName,
        NonSuperFlexValue: playerData.NonSuperFlexValue,
        Position: playerData.Position,
        SleeperID: playerData.SleeperID,
        SearchFirstName: playerData.SearchFirstName,
        SearchFullName: playerData.SearchFullName,
        SearchLastName: playerData.SearchLastName,
        SearchRank: playerData.SearchRank,
        Status: playerData.Status,
        SuperFlexValue: playerData.SuperFlexValue,
        Team: playerData.Team,
        YearsExperience: playerData.YearsExperience,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function createOrUpdateLeagueRosterData(
  uid,
  leagueid,
  ownerid,
  username,
  displayname
) {
  //console.log(`uSER ID: ${uid} LEAGUEID: ${leagueid} OWNERID: ${ownerid} USERNAME: ${username} DISPLAYNAME: ${displayname}`);
  const docRef = doc(
    db,
    "userprofile",
    uid,
    "leagues",
    leagueid,
    "LeagueRosters",
    ownerid
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updateLeagueRosterData(uid, leagueid, ownerid, username, displayname);
  } else {
    createLeagueRosterData(uid, leagueid, ownerid, username, displayname);
  }
}

export async function createLeagueRosterData(
  uid,
  leagueid,
  ownerid,
  username,
  displayname
) {
  try {
    await setDoc(
      doc(
        db,
        "userprofile",
        uid,
        "leagues",
        leagueid,
        "LeagueRosters",
        ownerid
      ),
      {
        UserName: username,
        DisplayName: displayname,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateLeagueRosterData(
  uid,
  leagueid,
  ownerid,
  username,
  displayname
) {
  try {
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "leagues",
        leagueid,
        "LeagueRosters",
        ownerid
      ),
      {
        UserName: username,
        DisplayName: displayname,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function createOrUpdateLeagueRostersData(
  uid,
  leagueid,
  playerData,
  playerBucket,
  ownerid
) {
  //Create Players
  const docRef = doc(
    db,
    "userprofile",
    uid,
    "leagues",
    leagueid,
    "LeagueRosters",
    ownerid,
    playerBucket,
    playerData.SleeperID
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updateLeagueRosterPlayerData(
      uid,
      leagueid,
      playerBucket,
      playerData,
      ownerid
    );
  } else {
    createLeagueRosterPlayerData(
      uid,
      leagueid,
      playerBucket,
      playerData,
      ownerid
    );
  }
}

export async function createLeagueRosterPlayerData(
  uid,
  leagueid,
  playerBucket,
  playerData,
  ownerid
) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(
      doc(
        db,
        "userprofile",
        uid,
        "leagues",
        leagueid,
        "LeagueRosters",
        ownerid,
        playerBucket,
        playerData.SleeperID
      ),
      {
        Age: playerData.Age,
        College: playerData.College,
        DepthChartOrder: playerData.DepthChartOrder,
        FirstName: playerData.FirstName,
        FullName: playerData.FullName,
        InjuryNotes: playerData.InjuryNotes,
        InjuryStatus: playerData.InjuryStatus,
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
        LastName: playerData.LastName,
        NonSuperFlexValue: playerData.NonSuperFlexValue,
        Position: playerData.Position,
        SleeperID: playerData.SleeperID,
        SearchFirstName: playerData.SearchFirstName,
        SearchFullName: playerData.SearchFullName,
        SearchLastName: playerData.SearchLastName,
        SearchRank: playerData.SearchRank,
        Status: playerData.Status,
        SuperFlexValue: playerData.SuperFlexValue,
        Team: playerData.Team,
        YearsExperience: playerData.YearsExperience,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateLeagueRosterPlayerData(
  uid,
  leagueid,
  playerBucket,
  playerData,
  ownerid
) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await updateDoc(
      doc(
        db,
        "userprofile",
        uid,
        "leagues",
        leagueid,
        "LeagueRosters",
        ownerid,
        playerBucket,
        playerData.SleeperID
      ),
      {
        Age: playerData.Age,
        College: playerData.College,
        DepthChartOrder: playerData.DepthChartOrder,
        FirstName: playerData.FirstName,
        FullName: playerData.FullName,
        InjuryNotes: playerData.InjuryNotes,
        InjuryStatus: playerData.InjuryStatus,
        KeepTradeCutIdentifier: playerData.KeepTradeCutIdentifier,
        LastName: playerData.LastName,
        NonSuperFlexValue: playerData.NonSuperFlexValue,
        Position: playerData.Position,
        SleeperID: playerData.SleeperID,
        SearchFirstName: playerData.SearchFirstName,
        SearchFullName: playerData.SearchFullName,
        SearchLastName: playerData.SearchLastName,
        SearchRank: playerData.SearchRank,
        Status: playerData.Status,
        SuperFlexValue: playerData.SuperFlexValue,
        Team: playerData.Team,
        YearsExperience: playerData.YearsExperience,
      }
    );
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updateFields(
  collectionName,
  fieldToSearch,
  valueToSearch,
  updatedData
) {
  try {
    const q = query(
      collection(db, collectionName),
      where(fieldToSearch, "==", valueToSearch)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      updatePlayerValues(doc.id, updatedData);
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

export async function addOrUpdatePlayerStats(KTCID, year, statsData) {
  try {
    const q = query(
      collection(db, "players"),
      where("KeepTradeCutIdentifier", "==", KTCID)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      createOrUpdatePlayerStats(doc.id, year, statsData);
    });
  } catch (error) {
    console.log("Error updating fields:", error);
  }
}

export async function createOrUpdatePlayerStats(playerID, year, statsData) {
  //Create Players
  const docRef = doc(db, "players", playerID, "Stats", year);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    updatePlayerStats(playerID, year, statsData);
  } else {
    createPlayerStats(playerID, year, statsData);
  }
}

export async function createPlayerStats(playerID, year, statsData) {
  try {
    //ID: lowercased firstnamelastname-position-team
    await setDoc(doc(db, "players", playerID, "Stats", year), {
      FantasyPointsAgainst: parseFloat(statsData["FanPtsAgainst-pts"]) ?? 0,
      Fumbles: parseInt(statsData.Fum) ?? 0,
      PassingINT: parseInt(statsData.PassingInt) ?? 0,
      PassingTD: parseInt(statsData.PassingTD) ?? 0,
      PassingYDS: parseInt(statsData.PassingYDS) ?? 0,
      Rank: parseInt(statsData.Rank) ?? 0,
      ReceivingRec: parseInt(statsData.ReceivingRec) ?? 0,
      ReceivingTD: parseInt(statsData.ReceivingTD) ?? 0,
      ReceivingYDS: parseInt(statsData.ReceivingYDS) ?? 0,
      ReceptionPercentage: parseFloat(statsData.ReceptionPercentage) ?? 0,
      RushingTD: parseInt(statsData.RushingTD) ?? 0,
      RushingYDS: parseInt(statsData.RushingYDS) ?? 0,
      RedzoneGoalToGo: parseFloat(statsData.RzG2G) ?? 0,
      RedzoneTargets: parseInt(statsData.RzTarget) ?? 0,
      RedZoneTouches: parseInt(statsData.RzTouch) ?? 0,
      ReceivingTargets: parseInt(statsData.Targets) ?? 0,
      TargetsReceiptions: parseInt(statsData.TargetsReceptions) ?? 0,
      TotalPoints: parseFloat(statsData.TotalPoints) ?? 0,
      TotalCarries: parseInt(statsData.TouchCarries) ?? 0,
      TotalTouches: parseInt(statsData.Touches) ?? 0,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updatePlayerStats(playerID, year, statsData) {
  try {
    await updateDoc(doc(db, "players", playerID, "Stats", year), {
      FantasyPointsAgainst: parseFloat(statsData["FanPtsAgainst-pts"]) ?? 0,
      Fumbles: parseInt(statsData.Fum) ?? 0,
      PassingINT: parseInt(statsData.PassingInt) ?? 0,
      PassingTD: parseInt(statsData.PassingTD) ?? 0,
      PassingYDS: parseInt(statsData.PassingYDS) ?? 0,
      Rank: parseInt(statsData.Rank) ?? 0,
      ReceivingRec: parseInt(statsData.ReceivingRec) ?? 0,
      ReceivingTD: parseInt(statsData.ReceivingTD) ?? 0,
      ReceivingYDS: parseInt(statsData.ReceivingYDS) ?? 0,
      ReceptionPercentage: parseFloat(statsData.ReceptionPercentage) ?? 0,
      RushingTD: parseInt(statsData.RushingTD) ?? 0,
      RushingYDS: parseInt(statsData.RushingYDS) ?? 0,
      RedzoneGoalToGo: parseFloat(statsData.RzG2G) ?? 0,
      RedzoneTargets: parseInt(statsData.RzTarget) ?? 0,
      RedZoneTouches: parseInt(statsData.RzTouch) ?? 0,
      ReceivingTargets: parseInt(statsData.Targets) ?? 0,
      TargetsReceiptions: parseInt(statsData.TargetsReceptions) ?? 0,
      TotalPoints: parseFloat(statsData.TotalPoints) ?? 0,
      TotalCarries: parseInt(statsData.TouchCarries) ?? 0,
      TotalTouches: parseInt(statsData.Touches) ?? 0,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function addOrUpdatePlayerWeeklyStats( playerID, year, week, statsData ) {
  try {
    const docRef = doc(db, "weeklystats", year, "Week", week, "Players", playerID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      updatePlayerWeeklyStats(playerID, year, week, statsData);
    } else {
      createPlayerWeeklyStats(playerID, year, week, statsData);
    }
  } catch (error) {
    console.log("Error updating fields:", error);
  }
}

export async function createPlayerWeeklyStats(playerID, year, week, statsData) {
  try {
    await setDoc(doc(db, "weeklystats", year, "Week", week, "Players", playerID), {
      FantasyPointsAgainst: parseFloat(statsData["FanPtsAgainst-pts"]) ?? 0,
      PlayerName: statsData.PlayerName ?? "",
      PlayerTeam: statsData.Team ?? "",
      PlayerOpponent: statsData.PlayerOpponent ?? "",
      PlayerPosition: statsData.Pos ?? "",
      Fumbles: parseInt(statsData.Fum) ?? 0,
      PassingINT: parseInt(statsData.PassingInt) ?? 0,
      PassingTD: parseInt(statsData.PassingTD) ?? 0,
      PassingYDS: parseInt(statsData.PassingYDS) ?? 0,
      Rank: parseInt(statsData.Rank) ?? 0,
      ReceivingRec: parseInt(statsData.ReceivingRec) ?? 0,
      ReceivingTD: parseInt(statsData.ReceivingTD) ?? 0,
      ReceivingYDS: parseInt(statsData.ReceivingYDS) ?? 0,
      ReceptionPercentage: parseFloat(statsData.ReceptionPercentage) ?? 0,
      RushingTD: parseInt(statsData.RushingTD) ?? 0,
      RushingYDS: parseInt(statsData.RushingYDS) ?? 0,
      RedzoneGoalToGo: parseFloat(statsData.RzG2G) ?? 0,
      RedzoneTargets: parseInt(statsData.RzTarget) ?? 0,
      RedZoneTouches: parseInt(statsData.RzTouch) ?? 0,
      ReceivingTargets: parseInt(statsData.Targets) ?? 0,
      TargetsReceiptions: parseInt(statsData.TargetsReceptions) ?? 0,
      TotalPoints: parseFloat(statsData.TotalPoints) ?? 0,
      TotalCarries: parseInt(statsData.TouchCarries) ?? 0,
      TotalTouches: parseInt(statsData.Touches) ?? 0,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}

export async function updatePlayerWeeklyStats(playerID, year, week, statsData) {
  try {
    await updateDoc(doc(db, "weeklystats", year, "Week", week, "Players", playerID), {
      FantasyPointsAgainst: parseFloat(statsData["FanPtsAgainst-pts"]) ?? 0,
      PlayerName: statsData.PlayerName ?? "",
      PlayerTeam: statsData.Team ?? "",
      PlayerOpponent: statsData.PlayerOpponent ?? "",
      PlayerPosition: statsData.Pos ?? "",
      Fumbles: parseInt(statsData.Fum) ?? 0,
      PassingINT: parseInt(statsData.PassingInt) ?? 0,
      PassingTD: parseInt(statsData.PassingTD) ?? 0,
      PassingYDS: parseInt(statsData.PassingYDS) ?? 0,
      Rank: parseInt(statsData.Rank) ?? 0,
      ReceivingRec: parseInt(statsData.ReceivingRec) ?? 0,
      ReceivingTD: parseInt(statsData.ReceivingTD) ?? 0,
      ReceivingYDS: parseInt(statsData.ReceivingYDS) ?? 0,
      ReceptionPercentage: parseFloat(statsData.ReceptionPercentage) ?? 0,
      RushingTD: parseInt(statsData.RushingTD) ?? 0,
      RushingYDS: parseInt(statsData.RushingYDS) ?? 0,
      RedzoneGoalToGo: parseFloat(statsData.RzG2G) ?? 0,
      RedzoneTargets: parseInt(statsData.RzTarget) ?? 0,
      RedZoneTouches: parseInt(statsData.RzTouch) ?? 0,
      ReceivingTargets: parseInt(statsData.Targets) ?? 0,
      TargetsReceiptions: parseInt(statsData.TargetsReceptions) ?? 0,
      TotalPoints: parseFloat(statsData.TotalPoints) ?? 0,
      TotalCarries: parseInt(statsData.TouchCarries) ?? 0,
      TotalTouches: parseInt(statsData.Touches) ?? 0,
    });
  } catch (error) {
    console.error("There was an error adding to the database: " + error);
  }
}
