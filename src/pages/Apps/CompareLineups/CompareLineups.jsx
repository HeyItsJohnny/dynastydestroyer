import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

import {
  getLeaguesData,
  getRosterData,
  getTeamRosterData,
  getTeamsFromLeagueData,
} from "../../../globalFunctions/firebaseRostersFunction";

//Functions
import { useAuth } from "../../../contexts/AuthContext";

import UserLineup from "./UserLineup";

const CompareLineups = () => {
  const { currentUser } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [userStarters, setUserStarters] = useState([]);
  const [userIR, setUserIR] = useState([]);
  const [userBench, setUserBench] = useState([]);
  const [teamStarters, setTeamStarters] = useState([]);
  const [teamIR, setTeamIR] = useState([]);
  const [teamBench, setTeamBench] = useState([]);

  const [showStarters, setShowStarters] = useState(true);
  const [showBench, setShowBench] = useState(false);
  const [showIR, setShowIR] = useState(false);

  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const handleLeagueChange = async (event) => {
    setSelectedLeague(event.target.value);
    try {
      const userRosterStartersData = await getRosterData(
        currentUser.uid,
        event.target.value,
        "Starters"
      );
      const teamsFromLeague = await getTeamsFromLeagueData(
        currentUser.uid,
        event.target.value
      );

      const userRosterIRData = await getRosterData(
        currentUser.uid,
        event.target.value,
        "Reserve"
      );
      const userRosterData = await getRosterData(
        currentUser.uid,
        event.target.value,
        "Players"
      );

      const starterIDs = userRosterStartersData.map((player) => player.id);
      const reserveIDs = userRosterIRData.map((player) => player.id);
      const filteredOutStarters = userRosterData.filter(
        (benchItem) => !starterIDs.includes(benchItem.id)
      );

      setUserStarters(userRosterStartersData);
      setUserIR(userRosterIRData);
      setUserBench(
        filteredOutStarters.filter(
          (benchItem) => !reserveIDs.includes(benchItem.id)
        )
      );
      setTeams(teamsFromLeague);

      setTeamStarters([]);
    } catch (error) {
      console.error("Error fetching roster data:", error);
    }
  };

  const handleTeamChange = async (event) => {
    setSelectedTeam(event.target.value);
    try {
      const teamRosterStartersData = await getTeamRosterData(
        currentUser.uid,
        selectedLeague,
        event.target.value,
        "Starters"
      );
      const teamRosterIRData = await getTeamRosterData(
        currentUser.uid,
        selectedLeague,
        event.target.value,
        "Reserve"
      );
      const teamRosterData = await getTeamRosterData(
        currentUser.uid,
        selectedLeague,
        event.target.value,
        "Players"
      );

      const starterIDs = teamRosterStartersData.map((player) => player.id);
      const reserveIDs = teamRosterIRData.map((player) => player.id);
      const filteredOutStarters = teamRosterData.filter(
        (benchItem) => !starterIDs.includes(benchItem.id)
      );

      setTeamStarters(teamRosterStartersData);
      setTeamIR(teamRosterIRData);
      setTeamBench(
        filteredOutStarters.filter(
          (benchItem) => !reserveIDs.includes(benchItem.id)
        )
      );
    } catch (error) {
      console.error("Error fetching roster data:", error);
    }
  };

  const handleShowStartersChange = (event) => {
    setShowStarters(event.target.checked);
  };

  const handleShowBenchChange = (event) => {
    setShowBench(event.target.checked);
  };

  const handleShowIRChange = (event) => {
    setShowIR(event.target.checked);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLeagues(await getLeaguesData(currentUser.uid)); // Uncomment this line to set leagues data
      } catch (error) {
        console.error("Error fetching leagues data:", error);
      }
    };
    fetchData();
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
        <div className="mb-5">
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
        <div className="mb-5">
          {selectedLeague !== "" ? (
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
              <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={handleShowStartersChange}
                      checked={showStarters}
                    />
                  }
                  label="Show Starters"
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={handleShowBenchChange}
                      checked={showBench}
                    />
                  }
                  label="Show Bench Players"
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={handleShowIRChange}
                      checked={showIR}
                    />
                  }
                  label="Show IR Players"
                  labelPlacement="start"
                />
              </FormGroup>
            </FormControl>
          ) : (
            <br></br>
          )}
        </div>
      </div>

      <div className="flex gap-10 flex-wrap justify-center mb-10">
        {selectedLeague !== "" ? (
          showStarters ? (
          <div className="flex gap-10 flex-wrap justify-center">
            <UserLineup lineup={userStarters} heading={"Your Lineup"} />
            <UserLineup lineup={teamStarters} heading={"Opponent Lineup"} />
          </div>
          ) : null
        ) : (
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-200">
            Please select a league.
          </p>
        )}
      </div>
      {showBench ? (
        <div className="flex gap-10 flex-wrap justify-center mb-10">
          <div className="flex gap-10 flex-wrap justify-center">
            <UserLineup lineup={userBench} heading={"Your Bench"} />
            <UserLineup lineup={teamBench} heading={"Opponent Bench"} />
          </div>
        </div>
      ) : null}
      {showIR ? (
        <div className="flex gap-10 flex-wrap justify-center mb-10">
          <div className="flex gap-10 flex-wrap justify-center">
            <UserLineup lineup={userIR} heading={"Your IR"} />
            <UserLineup lineup={teamIR} heading={"Opponent IR"} />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CompareLineups;
