import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { TbLetterQ, TbLetterR, TbLetterW, TbLetterT } from "react-icons/tb";

//Functions
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

import UserLineup from "./UserLineup";

const CompareLineups = () => {
  const { currentUser } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [userStarters, setUserStarters] = useState([]);
  const [teamStarters, setTeamStarters] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const fetchLeagueData = async () => {
    const docCollection = query(
      collection(db, "userprofile", currentUser.uid, "leagues"),
      orderBy("LeagueName")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          LeagueName: doc.data().LeagueName,
        };
        list.push(data);
      });
      setLeagues(list);
    });
  };

  const fetchUserStarterData = async (leagueid) => {
    setUserStarters([]);
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "leagues",
        leagueid,
        "Starters"
      ),
      orderBy("Position")
    );
    onSnapshot(docCollection, (querySnapshot) => {
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
      setUserStarters(list);
    });
  };

  const fetchTeamsData = async (leagueid) => {
    setTeams([]);
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "leagues",
        leagueid,
        "LeagueRosters"
      ),
      orderBy("DisplayName")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          DisplayName: doc.data().DisplayName,
        };
        list.push(data);
      });
      setTeams(list);
    });
  };

  const fetchUserTeamData = async (teamid) => {
    setTeamStarters([]);
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "leagues",
        selectedLeague,
        "LeagueRosters",
        teamid,
        "Starters"
      ),
      orderBy("Position")
    );
    onSnapshot(docCollection, (querySnapshot) => {
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
      setTeamStarters(list);
    });
  };

  const handleLeagueChange = (event) => {
    setSelectedLeague(event.target.value);
    fetchUserStarterData(event.target.value);
    fetchTeamsData(event.target.value);
    setTeamStarters([]);
  };

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
    fetchUserTeamData(event.target.value);
  };

  useEffect(() => {
    fetchLeagueData();
    return () => {
      setLeagues([]); // This worked for me
    };
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Dynasty Destroyer" title="Lineups" />
        <div className="mb-5">
          <FormControl variant="outlined" fullWidth>
            <InputLabel
              id="demo-simple-select-label"
              className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
            >
              Select League
            </InputLabel>
            <Select
              label="Select an option"
              value={selectedLeague}
              onChange={handleLeagueChange}
              className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
            >
              {leagues.map((item) => (
                <MenuItem value={`${item.id}`}>{item.LeagueName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="mb-10">
          {selectedLeague !== "" ? (
            <FormControl variant="outlined" fullWidth>
              <InputLabel
                id="demo-simple-select-label"
                className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
              >
                Select Team
              </InputLabel>
              <Select
                label="Select an option"
                value={selectedTeam}
                onChange={handleTeamChange}
                className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
              >
                {teams.map((item) => (
                  <MenuItem value={`${item.id}`}>{item.DisplayName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <br></br>
          )}
        </div>
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        {selectedLeague !== "" ? (
          <div className="flex gap-10 flex-wrap justify-center">
            <UserLineup lineup={userStarters} heading={"Your Lineup"} />
            <UserLineup lineup={teamStarters} heading={"Opponent Lineup"} />
          </div>
        ) : (
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-200">
            Please select a league.
          </p>
        )}
      </div>
    </>
  );
};

export default CompareLineups;
