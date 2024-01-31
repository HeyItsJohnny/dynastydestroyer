import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import { playersQBGrid } from "../../../data/gridData";

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

const Players = () => {
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedPosition, setSelectedPosition] = useState("QB");
  const [playerData, setPlayerData] = useState([]);

  const handlePositionChange = async (event) => {
    setSelectedPosition(event.target.value);
    fetchPlayerData(event.target.value);
  };

  const handleYearChange = async (event) => {
    setSelectedYear(event.target.value);
  };

  const fetchPlayerData = async (position) => {
    try {
      const pData = await getPlayerData(position);
      setPlayerData(pData);
    } catch(e) {
      alert("Error: " + e);
    }
  };

  const TESTFunction = async () => {
    try {
      const playerID = "4017"; // Replace with the actual player ID
      const year = "2023"; // Replace with the actual year
  
      const playerStats = await getPlayerStatsData(playerID, year);
      console.log(playerStats);
      // Now you can use playerStats directly in this block
    } catch (error) {
      console.error("Error in exampleUsage:", error);
    }
  }

  useEffect(() => {
    fetchPlayerData("QB");
    
    TESTFunction();
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
          {playersQBGrid.map((item, index) => (
            <ColumnDirective key={item.id} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Search, Edit, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default Players;
