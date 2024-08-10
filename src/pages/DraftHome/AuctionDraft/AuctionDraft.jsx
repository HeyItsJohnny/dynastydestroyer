import React, { useState, useEffect } from "react";

import { TbSquareRoundedLetterW } from "react-icons/tb";

//Firebase
import { db } from "../../../firebase/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import {
  getAuctionDataSettings,
  createOrUpdateAuctionDraftSettings,
} from "../../../globalFunctions/firebaseAuctionDraft";

//UI
import {
  FormControl,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { Header } from "../../../components";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuctionDraft = () => {
  const [auctionSettings, setAuctionSettings] = useState({});

  const [auctionAmount, setAuctionAmount] = useState(null);
  const [qbPercent, setQBPercent] = useState(null);
  const [rbPercent, setRBPercent] = useState(null);
  const [wrPercent, setWRPercent] = useState(null);
  const [tePercent, setTEPercent] = useState(null);
  const [kPercent, setKPercent] = useState(null);
  const [defPercent, setDEFPercent] = useState(null);

  const inputStyles = {
    color: "white",
  };

  const testData = [
    {
      id: 1,
      name: "Name 1",
      Description: "Description 1",
    },
    {
      id: 2,
      name: "Name 3",
      Description: "Description 2",
    },
    {
      id: 3,
      name: "Name 3",
      Description: "Description 3",
    },
    {
      id: 4,
      name: "Name 4",
      Description: "Description 4",
    },
    {
      id: 5,
      name: "Name 5",
      Description: "Description 5",
    },
  ];

  const fetchAuctionSettings = async () => {
    try {
      const data = await getAuctionDataSettings();
      setAuctionSettings(data);
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

  //Handle Save
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
    createOrUpdateAuctionDraftSettings(auctionSettings);
    toast("Settings have been saved & updated.");
  };

  useEffect(() => {
    fetchAuctionSettings();
    return () => {
      setAuctionSettings({});
    };
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Auction Draft" title="Amount/Position Percentages" />
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
            >
              Save Settings
            </Button>
          </Box>
        </FormControl>
      </div>
      <div className="flex gap-10 flex-wrap justify-center gap-6">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-64">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              QB Prospects
            </Typography>
          </div>

          <div className="mt-5 w-72 md:w-200">
            <Paper
              elevation={3}
              sx={{
                maxHeight: 200,
                overflow: "auto",
                padding: 2,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              {testData.map((item) => (
                <div className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#1A97F5",
                      color: "White",
                    }}
                    className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                  >
                    <TbSquareRoundedLetterW />
                  </button>
          
                  <div>
                    <p className="text-md font-semibold">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
                <p className={`text-green-600`}>Rank: 69</p>
              </div>
              ))}
            </Paper>
          </div>
        </div>
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              RB Prospects
            </Typography>
          </div>
          <div className="mt-5 w-72 md:w-200">
            {/** 
            {teamWRData.map((player) => (
              <SkillPlayerComponent
                fullname={player.FullName}
                position={player.Position}
                totalpoints={player.TotalPoints}
                rank={player.Rank}
                icon={<TbSquareRoundedLetterW />}
              />
            ))}*/}
          </div>
        </div>
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              WR Prospects
            </Typography>
          </div>
          <div className="mt-5 w-72 md:w-200">
            {/** 
            {teamWRData.map((player) => (
              <SkillPlayerComponent
                fullname={player.FullName}
                position={player.Position}
                totalpoints={player.TotalPoints}
                rank={player.Rank}
                icon={<TbSquareRoundedLetterW />}
              />
            ))}*/}
          </div>
        </div>
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              TE Prospects
            </Typography>
          </div>
          <div className="mt-5 w-72 md:w-200">
            {/** 
            {teamWRData.map((player) => (
              <SkillPlayerComponent
                fullname={player.FullName}
                position={player.Position}
                totalpoints={player.TotalPoints}
                rank={player.Rank}
                icon={<TbSquareRoundedLetterW />}
              />
            ))}*/}
          </div>
        </div>
      </div>
      {/* Scrollable List Section */}
      <div className="m-2 md:m-10 mt-6 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Typography variant="h6" gutterBottom>
          Scrollable List
        </Typography>
        <Paper
          elevation={3}
          sx={{
            maxHeight: 300,
            overflow: "auto",
            padding: 2,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          {testData.map((item) => (
            <Box
              key={item.id}
              sx={{
                padding: 2,
                borderBottom: "1px solid gray",
                color: "white",
              }}
            >
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="body2">{item.Description}</Typography>
            </Box>
          ))}
        </Paper>
      </div>
    </>
  );
};

export default AuctionDraft;
