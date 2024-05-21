import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
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
import { addOrUpdatePlayerWeeklyStats } from "../globalFunctions/firebaseFunctions";

import Papa from "papaparse";

const ImportPlayerWeeklyStatsModal = () => {
  const [show, setShow] = useState(false);
  const [importPosition, setImportPosition] = useState("");
  const [importYear, setImportYear] = useState("");
  const [importWeek, setImportWeek] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    setImportPosition("");
    setImportYear("");
    setImportWeek("");
    handleClose();
  };

  const handlePositionChange = (event) => {
    setImportPosition(event.target.value);
  };

  const handleYearChange = (event) => {
    setImportYear(event.target.value);
  };

  const handleWeekChange = (event) => {
    setImportWeek(event.target.value);
  };

  const handleFileChange = (event) => {
    if (importPosition === "" || importYear === "" || importWeek === "") {
      alert("Positon, Year or Week are blank. They cannot be BLANK.");
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
      if (parseFloat(data.TotalPoints) > 0) {
        const KTCIdentifier = formatPlayerName(data.PlayerName) + "-" + importPosition;
        addOrUpdatePlayerWeeklyStats(KTCIdentifier, importYear, importWeek, data);
      }
    });
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
        <DialogTitle>Import GitHub Player Weekly Stats</DialogTitle>
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
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Week</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={importWeek}
              label="Year"
              onChange={handleWeekChange}
              required
            >
              <MenuItem value="Week1">Week 1</MenuItem>
              <MenuItem value="Week2">Week 2</MenuItem>
              <MenuItem value="Week3">Week 3</MenuItem>
              <MenuItem value="Week4">Week 4</MenuItem>
              <MenuItem value="Week5">Week 5</MenuItem>
              <MenuItem value="Week6">Week 6</MenuItem>
              <MenuItem value="Week7">Week 7</MenuItem>
              <MenuItem value="Week8">Week 8</MenuItem>
              <MenuItem value="Week9">Week 9</MenuItem>
              <MenuItem value="Week10">Week 10</MenuItem>
              <MenuItem value="Week11">Week 11</MenuItem>
              <MenuItem value="Week12">Week 12</MenuItem>
              <MenuItem value="Week13">Week 13</MenuItem>
              <MenuItem value="Week14">Week 14</MenuItem>
              <MenuItem value="Week15">Week 15</MenuItem>
              <MenuItem value="Week16">Week 16</MenuItem>
              <MenuItem value="Week17">Week 17</MenuItem>
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

export default ImportPlayerWeeklyStatsModal;
