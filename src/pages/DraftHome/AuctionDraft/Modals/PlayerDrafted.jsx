import React, { useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";

//Dialog
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PlayerDrafted = ({ item, icon }) => {
  const { currentColor } = useStateContext();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    handleClose();
  };

  const handleDrafted = (e) => {
    //Update Status to
    toast("Congrats! You Drafted: " + item.FullName);
    handleReset();
  };

  const handleTaken = (e) => {
    //Update Status to Taken
    toast(item.FullName + " was drafted by someone else.");
    handleReset();
  };

  return (
    <>
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
