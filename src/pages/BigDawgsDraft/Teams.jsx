import React, { useState, useEffect } from "react";

//Visuals
import { Header } from "../../components";
import { InputLabel, Select, MenuItem, FormControl, Button, Box } from "@mui/material";
import AddNewTeam from "./Modals/AddNewTeam";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Firebase
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuctionDataSettings } from "../../globalFunctions/firebaseAuctionDraft";

//User ID
import { useAuth } from "../../contexts/AuthContext";

const Teams = () => {
  const { currentUser } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState("");

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
    //displayPlayerData(event.target.value);
  };

  //Handle New Team
  const handleNewTeam = async () => {
    toast("Settings have been saved & updated.");
  };

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Big Dawgs" title="Teams" />
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
            <MenuItem value="Chessie the Destroyer">
              Chessie the Destroyer
            </MenuItem>
            <MenuItem value="Clay Smashyouz">Clay Smashyouz</MenuItem>
            <MenuItem value="Lil-Khat Hairbert">Lil-Khat Hairbert</MenuItem>
            <MenuItem value="King Koopa">King Koopa</MenuItem>
            <MenuItem value="Mr. Irrelevant">Mr. Irrelevant</MenuItem>
            <MenuItem value="The Abrockalypse">The Abrockalypse</MenuItem>
            <MenuItem value="The Dynasty">The Dynasty</MenuItem>
            <MenuItem value="The Commish">The Commish</MenuItem>
            <MenuItem value="Tyreeky Blinders">Tyreeky Blinders</MenuItem>
          </Select>
        </FormControl>
        <AddNewTeam />
      </div>
    </>
  );
};

export default Teams;
