//Functions
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { TbLetterQ, TbLetterR, TbLetterW, TbLetterT } from "react-icons/tb";

export async function getLeaguesData(userid) {
  return new Promise((resolve, reject) => {
    const docCollection = query(
      collection(db, "userprofile", userid, "leagues"),
      orderBy("LeagueName")
    );

    onSnapshot(
      docCollection,
      (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          var data = {
            id: doc.id,
            LeagueName: doc.data().LeagueName,
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

export async function getRosterData(userid, leagueid, type) {
  return new Promise((resolve, reject) => {
    const docCollection = query(
      collection(db, "userprofile", userid, "leagues", leagueid, type),
      orderBy("Position")
    );

    onSnapshot(
      docCollection,
      (querySnapshot) => {
        const list = [];

        querySnapshot.forEach((doc) => {
          var iconName = null;

          if (doc.data().Position === "QB") {
            iconName = <TbLetterQ />;
          } else if (doc.data().Position === "RB") {
            iconName = <TbLetterR />;
          } else if (doc.data().Position === "WR") {
            iconName = <TbLetterW />;
          } else if (doc.data().Position === "TE") {
            iconName = <TbLetterT />;
          }

          var data = {
            id: doc.id,
            Age: doc.data().Age,
            DepthChartOrder: doc.data().DepthChartOrder,
            FullName: doc.data().FullName,
            Position: doc.data().Position,
            Status: doc.data().Status,
            InjuryNotes: doc.data().InjuryNotes,
            InjuryStatus: doc.data().InjuryStatus,
            SearchRank: doc.data().SearchRank,
            NonSuperFlexValue: doc.data().NonSuperFlexValue,
            SuperFlexValue: doc.data().SuperFlexValue,
            Icon: iconName,
            Team: doc.data().Team,
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

export async function getTeamRosterData(userid, leagueid, teamid, type) {
  return new Promise((resolve, reject) => {
    const docCollection = query(
      collection(
        db,
        "userprofile",
        userid,
        "leagues",
        leagueid,
        "LeagueRosters",
        teamid,
        type
      ),
      orderBy("Position")
    );

    onSnapshot(
      docCollection,
      (querySnapshot) => {
        const list = [];

        querySnapshot.forEach((doc) => {
          var iconName = null;

          if (doc.data().Position === "QB") {
            iconName = <TbLetterQ />;
          } else if (doc.data().Position === "RB") {
            iconName = <TbLetterR />;
          } else if (doc.data().Position === "WR") {
            iconName = <TbLetterW />;
          } else if (doc.data().Position === "TE") {
            iconName = <TbLetterT />;
          }

          var data = {
            id: doc.id,
            Age: doc.data().Age,
            DepthChartOrder: doc.data().DepthChartOrder,
            FullName: doc.data().FullName,
            Position: doc.data().Position,
            Status: doc.data().Status,
            InjuryNotes: doc.data().InjuryNotes,
            InjuryStatus: doc.data().InjuryStatus,
            SearchRank: doc.data().SearchRank,
            NonSuperFlexValue: doc.data().NonSuperFlexValue,
            SuperFlexValue: doc.data().SuperFlexValue,
            Icon: iconName,
            Team: doc.data().Team,
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

export async function getTeamsFromLeagueData(userid, leagueid) {
  return new Promise((resolve, reject) => {
    const docCollection = query(
      collection(
        db,
        "userprofile",
        userid,
        "leagues",
        leagueid,
        "LeagueRosters"
      ),
      orderBy("DisplayName")
    );

    onSnapshot(
      docCollection,
      (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          var data = {
            id: doc.id,
            DisplayName: doc.data().DisplayName,
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

export async function getBenchPlayers(starters, reserve, players) {
  const starterIDs = starters.map((player) => player.id);
  const reserveIDs = reserve.map((player) => player.id);
  const filteredOutStarters = players.filter(benchItem => !starterIDs.includes(benchItem.id));
  const filteredOutReserve = filteredOutStarters.filter(benchItem => !reserveIDs.includes(benchItem.id));
  return filteredOutReserve;
}
