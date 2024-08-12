import React, { useState, useEffect } from "react";

import { TbSquareRoundedLetterW } from "react-icons/tb";

//Components
import PlayerComponentQB from "./PlayerComponentQB";

//Firebase
import { db } from "../../../firebase/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
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
  const [auctionAmount, setAuctionAmount] = useState(null);
  const [qbPercent, setQBPercent] = useState(null);
  const [rbPercent, setRBPercent] = useState(null);
  const [wrPercent, setWRPercent] = useState(null);
  const [tePercent, setTEPercent] = useState(null);
  const [kPercent, setKPercent] = useState(null);
  const [defPercent, setDEFPercent] = useState(null);

  //search
  const [searchQBQuery, setSearchQBQuery] = useState("");
  const [searchRBQuery, setSearchRBQuery] = useState("");
  const [searchWRQuery, setSearchWRQuery] = useState("");
  const [searchTEQuery, setSearchTEQuery] = useState("");

  //player data
  const [QBProspects, setQBProspects] = useState([]);
  const [RBProspects, setRBProspects] = useState([]);
  const [WRProspects, setWRProspects] = useState([]);
  const [TEProspects, setTEProspects] = useState([]);

  const inputStyles = {
    color: "white",
  };

  const filteredQBs = QBProspects.filter((item) =>
    item.FullName.toLowerCase().includes(searchQBQuery.toLowerCase())
  );

  const filteredRBs = RBProspects.filter((item) =>
    item.FullName.toLowerCase().includes(searchRBQuery.toLowerCase())
  );

  const filteredWRs = WRProspects.filter((item) =>
    item.FullName.toLowerCase().includes(searchWRQuery.toLowerCase())
  );

  const filteredTEs = TEProspects.filter((item) =>
    item.FullName.toLowerCase().includes(searchTEQuery.toLowerCase())
  );

  //Fetch Data
  const fetchAuctionSettings = async () => {
    try {
      const data = await getAuctionDataSettings();
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

  const fetchPlayerData = async (position) => {
    const docCollection = query(
      collection(db, "auctiondraft", "players", position),
      orderBy("AuctionRank")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          AuctionRank: doc.data().AuctionRank,
          Age: doc.data().Age,
          College: doc.data().College,
          DepthChartOrder: doc.data().DepthChartOrder,
          FullName: doc.data().FullName,
          InjuryNotes: doc.data().InjuryNotes,
          InjuryStatus: doc.data().InjuryStatus,
          KeepTradeCutIdentifier: doc.data().KeepTradeCutIdentifier,
          NonSuperFlexValue: doc.data().NonSuperFlexValue,
          Position: doc.data().Position,
          SleeperID: doc.data().SleeperID,
          SearchRank: doc.data().SearchRank,
          Status: doc.data().Status,
          SuperFlexValue: doc.data().SuperFlexValue,
          Team: doc.data().Team,
          YearsExperience: doc.data().YearsExperience,
          FantasyPointsAgainst: doc.data().FantasyPointsAgainst,
          Fumbles: doc.data().Fumbles,
          PassingINT: doc.data().PassingINT,
          PassingTD: doc.data().PassingTD,
          PassingYDS: doc.data().PassingYDS,
          Rank: doc.data().Rank,
          ReceivingRec: doc.data().ReceivingRec,
          ReceivingTD: doc.data().ReceivingTD,
          ReceivingYDS: doc.data().ReceivingYDS,
          ReceptionPercentage: doc.data().ReceptionPercentage,
          RushingTD: doc.data().RushingTD,
          RushingYDS: doc.data().RushingYDS,
          RedzoneGoalToGo: doc.data().RedzoneGoalToGo,
          RedzoneTargets: doc.data().RedzoneTargets,
          RedZoneTouches: doc.data().RedZoneTouches,
          ReceivingTargets: doc.data().ReceivingTargets,
          TargetsReceiptions: doc.data().TargetsReceiptions,
          TotalPoints: doc.data().TotalPoints,
          TotalCarries: doc.data().TotalCarries,
          TotalTouches: doc.data().TotalTouches,
        };
        list.push(data);
      });
      switch (position) {
        case "QB": setQBProspects(list);
        case "RB": setRBProspects(list);
        case "WR": setWRProspects(list);
        case "TE": setTEProspects(list);
      }
      
    });
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
    fetchPlayerData("QB");
    fetchPlayerData("RB");
    fetchPlayerData("WR");
    fetchPlayerData("TE");
    return () => {
      setQBProspects([]);
      setRBProspects([]);
      setWRProspects([]);
      setTEProspects([]);
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
      <div className="flex flex-wrap justify-center gap-6">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              QB Prospects
            </Typography>
          </div>
          <TextField
            InputProps={{ style: inputStyles }}
            InputLabelProps={{ style: inputStyles }}
            variant="outlined"
            fullWidth
            placeholder="Search QB Prospects"
            value={searchQBQuery}
            onChange={(e) => setSearchQBQuery(e.target.value)}
            sx={{ marginBottom: 1 }} // Add some margin at the bottom
          />
          <Box
            sx={{
              maxHeight: 300, // Set a fixed height
              overflowY: "auto", // Enable vertical scrolling
              paddingRight: 2, // Add some padding on the right for better look
            }}
            className="mt-5 w-72 md:w-200"
          >
            {filteredQBs.map((item) => (
              <PlayerComponentQB
                item={item}
                icon={<TbSquareRoundedLetterW />}
              />
            ))}
          </Box>
        </div>
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              RB Prospects
            </Typography>
          </div>
          <TextField
            InputProps={{ style: inputStyles }}
            InputLabelProps={{ style: inputStyles }}
            variant="outlined"
            fullWidth
            placeholder="Search RB Prospects"
            value={searchRBQuery}
            onChange={(e) => setSearchRBQuery(e.target.value)}
            sx={{ marginBottom: 1 }} // Add some margin at the bottom
          />
          <Box
            sx={{
              maxHeight: 300, // Set a fixed height
              overflowY: "auto", // Enable vertical scrolling
              paddingRight: 2, // Add some padding on the right for better look
            }}
            className="mt-5 w-72 md:w-200"
          >
            {filteredRBs.map((item) => (
              <PlayerComponentQB
                item={item}
                icon={<TbSquareRoundedLetterW />}
              />
            ))}
          </Box>
        </div>
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              WR Prospects
            </Typography>
          </div>
          <TextField
            InputProps={{ style: inputStyles }}
            InputLabelProps={{ style: inputStyles }}
            variant="outlined"
            fullWidth
            placeholder="Search WR Prospects"
            value={searchWRQuery}
            onChange={(e) => setSearchWRQuery(e.target.value)}
            sx={{ marginBottom: 1 }} // Add some margin at the bottom
          />
          <Box
            sx={{
              maxHeight: 300, // Set a fixed height
              overflowY: "auto", // Enable vertical scrolling
              paddingRight: 2, // Add some padding on the right for better look
            }}
            className="mt-5 w-72 md:w-200"
          >
            {filteredWRs.map((item) => (
              <PlayerComponentQB
                item={item}
                icon={<TbSquareRoundedLetterW />}
              />
            ))}
          </Box>
        </div>
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="h6" gutterBottom>
              TE Prospects
            </Typography>
          </div>
          <TextField
            InputProps={{ style: inputStyles }}
            InputLabelProps={{ style: inputStyles }}
            variant="outlined"
            fullWidth
            placeholder="Search TE Prospects"
            value={searchTEQuery}
            onChange={(e) => setSearchTEQuery(e.target.value)}
            sx={{ marginBottom: 1 }} // Add some margin at the bottom
          />
          <Box
            sx={{
              maxHeight: 300, // Set a fixed height
              overflowY: "auto", // Enable vertical scrolling
              paddingRight: 2, // Add some padding on the right for better look
            }}
            className="mt-5 w-72 md:w-200"
          >
            {filteredTEs.map((item) => (
              <PlayerComponentQB
                item={item}
                icon={<TbSquareRoundedLetterW />}
              />
            ))}
          </Box>
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
          {/** 
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
            */}
        </Paper>
      </div>
    </>
  );
};

export default AuctionDraft;
