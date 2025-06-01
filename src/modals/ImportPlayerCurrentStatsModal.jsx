import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import { formatPlayerName } from "../globalFunctions/globalFunctions";
import {
  addPlayerCurrentStats,
  timestampStatsData,
} from "../globalFunctions/firebaseFunctions";

import Papa from "papaparse";

const ImportPlayerCurrentStatsModal = () => {
  const [show, setShow] = useState(false);
  const [importPosition, setImportPosition] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    setImportPosition("");
    handleClose();
  };

  const handlePositionChange = (event) => {
    setImportPosition(event.target.value);
  };

  const handleFileChange = (event) => {
    if (importPosition === "") {
      alert("Positon is blank. Position cannot be BLANK.");
    } else {
      try {
        const file = event.target.files[0];
        setCsvFile(file);

        Papa.parse(file, {
          complete: (result) => {
            if (result && result.data) {
              //const jsonData = result.data;
              const jsonData = result.data.map((row) => {
                // Replace empty values with 0
                return Object.fromEntries(
                  Object.entries(row).map(([key, value]) => [
                    key,
                    value === "" ? 0 : value,
                  ])
                );
              });
              //console.log(jsonData);
              UpdatePlayerStats(jsonData);
            } else {
              alert("Error parsing CSV file:", result.errors);
            }
          },
          header: true,
          skipEmptyLines: true,
        });
      } catch (e) {
        alert("Error: " + e);
      }
    }
  };

  const UpdatePlayerStats = (playerStats) => {
    playerStats.forEach((data) => {
      const playerID = importPosition + "-" + formatPlayerName(data.PlayerName);
      addPlayerCurrentStats(playerID, data);
    });
    timestampStatsData();
    handleReset();
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleShow}
        style={{ width: "100%" }}
      >
        Import
      </Button>
      <Dialog open={show} onClose={handleReset}>
        <DialogTitle>Import GitHub Player Stats</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Position</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={importPosition}
              label="Position"
              onChange={handlePositionChange}
              required
            >
              <MenuItem value="QB">QB</MenuItem>
              <MenuItem value="RB">RB</MenuItem>
              <MenuItem value="TE">TE</MenuItem>
              <MenuItem value="WR">WR</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogContent>
          <TextField
            type="file"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            onChange={handleFileChange}
            accept=".csv"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportPlayerCurrentStatsModal;
