import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import { playersGrid } from "../../../data/gridData";

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

const Players = () => {
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedPosition, setSelectedPosition] = useState("QB");

  const handlePositionChange = async (event) => {
    setSelectedPosition(event.target.value);
  };

  const handleYearChange = async (event) => {
    setSelectedYear(event.target.value);
  };

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
        //dataSource={choreLogs}
        allowPaging
        allowSorting
        toolbar={["Search"]}
        editSettings={{
          allowDeleting: true,
        }}
        width="auto"
      >
        <ColumnsDirective>
          {playersGrid.map((item, index) => (
            <ColumnDirective key={item.id} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Search, Edit, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default Players;
