import React, { useState, useEffect } from "react";
import { useStateContext } from "../../../contexts/ContextProvider";

//Visuals
import { Header } from "../../../components";
import { Box } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Firebase
import { createBigDawgsTeam } from "../../../globalFunctions/firebaseUserFunctions";

//User ID
import { useAuth } from "../../../contexts/AuthContext";

const AddNewTeam = () => {
  const { currentUser } = useAuth();
  const { currentColor } = useStateContext();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createBigDawgsTeam(currentUser.uid,e.target.TeamName.value);
    toast("New team has been added.");
    handleReset();
  };

  async function addNewTeam(data) {
    
  }

  return (
    <>
      <ToastContainer />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleShow}
          sx={{ mr: 2 }} // Adds margin to the right of the button
        >
          Add New Team
        </Button>
      </Box>
      <Dialog open={show} onClose={handleReset}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              id="TeamName"
              label="Team Name"
              type="text"
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

export default AddNewTeam;
