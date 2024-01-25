import React, { useState, useEffect } from "react";
import { Header } from "../../components";

//Functions
import { getLeaguesData, getRosterData} from "../../globalFunctions/firebaseRostersFunction";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

//Functions
import { useAuth } from "../../contexts/AuthContext";

import UserStartersComponent from "./UserStartersComponent";
import HomeDetails from "./HomeDetails";

const Home = () => {
  const { currentUser } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [userStarters, setUserStarters] = useState([]);
  const [userBenchPlayers, setUserBenchPlayers] = useState([]);
  const [userIR, setUserIR] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [showBench, setShowBench] = useState(false);
  const [showIR, setShowIR] = useState(false);

  const handleLeagueChange = async (event) => {
    setSelectedLeague(event.target.value);

    try {
      const userRosterStartersData = await getRosterData(currentUser.uid, event.target.value, "Starters");

      const userRosterIRData = await getRosterData(currentUser.uid, event.target.value, "Reserve");
      const userRosterData = await getRosterData(currentUser.uid, event.target.value, "Players");

      const starterIDs = userRosterStartersData.map(player => player.id);
      const reserveIDs = userRosterIRData.map(player => player.id);
      const filteredOutStarters = userRosterData.filter(benchItem => !starterIDs.includes(benchItem.id));

      setUserStarters(userRosterStartersData);
      setUserIR(userRosterIRData);
      setUserBenchPlayers(filteredOutStarters.filter(benchItem => !reserveIDs.includes(benchItem.id)));

    } catch (error) {
      console.error("Error fetching roster data:", error);
    }
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
        <Header category="Dynasty Destroyer" title="Command Center" />
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
        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
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
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        {selectedLeague !== "" ? (
          <div className="flex gap-10 flex-wrap justify-center">
            <HomeDetails />
            <UserStartersComponent
              userStarters={userStarters}
              heading="Starters"
            />
            {showBench ? (
              <UserStartersComponent
                userStarters={userBenchPlayers}
                heading="Bench"
              />
            ) : null}
            {showIR ? (
              <UserStartersComponent
                userStarters={userIR}
                heading="Injured Reserve"
              />
            ) : null}
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

export default Home;
