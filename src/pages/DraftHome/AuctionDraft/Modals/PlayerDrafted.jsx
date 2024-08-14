import React, { useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";

//Dialog
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

//Firebase
import { updateDraftStatus, updateQBTotal, updateRBTotal, updateWRTotal, updateTETotal } from "../../../../globalFunctions/firebaseAuctionDraft";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PlayerDrafted = ({ item, icon, auctionSettings }) => {
  const { currentColor } = useStateContext();
  const [show, setShow] = useState(false);
  const [draftAmount, setDraftAmount] = useState(0);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    setDraftAmount(0); 
    handleClose();
  };

  const handleDrafted = async () => {
    //Update Status to Drafted
    await updateDraftStatus(item,"Drafted");
    if (item.Position === "QB") {
      await updateQBTotal((auctionSettings.QBTotalAmount * 1) + (draftAmount * 1));
    } else if (item.Position === "RB") {
      await updateRBTotal((auctionSettings.RBTotalAmount * 1) + (draftAmount * 1));
    } else if (item.Position === "WR") {
      await updateWRTotal((auctionSettings.WRTotalAmount * 1) + (draftAmount * 1));
    } else if (item.Position === "TE") {
      await updateTETotal((auctionSettings.TETotalAmount * 1) + (draftAmount* 1));
    }
     
    toast("Congrats! You Drafted: " + item.FullName);
    handleReset();
  };

  const handleTaken = async () => {
    //Update Status to Taken
    await updateDraftStatus(item,"Taken");
    toast(item.FullName + " was drafted by someone else.");
    handleReset();
  };

  const handleDraftAmountChange = (event) => {
    const value = event.target.value;
    setDraftAmount(value);
    console.log(event.target.value);
  };

  return (
    <>
      <ToastContainer />
      <button
        type="button"
        style={{
          backgroundColor: "#1A97F5",
          color: "White",
        }}
        className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
        onClick={handleShow}
      >
        {icon}
      </button>
      <Dialog open={show} onClose={handleReset}>
        <DialogTitle>{item.FullName}'s Draft Status</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Player"
            type="text"
            fullWidth
            variant="standard"
            value={item.FullName}
            InputProps={{
              readOnly: true, // Set the readOnly property to true
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Position"
            type="text"
            fullWidth
            variant="standard"
            value={item.Position}
            InputProps={{
              readOnly: true, // Set the readOnly property to true
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Team"
            type="text"
            fullWidth
            variant="standard"
            value={item.Team}
            InputProps={{
              readOnly: true, // Set the readOnly property to true
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Draft Amount"
            type="number"
            fullWidth
            variant="standard"
            value={draftAmount}
            onChange={handleDraftAmountChange}
          />
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <button
              type="button"
              style={{
                backgroundColor: "red",
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl font-semibold`}
              onClick={handleTaken}
            >
              Taken
            </button>
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "Grey",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl font-semibold`}
              onClick={handleDrafted}
            >
              Drafted
            </button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlayerDrafted;
