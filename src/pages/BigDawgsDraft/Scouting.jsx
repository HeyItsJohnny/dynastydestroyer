import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";

import { Header } from "../../components";
import { useStateContext } from "../../contexts/ContextProvider";
import { db } from "../../firebase/firebase";
import PlayerTable from "../Players/PlayerTable";
import "../Players/PlayersPage.css";

const positionFilters = [
  { label: "QB", value: "QB", title: "Quarterbacks" },
  { label: "RB", value: "RB", title: "Running Backs" },
  { label: "WR", value: "WR", title: "Wide Receivers" },
  { label: "TE", value: "TE", title: "Tight Ends" },
];

const getProjectedSeasonYear = (date = new Date()) => date.getFullYear();

const hasValue = (value) =>
  value !== undefined && value !== null && `${value}`.trim() !== "";

const getFirstValue = (...values) => values.find(hasValue);

const getSortableNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || !hasValue(value)
    ? Number.MAX_SAFE_INTEGER
    : parsed;
};

const sortPlayersByRankThenTier = (players) =>
  [...players].sort((firstPlayer, secondPlayer) => {
    const rankDifference =
      getSortableNumber(firstPlayer.rank) - getSortableNumber(secondPlayer.rank);

    if (rankDifference !== 0) return rankDifference;

    const tierDifference =
      getSortableNumber(firstPlayer.tier) - getSortableNumber(secondPlayer.tier);

    if (tierDifference !== 0) return tierDifference;

    return firstPlayer.fullName.localeCompare(secondPlayer.fullName);
  });

const normalizePlayer = (playerDoc) => {
  const data = playerDoc.data();

  return {
    id: playerDoc.id,
    fullName: data.fullName ?? data.FullName ?? "",
    nflTeam: data.nflTeam ?? data.Team ?? "",
    position: data.position ?? data.Position ?? "",
    depthChartOrder:
      data.depthChartOrder ?? data.depth_chart_order ?? data.DepthChartOrder ?? "",
    age: data.age ?? data.Age ?? "",
  };
};

const addProjectedStatsToPlayer = async (player) => {
  const projectedStatsSnap = await getDoc(
    doc(db, "players", player.id, "projectedStats", `${getProjectedSeasonYear()}`)
  );
  const projectedStats = projectedStatsSnap.exists() ? projectedStatsSnap.data() : {};

  return {
    ...player,
    rank: projectedStats.rank ?? "",
    tier: projectedStats.tier ?? "",
    auctionValue: getFirstValue(
      projectedStats.auction_value,
      projectedStats["Auction Value"]
    ),
    maxBid: getFirstValue(projectedStats.max_bid, projectedStats["Max Bid"]),
    hardMax: getFirstValue(
      projectedStats.hard_max_bid,
      projectedStats["Hard Max Bid"]
    ),
  };
};

const Scouting = () => {
  const { currentColor } = useStateContext();
  const [selectedPosition, setSelectedPosition] = useState("");
  const [playerData, setPlayerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedFilter = positionFilters.find(
    (position) => position.value === selectedPosition
  );

  useEffect(() => {
    if (!selectedPosition) {
      setPlayerData([]);
      setLoading(false);
      return undefined;
    }

    setPlayerData([]);
    setErrorMessage("");
    setLoading(true);

    const playersQuery = query(
      collection(db, "players"),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      async (querySnapshot) => {
        try {
          const players = await Promise.all(
            querySnapshot.docs.map(normalizePlayer).map(addProjectedStatsToPlayer)
          );
          const filteredPlayers = players.filter(
            (player) =>
              player.position === selectedPosition &&
              hasValue(player.rank) &&
              hasValue(player.tier)
          );

          setPlayerData(sortPlayersByRankThenTier(filteredPlayers));
          setLoading(false);
        } catch (error) {
          console.error("Error fetching scouting players:", error);
          setPlayerData([]);
          setErrorMessage("Unable to load players for this position.");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error loading scouting players:", error);
        setPlayerData([]);
        setErrorMessage("Unable to load players for this position.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedPosition]);

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
  };

  return (
    <div className="players-page m-2 md:m-10 mt-24">
      <div className="p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Command Center" title="Scouting" />
        <div className="flex flex-wrap gap-3">
          {positionFilters.map((position) => {
            const isSelected = selectedPosition === position.value;

            return (
              <button
                key={position.value}
                type="button"
                onClick={() => handlePositionSelect(position.value)}
                className={`px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl ${
                  isSelected
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                }`}
                style={{
                  backgroundColor: isSelected ? currentColor : "transparent",
                  borderColor: isSelected ? currentColor : undefined,
                  borderRadius: "10px",
                }}
              >
                {position.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handlePositionSelect("")}
            className="px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
            style={{
              borderRadius: "10px",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {selectedPosition && (
        <div className="mt-6 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-gray-400 text-sm mb-1">Player List</p>
              <h2 className="text-2xl font-semibold">
                {selectedFilter?.title}
              </h2>
            </div>
            {!loading && !errorMessage && (
              <span className="text-sm text-gray-500 dark:text-gray-300">
                {playerData.length} players
              </span>
            )}
          </div>

          {loading ? (
            <div className="players-loading">Loading players...</div>
          ) : errorMessage ? (
            <div className="players-empty-state text-red-500">{errorMessage}</div>
          ) : playerData.length === 0 ? (
            <div className="players-empty-state">
              No ranked and tiered players found for {selectedPosition}.
            </div>
          ) : (
            <PlayerTable players={playerData} />
          )}
        </div>
      )}
    </div>
  );
};

export default Scouting;
