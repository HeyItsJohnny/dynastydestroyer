import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  where,
} from "firebase/firestore";

export async function getPlayerStatsData(playerID, year) {
  try {
    const docRef = doc(db, "players", playerID, "Stats", year);
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

export async function getPlayerDataByID(playerID) {
  try {
    const docRef = doc(db, "players", playerID);
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

export async function getPlayerDataByPosition(positionToSearch) {
  return new Promise((resolve, reject) => {
    const docCollection = query(
      collection(db, "players"),
      where("Position", "==", positionToSearch),
      where("Team","!=","")
    );
    onSnapshot(
      docCollection,
      (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          var data = {
            Age: doc.data().Age,
            College: doc.data().College,
            DepthChartOrder: doc.data().DepthChartOrder,
            FirstName: doc.data().FirstName,
            FullName: doc.data().FullName,
            InjuryNotes: doc.data().InjuryNotes,
            InjuryStatus: doc.data().InjuryStatus,
            KeepTradeCutIdentifier: doc.data().KeepTradeCutIdentifier,
            LastName: doc.data().LastName,
            NonSuperFlexValue: doc.data().NonSuperFlexValue,
            Position: doc.data().Position,
            SleeperID: doc.data().SleeperID,
            SearchFirstName: doc.data().SearchFirstName,
            SearchFullName: doc.data().SearchFullName,
            SearchLastName: doc.data().SearchLastName,
            SearchRank: doc.data().SearchRank,
            Status: doc.data().Status,
            SuperFlexValue: doc.data().SuperFlexValue,
            Team: doc.data().Team,
            YearsExperience: doc.data().YearsExperience,
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

export function createPlayerStatObject(playerData, playerStats) {
  var playerStatData = {
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
    FantasyPointsAgainst: playerStats.FantasyPointsAgainst,
    Fumbles: playerStats.Fumbles,
    PassingINT: playerStats.PassingINT,
    PassingTD: playerStats.PassingTD,
    PassingYDS: playerStats.PassingYDS,
    Rank: playerStats.Rank,
    ReceivingRec: playerStats.ReceivingRec,
    ReceivingTD: playerStats.ReceivingTD,
    ReceivingYDS: playerStats.ReceivingYDS,
    ReceptionPercentage: playerStats.ReceptionPercentage,
    RushingTD: playerStats.RushingTD,
    RushingYDS: playerStats.RushingYDS,
    RedzoneGoalToGo: playerStats.RedzoneGoalToGo,
    RedzoneTargets: playerStats.RedzoneTargets,
    RedZoneTouches: playerStats.RedZoneTouches,
    ReceivingTargets: playerStats.ReceivingTargets,
    TargetsReceiptions: playerStats.TargetsReceiptions,
    TotalPoints: playerStats.TotalPoints,
    TotalCarries: playerStats.TotalCarries,
    TotalTouches: playerStats.TotalTouches,
  };
  return playerStatData;
}
