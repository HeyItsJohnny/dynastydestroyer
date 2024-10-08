import React, { useState, useEffect } from "react";

//User ID
import { useAuth } from "../../../contexts/AuthContext";

//Player Buttons
import { TbSquareRoundedLetterQ } from "react-icons/tb";
import { TbSquareRoundedLetterR } from "react-icons/tb";
import { TbSquareRoundedLetterW } from "react-icons/tb";
import { TbSquareRoundedLetterT } from "react-icons/tb";

//Components
import PlayerComponentQB from "./QB/PlayerComponentQB";
import PlayerComponentRB from "./RB/PlayerComponentRB";
import PlayerComponentWR from "./WR/PlayerComponentWR";
import PlayerComponentTE from "./TE/PlayerComponentTE";
import DraftStatistics from "./DraftResults/DraftStatistics";
import MyPlayers from "./DraftResults/MyPlayers";
import AuctionTiers from "./AuctionTiers";
import AddRookie from "./Modals/AddRookie";
import Sleepers from "./Sleepers/Sleepers";

//Firebase
import { db } from "../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  getAuctionDataSettings,
  createOrUpdateAuctionDraftSettings,
  resetDraftBoard,
} from "../../../globalFunctions/firebaseAuctionDraft";

//UI
import {
  FormControl,
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  Switch,
} from "@mui/material";
import { Header } from "../../../components";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuctionDraft = () => {
  const { currentUser } = useAuth();

  const [checkedDraftResults, setCheckedDraftResults] = useState(false);
  const [checkedQBTiers, setCheckedQBTiers] = useState(false);
  const [checkedRBTiers, setCheckedRBTiers] = useState(false);
  const [checkedWRTiers, setCheckedWRTiers] = useState(false);
  const [checkedTETiers, setCheckedTETiers] = useState(false);
  const [checkedSleepers, setCheckedSleepers] = useState(false);

  const [auctionDraftStats, setAuctionDraftStats] = useState([]);
  const [auctionSettings, setAuctionSettings] = useState({});
  const [auctionAmount, setAuctionAmount] = useState(null);
  const [qbPercent, setQBPercent] = useState(null);
  const [rbPercent, setRBPercent] = useState(null);
  const [wrPercent, setWRPercent] = useState(null);
  const [tePercent, setTEPercent] = useState(null);
  const [kPercent, setKPercent] = useState(null);
  const [defPercent, setDEFPercent] = useState(null);
  const [qbTotalAmount, setQBTotalAmount] = useState(0);
  const [rbTotalAmount, setRBTotalAmount] = useState(0);
  const [wrTotalAmount, setWRTotalAmount] = useState(0);
  const [teTotalAmount, setTETotalAmount] = useState(0);
  const [totalAmountLeft, setTotalAmountLeft] = useState(0);

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

  //Handle Checkboxes
  const handleDraftResultsCheckboxChange = (event) => {
    setCheckedDraftResults(event.target.checked);
  };

  const handleQBTiersCheckboxChange = (event) => {
    setCheckedQBTiers(event.target.checked);
  };

  const handleRBTiersCheckboxChange = (event) => {
    setCheckedRBTiers(event.target.checked);
  };

  const handleWRTiersCheckboxChange = (event) => {
    setCheckedWRTiers(event.target.checked);
  };

  const handleTETiersCheckboxChange = (event) => {
    setCheckedTETiers(event.target.checked);
  };
  
  const handleSleepersCheckboxChange = (event) => {
    setCheckedSleepers(event.target.checked);
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
      const data = await getAuctionDataSettings(currentUser.uid);
      
      setAuctionAmount(data.AuctionAmount);
      setQBPercent(data.QBPercent);
      setRBPercent(data.RBPercent);
      setWRPercent(data.WRPercent);
      setTEPercent(data.TEPercent);
      setKPercent(data.KPercent);
      setDEFPercent(data.DEFPercent);
      setQBTotalAmount(data.QBTotalAmount);
      setRBTotalAmount(data.RBTotalAmount);
      setWRTotalAmount(data.WRTotalAmount);
      setTETotalAmount(data.TETotalAmount);
      setTotalAmountLeft(
        data.AuctionAmount -
          data.QBTotalAmount -
          data.RBTotalAmount -
          data.WRTotalAmount -
          data.TETotalAmount
      );
      setAuctionSettings(data);
      createDraftStatsChart(data);
    } catch (e) {
      console.log(e);
      //alert("Error: " + e);
    }
  };

  const createDraftStatsChart = (settings) => {
    const totalAmount =
      settings.QBTotalAmount +
      settings.RBTotalAmount +
      settings.WRTotalAmount +
      settings.TETotalAmount;
    const AmountSpentArray = [
      { x: "QB", y: settings.QBTotalAmount },
      { x: "RB", y: settings.RBTotalAmount },
      { x: "WR", y: settings.WRTotalAmount },
      { x: "TE", y: settings.TETotalAmount },
      { x: "Total", y: totalAmount },
    ];

    const QBAmount = (settings.QBPercent / 100) * settings.AuctionAmount;
    const RBAmount = (settings.RBPercent / 100) * settings.AuctionAmount;
    const WRAmount = (settings.WRPercent / 100) * settings.AuctionAmount;
    const TEAmount = (settings.TEPercent / 100) * settings.AuctionAmount;

    const QBAmountLeft = QBAmount - settings.QBTotalAmount;
    const RBAmountLeft = RBAmount - settings.RBTotalAmount;
    const WRAmountLeft = WRAmount - settings.WRTotalAmount;
    const TEAmountLeft = TEAmount - settings.TETotalAmount;
    const AmountLeft = settings.AuctionAmount - totalAmount;

    const AmountLeftArray = [
      { x: "QB", y: QBAmountLeft },
      { x: "RB", y: RBAmountLeft },
      { x: "WR", y: WRAmountLeft },
      { x: "TE", y: TEAmountLeft },
      { x: "Total", y: AmountLeft },
    ];

    const tmpArray = [
      {
        dataSource: AmountSpentArray,
        xName: "x",
        yName: "y",
        name: "Amount Spent",
        type: "StackingColumn",
        background: "blue",
      },
      {
        dataSource: AmountLeftArray,
        xName: "x",
        yName: "y",
        name: "Amount Left",
        type: "StackingColumn",
        background: "red",
      },
    ];

    setAuctionDraftStats(tmpArray);
  };

  const fetchQBPlayerData = async () => {
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "auctiondraft",
        "players",
        "QB"
      ),
      where("DraftStatus", "==", "Open"),
      orderBy("CurrentAuctionRank")
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
          Tier: doc.data().Tier,
          TotalPoints: doc.data().TotalPoints,
          TotalCarries: doc.data().TotalCarries,
          TotalTouches: doc.data().TotalTouches,
          WeeklyPoints: doc.data().WeeklyPoints,
        };
        list.push(data);
      });
      setQBProspects(list);
    });
  };

  const fetchRBPlayerData = async () => {
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "auctiondraft",
        "players",
        "RB"
      ),
      where("DraftStatus", "==", "Open"),
      orderBy("CurrentAuctionRank")
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
          Tier: doc.data().Tier,
          TotalPoints: doc.data().TotalPoints,
          TotalCarries: doc.data().TotalCarries,
          TotalTouches: doc.data().TotalTouches,
          WeeklyPoints: doc.data().WeeklyPoints,
        };
        list.push(data);
      });
      setRBProspects(list);
    });
  };

  const fetchWRPlayerData = async () => {
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "auctiondraft",
        "players",
        "WR"
      ),
      where("DraftStatus", "==", "Open"),
      orderBy("CurrentAuctionRank")
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
          Tier: doc.data().Tier,
          TotalPoints: doc.data().TotalPoints,
          TotalCarries: doc.data().TotalCarries,
          TotalTouches: doc.data().TotalTouches,
          WeeklyPoints: doc.data().WeeklyPoints,
        };
        list.push(data);
      });
      setWRProspects(list);
    });
  };

  const fetchTEPlayerData = async () => {
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "auctiondraft",
        "players",
        "TE"
      ),
      where("DraftStatus", "==", "Open"),
      orderBy("CurrentAuctionRank")
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
          Tier: doc.data().Tier,
          TotalPoints: doc.data().TotalPoints,
          TotalCarries: doc.data().TotalCarries,
          TotalTouches: doc.data().TotalTouches,
          WeeklyPoints: doc.data().WeeklyPoints,
        };
        list.push(data);
      });
      setTEProspects(list);
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
      QBTotalAmount: qbTotalAmount,
      RBTotalAmount: rbTotalAmount,
      WRTotalAmount: wrTotalAmount,
      TETotalAmount: teTotalAmount,
    };
    createOrUpdateAuctionDraftSettings(auctionSettings, currentUser.uid);
    toast("Settings have been saved & updated.");
  };

  const handleDraftBoardReset = () => {
    resetDraftBoard(currentUser.uid);
    toast("Draft Board has been reset.");
  };

  useEffect(() => {
    fetchAuctionSettings();
    fetchQBPlayerData();
    fetchRBPlayerData();
    fetchWRPlayerData();
    fetchTEPlayerData();
    return () => {
      setQBProspects([]);
      setRBProspects([]);
      setWRProspects([]);
      setTEProspects([]);
      setAuctionSettings({});
      setAuctionDraftStats([]);
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
            <AddRookie />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchAuctionSettings}
              sx={{ mr: 2 }} // Adds margin to the right of the button
            >
              Refresh Draft Stats
            </Button>
            
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Typography gutterBottom>Show Draft Results</Typography>
            <Switch
              checked={checkedDraftResults}
              onChange={handleDraftResultsCheckboxChange}
            />
            <Typography gutterBottom>Show QB Tiers</Typography>
            <Switch
              checked={checkedQBTiers}
              onChange={handleQBTiersCheckboxChange}
            />
            <Typography gutterBottom>Show RB Tiers</Typography>
            <Switch
              checked={checkedRBTiers}
              onChange={handleRBTiersCheckboxChange}
            />
            <Typography gutterBottom>Show WR Tiers</Typography>
            <Switch
              checked={checkedWRTiers}
              onChange={handleWRTiersCheckboxChange}
            />
            <Typography gutterBottom>Show TE Tiers</Typography>
            <Switch
              checked={checkedTETiers}
              onChange={handleTETiersCheckboxChange}
            />
            <Typography gutterBottom>Show Sleepers</Typography>
            <Switch
              checked={checkedSleepers}
              onChange={handleSleepersCheckboxChange}
            />
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
                icon={<TbSquareRoundedLetterQ />}
                auctionSettings={auctionSettings}
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
              <PlayerComponentRB
                item={item}
                icon={<TbSquareRoundedLetterR />}
                auctionSettings={auctionSettings}
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
              <PlayerComponentWR
                item={item}
                icon={<TbSquareRoundedLetterW />}
                auctionSettings={auctionSettings}
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
              <PlayerComponentTE
                item={item}
                icon={<TbSquareRoundedLetterT />}
                auctionSettings={auctionSettings}
              />
            ))}
          </Box>
        </div>
      </div>
      {/* QB Tiers*/}
      {checkedQBTiers && (
        <AuctionTiers playerData={QBProspects} title="Quarterbacks" />
      )}

      {/* RB Tiers*/}
      {checkedRBTiers && (
        <AuctionTiers playerData={RBProspects} title="Running Backs" />
      )}

      {/* WR Tiers*/}
      {checkedWRTiers && (
        <AuctionTiers playerData={WRProspects} title="Wide Receivers" />
      )}

      {/* TE Tiers*/}
      {checkedTETiers && (
        <AuctionTiers playerData={TEProspects} title="Tight Ends" />
      )}

      {/* Draft Results*/}
      {checkedDraftResults && (
        <>
          <div className="flex gap-10 flex-wrap justify-center mt-12">
            <DraftStatistics
              totalAmountLeft={totalAmountLeft}
              auctionSettings={auctionSettings}
              auctionDraftStats={auctionDraftStats}
            />
            <MyPlayers />
          </div>
        </>
      )}

      {/* TE Tiers*/}
      {checkedSleepers && (
        <Sleepers />
      )}
    </>
  );
};

export default AuctionDraft;
