import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import { playersQBGrid, playersRBGrid, playersTEWRGrid } from "../../../data/gridData";

import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Search,
  Inject,
  Edit,
  Toolbar,
} from "@syncfusion/ej2-react-grids";

import { getPlayerData, getPlayerStatsData } from "../../../globalFunctions/firebasePlayerFunctions";

//Visual
import ClipLoader from "react-spinners/ClipLoader";

const Players = () => {
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedPosition, setSelectedPosition] = useState("QB");
  const [playerData, setPlayerData] = useState([]);
  let [loading, setLoading] = useState(false);

  const handlePositionChange = async (event) => {
    setSelectedPosition(event.target.value);
    fetchPlayerData(event.target.value, selectedYear);
  };

  const handleYearChange = async (event) => {
    setSelectedYear(event.target.value);
    fetchPlayerData(selectedPosition, event.target.value);
  };

  const fetchPlayerData = async (position, year) => {
    try {
      setLoading(true);
      const data = await getPlayerData(position);
      addPlayerStats(data, year);
    } catch(e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const addPlayerStats = async (data, year) => {
    try {
      const playerStatsArray = [];
  
      for (const player of data) {
        try {
          const getPlayerStats = await getPlayerStatsData(player.SleeperID, year);
          var playerStats = {
            Age: player.Age,
            College: player.College,
            DepthChartOrder: player.DepthChartOrder,
            FullName: player.FullName,
            InjuryNotes: player.InjuryNotes,
            InjuryStatus: player.InjuryStatus,
            KeepTradeCutIdentifier: player.KeepTradeCutIdentifier,
            NonSuperFlexValue: player.NonSuperFlexValue,
            Position: player.Position,
            SleeperID: player.SleeperID,
            SearchRank: player.SearchRank,
            Status: player.Status,
            SuperFlexValue: player.SuperFlexValue,
            Team: player.Team,
            YearsExperience: player.YearsExperience,
            FantasyPointsAgainst: getPlayerStats.FantasyPointsAgainst,
            Fumbles: getPlayerStats.Fumbles,
            PassingINT: getPlayerStats.PassingINT,
            PassingTD: getPlayerStats.PassingTD,
            PassingYDS: getPlayerStats.PassingYDS,
            Rank: getPlayerStats.Rank,
            ReceivingRec: getPlayerStats.ReceivingRec,
            ReceivingTD: getPlayerStats.ReceivingTD,
            ReceivingYDS: getPlayerStats.ReceivingYDS,
            ReceptionPercentage: getPlayerStats.ReceptionPercentage,
            RushingTD: getPlayerStats.RushingTD,
            RushingYDS: getPlayerStats.RushingYDS,
            RedzoneGoalToGo: getPlayerStats.RedzoneGoalToGo,
            RedzoneTargets: getPlayerStats.RedzoneTargets,
            RedZoneTouches: getPlayerStats.RedZoneTouches,
            ReceivingTargets: getPlayerStats.ReceivingTargets,
            TargetsReceiptions: getPlayerStats.TargetsReceiptions,
            TotalPoints: getPlayerStats.TotalPoints,
            TotalCarries: getPlayerStats.TotalCarries,
            TotalTouches: getPlayerStats.TotalTouches
          }
          playerStatsArray.push(playerStats);
        } catch (error) {
          console.error(`Error fetching stats for player ${player.SleeperID}:`, error);
        }
      }
      const sortedPlayerStatsArray = playerStatsArray.sort((a, b) => a.Rank - b.Rank);
      setPlayerData(sortedPlayerStatsArray);
      setLoading(false);
    } catch (error) {
      console.error("Error in addPlayerStats:", error);
    }
  }

  useEffect(() => {
    fetchPlayerData(selectedPosition, selectedYear);    
    return () => {
      setPlayerData([]);
    };
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Apps" title="Players" />
      <FormControl variant="outlined" fullWidth>
        <InputLabel
          id="demo-simple-select-label"
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
        >
          Year
        </InputLabel>
        <Select
          label="Select an option"
          value={selectedYear}
          onChange={handleYearChange}
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
        >
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="2022">2022</MenuItem>
          <MenuItem value="2021">2021</MenuItem>
          <MenuItem value="2020">2020</MenuItem>
        </Select>
      </FormControl>
      <div className="mb-5"></div>
      <FormControl variant="outlined" fullWidth>
        <InputLabel
          id="demo-simple-select-label"
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
        >
          Select Position
        </InputLabel>
        <Select
          label="Select an option"
          value={selectedPosition}
          onChange={handlePositionChange}
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
        >
          <MenuItem value="QB">QB</MenuItem>
          <MenuItem value="RB">RB</MenuItem>
          <MenuItem value="TE">TE</MenuItem>
          <MenuItem value="WR">WR</MenuItem>
        </Select>
      </FormControl>
      <div className="mb-5"></div>
      {loading ? (
        <div className="flex justify-between items-center gap-2">
          <ClipLoader
            color="#ffffff"
            loading={loading}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
      <GridComponent
        id="gridcomp"
        dataSource={playerData}
        allowPaging
        allowSorting
        toolbar={["Search"]}
        editSettings={{
          allowDeleting: true,
        }}
        width="auto"
      >
        <ColumnsDirective>
        
          
          {selectedPosition === "QB" ? (
            playersQBGrid.map((item, index) => (
              <ColumnDirective key={item.id} {...item} />
            ))
          ) : (
            <br></br>
          )}

          {selectedPosition === "RB" ? (
            playersRBGrid.map((item, index) => (
              <ColumnDirective key={item.id} {...item} />
            ))
          ) : (
            <br></br>
          )}

          {selectedPosition === "TE" ? (
            playersTEWRGrid.map((item, index) => (
              <ColumnDirective key={item.id} {...item} />
            ))
          ) : (
            <br></br>
          )}

          {selectedPosition === "WR" ? (
            playersTEWRGrid.map((item, index) => (
              <ColumnDirective key={item.id} {...item} />
            ))
          ) : (
            <br></br>
          )}
        </ColumnsDirective>
        <Inject services={[Page, Search, Edit, Toolbar]} />
      </GridComponent>
      )}
    </div>
  );
};

{playersQBGrid.map((item, index) => (
  <ColumnDirective key={item.id} {...item} />
))}

export default Players;
