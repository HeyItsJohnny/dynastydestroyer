import React, { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import { ClearCurrentDraftPlayer } from "../../../../globalFunctions/firebaseAuctionDraft";
import { useAuth } from "../../../../contexts/AuthContext";

import { resetPlayerDraftStatus } from "../../../../globalFunctions/firebaseFunctions";

//Firebase
import { db } from "../../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DraftResetComponent = () => {
  const { currentUser } = useAuth();

  const handleReset = async () => {
    ClearCurrentDraftPlayer(currentUser.uid); //Reset Draft
    ResetTeamPlayers(); //Delete all players from teams
    ResetDraftStatus(); //Set all players draft status back to "N/A"
    toast("RESET: Players deleted from teams and players draftable.");
  };

  const ResetDraftStatus = async () => {
    const docCollection = query(
      collection(db, "players"),
      where("DraftStatus", "!=", "N/A")
    );

    const snapshot = await getDocs(docCollection);

    for (const doc of snapshot.docs) {
      await resetPlayerDraftStatus(doc.data().DatabaseID);
    }
  };

  const ResetTeamPlayers = async () => {
    const teamsCollection = collection(
      db,
      "userprofile",
      currentUser.uid,
      "teams"
    );
    const teamsSnapshot = await getDocs(teamsCollection);

    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;
      const playersCollection = collection(
        db,
        "userprofile",
        currentUser.uid,
        "teams",
        teamId,
        "players"
      );
      const playersSnapshot = await getDocs(playersCollection);

      for (const playerDoc of playersSnapshot.docs) {
        await deleteDoc(playerDoc.ref); // delete each player in the team
      }

      console.log(`Cleared players for team: ${teamId}`);
    }
  };

  return (
    <>
      <ToastContainer />
      <Button
        variant="contained"
        color="error"
        onClick={handleReset}
        sx={{ mr: 2 }} // Adds margin to the right of the button
      >
        Reset Draft
      </Button>
    </>
  );
};

export default DraftResetComponent;
