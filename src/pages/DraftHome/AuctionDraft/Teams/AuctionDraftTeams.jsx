import React, { useState, useEffect } from "react";

//Visuals
import { Header } from "../../../../components";
import { InputLabel, Select, MenuItem, FormControl } from "@mui/material";
import TeamStatistics from "./TeamStatistics";
import TeamPlayers from "./TeamPlayers";

//Firebase
import { db } from "../../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuctionDataSettings } from "../../../../globalFunctions/firebaseAuctionDraft";

//User ID
import { useAuth } from "../../../../contexts/AuthContext";

const AuctionDraftTeams = () => {
  const { currentUser } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState("");
  const [auctionSettings, setAuctionSettings] = useState({});
  const [auctionDraftStats, setAuctionDraftStats] = useState([]);

  //player data
  const [originalQBData, setOriginalQBData] = useState([]);
  const [originalRBData, setOriginalRBData] = useState([]);
  const [originalWRData, setOriginalWRData] = useState([]);
  const [originalTEData, setOriginalTEData] = useState([]);

  const [QBData, setQBData] = useState([]);
  const [RBData, setRBData] = useState([]);
  const [WRData, setWRData] = useState([]);
  const [TEData, setTEData] = useState([]);

  //Player Totals
  const [QBTotal, setQBTotal] = useState(0);
  const [RBTotal, setRBTotal] = useState(0);
  const [WRTotal, setWRTotal] = useState(0);
  const [TETotal, setTETotal] = useState(0);
  const [totalLeft, setTotalLeft] = useState(0);

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
    displayPlayerData(event.target.value);
  };

  const displayPlayerData = (team) => {
    const filteredQBs = originalQBData.filter((player) => player.DraftedBy === team);
    const filteredRBs = RBData.filter((player) => player.DraftedBy === team);
    const filteredWRs = WRData.filter((player) => player.DraftedBy === team);
    const filteredTEs = TEData.filter((player) => player.DraftedBy === team);

    if (filteredQBs.length > 0) {
      // Update the QBData state with the filtered QBs
      setQBData(filteredQBs);
    } else {
      // If no QBs are found, keep the previous data or handle it accordingly
      console.log("No QBs found for this team");
    }

    setRBData(filteredRBs);
    setWRData(filteredWRs);
    setTEData(filteredTEs);

    let qbTotal = 0;
    let rbTotal = 0;
    let wrTotal = 0;
    let teTotal = 0;

    filteredQBs.forEach((doc) => {
      qbTotal += doc.DraftPrice * 1;
    });

    filteredRBs.forEach((doc) => {
      rbTotal += doc.DraftPrice * 1;
    });

    filteredWRs.forEach((doc) => {
      wrTotal += doc.DraftPrice * 1;
    });

    filteredTEs.forEach((doc) => {
      teTotal += doc.DraftPrice * 1;
    });

    const totalTeamLeft =
      auctionSettings.AuctionAmount - qbTotal - rbTotal - wrTotal - teTotal - 5;

    setQBTotal(qbTotal);
    setRBTotal(rbTotal);
    setWRTotal(wrTotal);
    setTETotal(teTotal);
    setTotalLeft(totalTeamLeft);
    createDraftStatsChart(qbTotal, rbTotal, wrTotal, teTotal, totalTeamLeft);
  };

  const createDraftStatsChart = (
    qbTotal,
    rbTotal,
    wrTotal,
    teTotal,
    totalLeft
  ) => {
    const totalAmount = qbTotal + rbTotal + wrTotal + teTotal;

    const AmountSpentArray = [
      { x: "QB", y: qbTotal },
      { x: "RB", y: rbTotal },
      { x: "WR", y: wrTotal },
      { x: "TE", y: teTotal },
      { x: "Total", y: totalAmount },
    ];

    const QBAmount =
      (auctionSettings.QBPercent / 100) * (auctionSettings.AuctionAmount - 5);
    const RBAmount =
      (auctionSettings.RBPercent / 100) * (auctionSettings.AuctionAmount - 5);
    const WRAmount =
      (auctionSettings.WRPercent / 100) * (auctionSettings.AuctionAmount - 5);
    const TEAmount =
      (auctionSettings.TEPercent / 100) * (auctionSettings.AuctionAmount - 5);

    const QBAmountLeft = QBAmount - qbTotal;
    const RBAmountLeft = RBAmount - rbTotal;
    const WRAmountLeft = WRAmount - wrTotal;
    const TEAmountLeft = TEAmount - teTotal;
    const AmountLeft = totalLeft;

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

  const fetchAuctionSettings = async () => {
    try {
      const data = await getAuctionDataSettings(currentUser.uid);
      setAuctionSettings(data);
    } catch (e) {
      console.log(e);
    }
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
      where("DraftStatus", "==", "Taken")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          AuctionRank: doc.data().AuctionRank,
          DraftStatus: doc.data().DraftStatus,
          DraftedBy: doc.data().DraftedBy,
          DraftPrice: doc.data().DraftPrice,
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
      setQBData(list);
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
      where("DraftStatus", "==", "Taken")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          AuctionRank: doc.data().AuctionRank,
          DraftStatus: doc.data().DraftStatus,
          DraftedBy: doc.data().DraftedBy,
          DraftPrice: doc.data().DraftPrice,
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
      setRBData(list);
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
      where("DraftStatus", "==", "Taken")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          AuctionRank: doc.data().AuctionRank,
          DraftStatus: doc.data().DraftStatus,
          DraftedBy: doc.data().DraftedBy,
          DraftPrice: doc.data().DraftPrice,
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
      setWRData(list);
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
      where("DraftStatus", "==", "Taken")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          AuctionRank: doc.data().AuctionRank,
          DraftStatus: doc.data().DraftStatus,
          DraftedBy: doc.data().DraftedBy,
          DraftPrice: doc.data().DraftPrice,
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
      setTEData(list);
    });
  };

  useEffect(() => {
    fetchAuctionSettings();
    fetchQBPlayerData();
    fetchRBPlayerData();
    fetchWRPlayerData();
    fetchTEPlayerData();
    return () => {
      setQBData([]);
      setRBData([]);
      setWRData([]);
      setTEData([]);
    };
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Auction Draft" title="Team Statistics" />
        <FormControl variant="outlined" fullWidth>
          <InputLabel
            id="demo-simple-select-label"
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
          >
            Select Team
          </InputLabel>
          <Select
            label="Select an option"
            value={selectedTeam}
            onChange={handleTeamChange}
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
          >
            <MenuItem value="Chessie the Destroyer">
              Chessie the Destroyer
            </MenuItem>
            <MenuItem value="Clay Smashyouz">Clay Smashyouz</MenuItem>
            <MenuItem value="Lil-Khat Hairbert">Lil-Khat Hairbert</MenuItem>
            <MenuItem value="King Koopa">King Koopa</MenuItem>
            <MenuItem value="Mr. Irrelevant">Mr. Irrelevant</MenuItem>
            <MenuItem value="The Abrockalypse">The Abrockalypse</MenuItem>
            <MenuItem value="The Dynasty">The Dynasty</MenuItem>
            <MenuItem value="The Commish">The Commish</MenuItem>
            <MenuItem value="Tyreeky Blinders">Tyreeky Blinders</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="flex gap-10 flex-wrap justify-center mt-12">
        <TeamStatistics
          QBTotal={QBTotal}
          RBTotal={RBTotal}
          WRTotal={WRTotal}
          TETotal={TETotal}
          totalLeft={totalLeft}
          auctionDraftStats={auctionDraftStats}
        />
        <TeamPlayers
          qbData={QBData.length ? QBData : []}
          rbData={RBData.length ? RBData : []}
          wrData={WRData.length ? WRData : []}
          teData={TEData.length ? TEData : []}
        />
      </div>
    </>
  );
};

export default AuctionDraftTeams;
