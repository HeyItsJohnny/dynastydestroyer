import React, { useState, useEffect } from "react";
import { Header } from "../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import { playersTEWRGrid } from "../../data/gridData";

import { createOrUpdateTierData } from "../../globalFunctions/firebaseUserFunctions";
import { createOrUpdatePlayerAuctionData } from "../../globalFunctions/firebaseAuctionDraft";

import { useStateContext } from "../../contexts/ContextProvider";
import { useAuth } from "../../contexts/AuthContext";

import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Selection,
  Page,
  Search,
  Inject,
  Toolbar,
} from "@syncfusion/ej2-react-grids";

import {
  getPlayerDataByPosition,
  getPlayerStatsData,
  createPlayerStatObject,
} from "../../globalFunctions/firebasePlayerFunctions";

//Visual
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WRScouting = () => {
  let grid;
  const navigate = useNavigate();
  const { currentColor } = useStateContext();
  const { currentUser } = useAuth();
  const [selectedYear, setSelectedYear] = useState("2023");
  const [playerData, setPlayerData] = useState([]);
  let [loading, setLoading] = useState(false);

  const handleYearChange = async (event) => {
    setSelectedYear(event.target.value);
    fetchPlayerData(event.target.value);
  };

  const fetchPlayerData = async (year) => {
    try {
      setLoading(true);
      const data = await getPlayerDataByPosition("WR");
      addPlayerStats(data, year);
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const addPlayerStats = async (data, year) => {
    try {
      const playerStatsArray = [];

      for (const player of data) {
        try {
          const getPlayerStats = await getPlayerStatsData(
            player.SleeperID,
            year
          );
          var playerStats = createPlayerStatObject(player, getPlayerStats);
          playerStatsArray.push(playerStats);
        } catch (error) {
          console.error(
            `Error fetching stats for player ${player.SleeperID}:`,
            error
          );
        }
      }
      const sortedPlayerStatsArray = playerStatsArray.sort(
        (a, b) => a.Rank - b.Rank
      );
      setPlayerData(sortedPlayerStatsArray);
      setLoading(false);
    } catch (error) {
      console.error("Error in addPlayerStats:", error);
    }
  };

  function handleDoubleClick(args) {
    navigate("/scouting/widereceivers/details/" + args.rowData.SleeperID);
  }

  const addAllPlayersToAuctionDraft = () => {
    var rank = 1;
    playerData.forEach((data) => {
      createOrUpdatePlayerAuctionData(data, rank, currentUser.uid);
      rank += 1;
    });
    toast("Players added to Auction Draft");
  };

  const handleTier1 = () => {
    if (grid) {
      const selectedrecords = grid.getSelectedRecords();
      selectedrecords.forEach((data) => {
        createOrUpdateTierData(currentUser.uid, data, "Tier 1");
        toast(data.FullName + " has been added to Tier 1!");
      });
      grid.clearSelection();
    }
  };

  const handleTier2 = () => {
    if (grid) {
      const selectedrecords = grid.getSelectedRecords();
      selectedrecords.forEach((data) => {
        createOrUpdateTierData(currentUser.uid, data, "Tier 2");
        toast(data.FullName + " has been added to Tier 2!");
      });
      grid.clearSelection();
    }
  };

  const handleTier3 = () => {
    if (grid) {
      const selectedrecords = grid.getSelectedRecords();
      selectedrecords.forEach((data) => {
        createOrUpdateTierData(currentUser.uid, data, "Tier 3");
        toast(data.FullName + " has been added to Tier 3!");
      });
      grid.clearSelection();
    }
  };

  const handleTier4 = () => {
    if (grid) {
      const selectedrecords = grid.getSelectedRecords();
      selectedrecords.forEach((data) => {
        createOrUpdateTierData(currentUser.uid, data, "Tier 4");
        toast(data.FullName + " has been added to Tier 4!");
      });
      grid.clearSelection();
    }
  };

  const handleTier5 = () => {
    if (grid) {
      const selectedrecords = grid.getSelectedRecords();
      selectedrecords.forEach((data) => {
        createOrUpdateTierData(currentUser.uid, data, "Tier 5");
        toast(data.FullName + " has been added to Tier 5!");
      });
      grid.clearSelection();
    }
  };

  useEffect(() => {
    fetchPlayerData(selectedYear);
    return () => {
      setPlayerData([]);
    };
  }, []);
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Scouting" title="Wide Receivers" />
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
      <ToastContainer />
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
        <>
          <div className="mb-5">
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl`}
              onClick={addAllPlayersToAuctionDraft}
            >
              Add Players to Auction Draft
            </button>
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl ml-4`}
              onClick={handleTier1}
            >
              Set Tier 1
            </button>
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl ml-4`}
              onClick={handleTier2}
            >
              Set Tier 2
            </button>
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl ml-4`}
              onClick={handleTier3}
            >
              Set Tier 3
            </button>
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl ml-4`}
              onClick={handleTier4}
            >
              Set Tier 4
            </button>
            <button
              type="button"
              style={{
                backgroundColor: currentColor,
                color: "White",
                borderRadius: "10px",
              }}
              className={`text-md p-3 hover:drop-shadow-xl ml-4`}
              onClick={handleTier5}
            >
              Set Tier 5
            </button>
          </div>
          <GridComponent
            id="gridcomp"
            dataSource={playerData}
            allowPaging
            allowSorting
            toolbar={["Search"]}
            width="auto"
            recordDoubleClick={handleDoubleClick}
            ref={(g) => (grid = g)}
          >
            <ColumnsDirective>
              {playersTEWRGrid.map((item, index) => (
                <ColumnDirective key={item.id} {...item} />
              ))}
            </ColumnsDirective>
            <Inject services={[Page, Search, Selection, Toolbar]} />
          </GridComponent>
        </>
      )}
    </div>
  );
};

export default WRScouting;
