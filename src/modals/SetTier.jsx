import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";

//Dialog
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const SetTier = ({ playerData }) => {
  const { currentColor } = useStateContext();
  const [show, setShow] = useState(false);
  const [tier, setTier] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleTierChange = (event) => {
    setTier(event.target.value);
  };

  const handleReset = () => {
    setTier("");
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //addNewPlanDoc(e);
    //Add or update Tier
    handleReset();
  };

  const setPlayerTier = () => {
    console.log(playerData);
  };

  return (
    <>
      <div className="mb-0">
        <button
          type="button"
          style={{
            backgroundColor: currentColor,
            color: "White",
            borderRadius: "10px",
          }}
          className={`text-md p-3 hover:drop-shadow-xl`}
          onClick={handleShow}
        >
          Set Tier
        </button>
      </div>

      <Dialog open={show} onClose={handleReset}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Set {playerData.FullName} Tier</DialogTitle>
          <DialogContent>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Tier</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={tier}
                label="Position"
                onChange={handleTierChange}
                required
              >
                <MenuItem value="Tier 1">Tier 1</MenuItem>
                <MenuItem value="Tier 2">Tier 2</MenuItem>
                <MenuItem value="Tier 3">Tier 3</MenuItem>
                <MenuItem value="Tier 4">Tier 4</MenuItem>
                <MenuItem value="Tier 5">Tier 5</MenuItem>
              </Select>
            </FormControl>
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
              Set
            </button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default SetTier;
