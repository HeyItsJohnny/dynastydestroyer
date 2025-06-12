import React, { useState, useEffect } from "react";
import { Header } from "../../components";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import { playersTEWRGrid } from "../../data/gridData";
import { useStateContext } from "../../contexts/ContextProvider";
import { useAuth } from "../../contexts/AuthContext";

import { createOrUpdateTierData } from "../../globalFunctions/firebaseUserFunctions";
import { createOrUpdatePlayerAuctionData } from "../../globalFunctions/firebaseAuctionDraft";

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

const Tightends = () => {
  let grid;
  const navigate = useNavigate();
  const { currentColor } = useStateContext();
  const { currentUser } = useAuth();
  const [playerData, setPlayerData] = useState([]);

  let [loading, setLoading] = useState(false);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const data = await getPlayerDataByPosition("TE");
      const sortedPlayerStatsArray = data.sort(
        (a, b) => a.PositionRank - b.PositionRank
      );
      setPlayerData(sortedPlayerStatsArray);
      setLoading(false);
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const handleActionComplete = (args) => {
    console.log(args);
  };

  function handleDoubleClick(args) {
    navigate(
      "/players/tightends/details/" +
        args.rowData.Position +
        "-" +
        args.rowData.SearchFullName
    );
  }

  useEffect(() => {
    fetchPlayerData();
    return () => {
      setPlayerData([]);
    };
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Players" title="Tight Ends" />
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
          <GridComponent
            id="gridcomp"
            dataSource={playerData}
            actionComplete={handleActionComplete}
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
            <Inject services={[Page, Search, Toolbar, Selection]} />
          </GridComponent>
        </>
      )}
    </div>
  );
};

export default Tightends;
