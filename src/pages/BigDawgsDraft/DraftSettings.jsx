import React, { useState, useEffect } from "react";

//User ID
import { useAuth } from "../../contexts/AuthContext";

import {
  getAuctionDataSettings,
  createOrUpdateAuctionDraftSettings,
  resetDraftBoard,
} from "../../globalFunctions/firebaseAuctionDraft";

//UI
import { FormControl, TextField, Button, Box, Grid } from "@mui/material";
import { Header } from "../../components";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DraftSettings = () => {
  const { currentUser } = useAuth();
  const inputStyles = {
    color: "white",
  };

  //Setting VARs
  const [qbPercent, setQBPercent] = useState(null);
  const [rbPercent, setRBPercent] = useState(null);
  const [wrPercent, setWRPercent] = useState(null);
  const [tePercent, setTEPercent] = useState(null);
  const [kPercent, setKPercent] = useState(null);
  const [defPercent, setDEFPercent] = useState(null);
  const [auctionAmount, setAuctionAmount] = useState(null);

  //Fetch Data
  const fetchAuctionSettings = async () => {
    try {
      const data = await getAuctionDataSettings(currentUser.uid);

      setAuctionAmount(data.AuctionAmount);
      setQBPercent(data.QBPercent);
      setRBPercent(data.RBPercent);
      setWRPercent(data.WRPercent);
      setTEPercent(data.TEPercent);
      setKPercent(data.KPercent);
      setDEFPercent(data.DEFPercent);
    } catch (e) {
      console.log(e);
      //alert("Error: " + e);
    }
  };

  //Handle Save Settings
  const handleSaveSettings = async () => {
    const auctionSettings = {
      AuctionAmount: auctionAmount,
      QBPercent: qbPercent,
      RBPercent: rbPercent,
      WRPercent: wrPercent,
      TEPercent: tePercent,
      KPercent: kPercent,
      DEFPercent: defPercent,
    };
    createOrUpdateAuctionDraftSettings(auctionSettings, currentUser.uid);
    toast("Settings have been saved & updated.");
  };

  useEffect(() => {
    fetchAuctionSettings();
    return () => {};
  }, []);
  return (
    <>
      <ToastContainer />
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Big Dawgs Auction Draft" title="Draft Settings" />
        <FormControl variant="outlined" fullWidth>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <TextField
                  InputProps={{ style: inputStyles }}
                  InputLabelProps={{ style: inputStyles, shrink: true }}
                  autoFocus
                  required
                  margin="dense"
                  label="Auction Amount"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={auctionAmount}
                  onChange={(e) => setAuctionAmount(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ flexGrow: 1 }} className="mt-4">
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <TextField
                  InputProps={{ style: inputStyles }}
                  InputLabelProps={{ style: inputStyles, shrink: true }}
                  required
                  margin="dense"
                  label="QB %"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={qbPercent}
                  onChange={(e) => setQBPercent(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  InputProps={{ style: inputStyles }}
                  InputLabelProps={{ style: inputStyles, shrink: true }}
                  required
                  margin="dense"
                  label="RB %"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={rbPercent}
                  onChange={(e) => setRBPercent(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  InputProps={{ style: inputStyles }}
                  InputLabelProps={{ style: inputStyles, shrink: true }}
                  required
                  margin="dense"
                  label="WR %"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={wrPercent}
                  onChange={(e) => setWRPercent(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  InputProps={{ style: inputStyles }}
                  InputLabelProps={{ style: inputStyles, shrink: true }}
                  required
                  margin="dense"
                  label="TE %"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={tePercent}
                  onChange={(e) => setTEPercent(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  InputProps={{ style: inputStyles }}
                  InputLabelProps={{ style: inputStyles, shrink: true }}
                  required
                  margin="dense"
                  label="K %"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={kPercent}
                  onChange={(e) => setKPercent(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  InputProps={{ style: inputStyles }}
                  InputLabelProps={{ style: inputStyles, shrink: true }}
                  required
                  margin="dense"
                  label="DEF %"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={defPercent}
                  onChange={(e) => setDEFPercent(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
              sx={{ mr: 2 }} // Adds margin to the right of the button
            >
              Save Settings
            </Button>
            {/** 
            <Button
              variant="contained"
              color="error"
              onClick={handleDraftBoardReset}
              sx={{ mr: 2 }} // Adds margin to the right of the button
            >
              Reset Draft Board
            </Button>
            */}
            <Button
              variant="contained"
              color="primary"
              onClick={fetchAuctionSettings}
              sx={{ mr: 2 }} // Adds margin to the right of the button
            >
              Refresh Draft Stats
            </Button>
          </Box>
        </FormControl>
      </div>
    </>
  );
};

export default DraftSettings;
