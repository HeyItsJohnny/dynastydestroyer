import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { Header } from "../../components";
import { db } from "../../firebase/firebase";
import { allPlayersGrid } from "../../data/gridData";

import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Search,
  Sort,
  Filter,
  Inject,
  Toolbar,
} from "@syncfusion/ej2-react-grids";

import ClipLoader from "react-spinners/ClipLoader";

const getFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizePlayerData = (playerId, playerData) => ({
  PlayerID: playerId,
  SleeperID: getFirstValue(
    playerData.SleeperID,
    playerData.sleeperId,
    playerData.sourceIds?.sleeper,
    playerId
  ),
  FullName: getFirstValue(playerData.FullName, playerData.fullName, ""),
  Position: getFirstValue(playerData.Position, playerData.position, ""),
  Team: getFirstValue(playerData.Team, playerData.nflTeam, ""),
  Age: getFirstValue(playerData.Age, playerData.age, ""),
  DepthChartOrder: getFirstValue(
    playerData.DepthChartOrder,
    playerData.depthChartOrder,
    ""
  ),
  YearsExperience: getFirstValue(
    playerData.YearsExperience,
    playerData.yearsExp,
    ""
  ),
  Status: getFirstValue(playerData.Status, playerData.status, ""),
  InjuryStatus: getFirstValue(
    playerData.InjuryStatus,
    playerData.injuryStatus,
    ""
  ),
  AuctionValue: getFirstValue(playerData.rankings?.auctionValue, ""),
  ProjectedPoints: getFirstValue(playerData.rankings?.projectedPoints, ""),
  Rank: getFirstValue(
    playerData.rankings?.rank,
    playerData.PositionRank,
    playerData.SearchRank,
    ""
  ),
});

const positionOrder = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 4,
};

const sortPlayers = (players) =>
  [...players].sort((firstPlayer, secondPlayer) => {
    const positionDifference =
      (positionOrder[firstPlayer.Position] ?? 99) -
      (positionOrder[secondPlayer.Position] ?? 99);

    if (positionDifference !== 0) {
      return positionDifference;
    }

    return firstPlayer.FullName.localeCompare(secondPlayer.FullName);
  });

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playersCollection = collection(db, "players");
    const unsubscribe = onSnapshot(
      playersCollection,
      (querySnapshot) => {
        const playerList = [];

        querySnapshot.forEach((playerDoc) => {
          playerList.push(normalizePlayerData(playerDoc.id, playerDoc.data()));
        });

        setPlayers(sortPlayers(playerList));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching players:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredPlayers =
    selectedPosition === "ALL"
      ? players
      : players.filter((player) => player.Position === selectedPosition);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Players" title="Player List" />

      <FormControl variant="outlined" fullWidth>
        <InputLabel
          id="player-position-select-label"
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
        >
          Position
        </InputLabel>
        <Select
          labelId="player-position-select-label"
          label="Position"
          value={selectedPosition}
          onChange={(event) => setSelectedPosition(event.target.value)}
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="QB">QB</MenuItem>
          <MenuItem value="RB">RB</MenuItem>
          <MenuItem value="WR">WR</MenuItem>
          <MenuItem value="TE">TE</MenuItem>
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
          id="playersGrid"
          dataSource={filteredPlayers}
          allowPaging
          allowSorting
          allowFiltering
          toolbar={["Search"]}
          width="auto"
          pageSettings={{ pageSize: 25 }}
        >
          <ColumnsDirective>
            {allPlayersGrid.map((item, index) => (
              <ColumnDirective key={index} {...item} />
            ))}
          </ColumnsDirective>
          <Inject services={[Page, Search, Sort, Filter, Toolbar]} />
        </GridComponent>
      )}
    </div>
  );
};

export default Players;
