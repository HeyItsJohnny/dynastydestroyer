import React, { useState, useEffect } from "react";
import { useStateContext } from "../../../contexts/ContextProvider";

//Firebase
import { db } from "../../../firebase/firebase";
import { onSnapshot, doc } from "firebase/firestore";

//Visuals
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Firebase
import { ClearCurrentDraftPlayer, AddPlayerToTeam } from "../../../globalFunctions/firebaseAuctionDraft";
import { setPlayerDraftStatus } from "../../../globalFunctions/firebaseFunctions";

//User ID
import { useAuth } from "../../../contexts/AuthContext";

const DraftModal = ({ team }) => {
  const { currentUser } = useAuth();
  const { currentColor } = useStateContext();
  const [player, setPlayer] = useState({});

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ClearCurrentDraftPlayer(currentUser.uid);
    AddPlayerToTeam(currentUser.uid, team.id, player, e.target.Amount.value * 1);
    setPlayerDraftStatus(player.DatabaseID,"Drafted");
    toast(
      team.TeamName +
        " added (" +
        player.Position +
        ") " +
        player.FullName +
        ": $" +
        e.target.Amount.value
    );
    handleReset();
  };

  useEffect(() => {
    const playerRef = doc(
      db,
      "userprofile",
      currentUser.uid,
      "auctiondraft",
      "currentplayer"
    );

    const unsubscribe = onSnapshot(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayer(snapshot.data());
      } else {
        alert("No current player found");
        setPlayer({});
      }
    });

    return () => unsubscribe(); // clean up listener on unmount
  }, []);

  return (
    <>
      <ToastContainer />
      <button type="button" onClick={handleShow}>
        <p className="text-sm font-semibold">{team.TeamName}</p>
      </button>
      <Dialog open={show} onClose={handleReset}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add Player</DialogTitle>
          <DialogContent>
            <TextField
              label="Team"
              value={team?.TeamName || ""}
              fullWidth
              margin="dense"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Player"
              value={player?.FullName || ""}
              fullWidth
              margin="dense"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />

            <TextField
              autoFocus
              required
              margin="dense"
              id="Amount"
              label="Amount"
              type="number"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <button
              type="submit"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl`}
            >
              Add
            </button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default DraftModal;
