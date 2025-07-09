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
import { TbSquareRoundedLetterW } from "react-icons/tb";
import DraftTeamComponent from "./DraftTeamComponent";

//Firebase
import { db } from "../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";

//User ID
import { useAuth } from "../../../contexts/AuthContext";

const DraftTeams = () => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);

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
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
      <div className="flex justify-between items-center gap-2">
        <p className="text-xl font-semibold">Teams</p>
      </div>
      {teams.map((team) => (
        <DraftTeamComponent team={team}/>
      ))}
    </div>
  );
};

export default DraftTeams;
