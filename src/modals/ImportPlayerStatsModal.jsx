import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import { formatPlayerName } from "../globalFunctions/globalFunctions";
import { addOrUpdatePlayerStats } from "../globalFunctions/firebaseFunctions";

import Papa from "papaparse";

const ImportPlayerStatsModal = () => {
  const [show, setShow] = useState(false);
  const [importPosition, setImportPosition] = useState("");
  const [importYear, setImportYear] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { currentColor } = useStateContext();

  const handleReset = () => {
    setImportPosition("");
    setImportYear("");
    handleClose();
  };

  const handlePositionChange = (event) => {
    setImportPosition(event.target.value);
  };

  const handleYearChange = (event) => {
    setImportYear(event.target.value);
  };

  const handleFileChange = (event) => {
    if (importPosition === "" || importYear === "") {
      alert("Positon or Year are blank. They cannot be BLANK.");
    } else {
      try {
        const file = event.target.files[0];
        setCsvFile(file);

        Papa.parse(file, {
          complete: (result) => {
            if (result && result.data) {
              const jsonData = result.data;
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
      const KTCIdentifier = formatPlayerName(data.PlayerName) + "-" + importPosition;
      addOrUpdatePlayerStats(KTCIdentifier, importYear, data);
    });
    //timestampKTCData(currentUser.uid);
    handleReset();
  }

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
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Year</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={importYear}
                label="Year"
                onChange={handleYearChange}
                required
              >
                <MenuItem value="2020">2020</MenuItem>
                <MenuItem value="2021">2021</MenuItem>
                <MenuItem value="2022">2022</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
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

export default ImportPlayerStatsModal;
