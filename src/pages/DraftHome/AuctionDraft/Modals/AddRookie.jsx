import React, { useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";

//User ID
import { useAuth } from "../../../../contexts/AuthContext";

//Dialog
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddRookie = () => {
  const { currentUser } = useAuth();
  const { currentColor } = useStateContext();
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState("");
  const [fullName, setFullName] = useState("");
  const [team, setTeam] = useState("");
  const [ktcID, setKTCID] = useState("");
  const [depthChartOrder, setDepthChartOrder] = useState(0);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    setPosition("");
    setFullName("");
    setTeam("");
    setDepthChartOrder(0);
    setKTCID("");
    handleClose();
  };

  const handlePositionChange = (event) => {
    setPosition(event.target.value);
  };

  const handleFullNameChange = (event) => {
    setFullName(event.target.value);
  };

  const handleKTCIDChange = (event) => {
    setKTCID(event.target.value);
  };

  const handleTeamChange = (event) => {
    setTeam(event.target.value);
  };

  const handleDepthChartOrderChange = (event) => {
    setDepthChartOrder(event.target.value);
  };

  const handleSave = async () => {
    //Add Rookie
    toast("Congrats! You've added a new Rookie: ");
    handleReset();
  };

  return (
    <>
      <ToastContainer />
      <Button
        variant="contained"
        color="primary"
        onClick={handleShow}
        sx={{ mr: 2 }} // Adds margin to the right of the button
      >
        Add Rookie
      </Button>
      <Dialog open={show} onClose={handleReset}>
        <DialogTitle>Add New Rookie</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Position</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={position}
              label="Drafted By"
              onChange={handlePositionChange}
              required
            >
              <MenuItem value="QB">QB</MenuItem>
              <MenuItem value="RB">RB</MenuItem>
              <MenuItem value="WR">WR</MenuItem>
              <MenuItem value="TE">TE</MenuItem>
            </Select>
            <TextField
              autoFocus
              margin="dense"
              label="Full Name"
              type="text"
              fullWidth
              variant="standard"
              value={fullName}
              onChange={handleFullNameChange}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Keep Trade Cut ID"
              type="text"
              fullWidth
              variant="standard"
              value={ktcID}
              onChange={handleKTCIDChange}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Team"
              type="text"
              fullWidth
              variant="standard"
              value={team}
              onChange={handleTeamChange}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Depth Chart Order"
              type="number"
              fullWidth
              variant="standard"
              value={depthChartOrder}
              onChange={handleDepthChartOrderChange}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <button
            type="button"
            style={{
              backgroundColor: currentColor,
              color: "Grey",
              borderRadius: "10px",
            }}
            className={`text-md p-3 hover:drop-shadow-xl font-semibold`}
            onClick={handleSave}
          >
            Save
          </button>
          å{" "}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddRookie;
