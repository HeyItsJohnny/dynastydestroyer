import React, { useState, useEffect } from "react";

//Visuals
import { Header } from "../../../components";
import {
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
  Box,
} from "@mui/material";
import AddNewTeam from "../Modals/AddNewTeam";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Firebase
import { db } from "../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";
import { getAuctionDataSettings } from "../../../globalFunctions/firebaseAuctionDraft";

//User ID
import { useAuth } from "../../../contexts/AuthContext";

const Teams = () => {
  const { currentUser } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState([]);

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
    //displayPlayerData(event.target.value);
  };

  const fetchTeamsData = async () => {
    const docCollection = query(
      collection(db, "userprofile", currentUser.uid, "teams"),
      orderBy("TeamName")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          TeamName: doc.data().TeamName,
        };
        list.push(data);
      });
      setTeams(list);
    });
  };

  useEffect(() => {
    fetchTeamsData();
    return () => {
      setTeams([]);
    };
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
            {teams.map((team) => (
                <MenuItem value={team.id}>{team.TeamName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <AddNewTeam />
      </div>
    </>
  );
};

export default Teams;
