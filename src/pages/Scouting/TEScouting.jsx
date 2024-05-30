import React, { useState, useEffect } from "react";
import { Header } from "../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import {
  playersTEWRGrid,
} from "../../data/gridData";

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
  createPlayerStatObject
} from "../../globalFunctions/firebasePlayerFunctions";

//Visual
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";

const TEScouting = () => {
  let grid;
  const navigate = useNavigate();
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
      const data = await getPlayerDataByPosition("TE");
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
    navigate("/scouting/tightends/details/" + args.rowData.SleeperID);
  }

  useEffect(() => {
    fetchPlayerData(selectedYear);
    return () => {
      setPlayerData([]);
    };
  }, []);
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Scouting" title="Tight Ends" />
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
      )}
    </div>
  );
};

export default TEScouting;
