import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { Header } from "../../components";
import { db } from "../../firebase/firebase";
import PlayerTable from "./PlayerTable";
import "./PlayersPage.css";

const POSITIONS = ["All", "QB", "RB", "WR", "TE"];
const TIERS = [
  { label: "All", value: "All" },
  { label: "Tier 1", value: "1" },
  { label: "Tier 2", value: "2" },
  { label: "Tier 3", value: "3" },
  { label: "Tier 4", value: "4" },
  { label: "Tier 5", value: "5" },
  { label: "Tier 6 and below", value: "6+" },
];

const normalizeText = (value) => `${value ?? ""}`.toLowerCase().trim();

const getProjectedSeasonYear = (date = new Date()) => date.getFullYear();

const getSortableNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || value === "" || value == null
    ? Number.MAX_SAFE_INTEGER
    : parsed;
};

const getPlayerTier = (player) => {
  const parsed = Number(player.tier);
  return Number.isNaN(parsed) ? null : parsed;
};

const sortPlayersByRankThenTier = (playerList) =>
  [...playerList].sort((firstPlayer, secondPlayer) => {
    const rankDifference =
      getSortableNumber(firstPlayer.rank) - getSortableNumber(secondPlayer.rank);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    const tierDifference =
      getSortableNumber(firstPlayer.tier) - getSortableNumber(secondPlayer.tier);

    if (tierDifference !== 0) {
      return tierDifference;
    }

    return firstPlayer.fullName.localeCompare(secondPlayer.fullName);
  });

const normalizePlayer = (playerDoc) => {
  const data = playerDoc.data();

  return {
    id: playerDoc.id,
    fullName: data.fullName ?? "",
    nflTeam: data.nflTeam ?? "",
    position: data.position ?? "",
    depthChartOrder: data.depthChartOrder ?? data.depth_chart_order ?? "",
    age: data.age ?? "",
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
  };
};

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playersQuery = query(
      collection(db, "players"),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      async (querySnapshot) => {
        const playerList = sortPlayersByRankThenTier(
          await Promise.all(querySnapshot.docs.map(normalizePlayer).map(addProjectedStatsToPlayer))
        );

        setPlayers(playerList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading players:", error);
        setPlayers([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredPlayers = useMemo(() => {
    const search = normalizeText(searchTerm);

    return players.filter((player) => {
      const playerTier = getPlayerTier(player);
      const matchesPosition =
        selectedPosition === "All" || player.position === selectedPosition;
      const matchesTier =
        selectedTier === "All" ||
        (selectedTier === "6+" && playerTier != null && playerTier >= 6) ||
        playerTier === Number(selectedTier);
      const matchesSearch =
        search === "" ||
        normalizeText(player.fullName).includes(search) ||
        normalizeText(player.nflTeam).includes(search);

      return matchesPosition && matchesTier && matchesSearch;
    });
  }, [players, searchTerm, selectedPosition, selectedTier]);

  return (
    <div className="players-page m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Players" title="Players" />

      <div className="players-toolbar">
        <div className="players-search">
          <input
            aria-label="Search players"
            className="form-control"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or team"
            type="search"
            value={searchTerm}
          />
        </div>

        <div className="players-tier-filter">
          <label className="players-filter-label" htmlFor="players-tier-filter">
            Tiers
          </label>
          <select
            aria-label="Tier filter"
            className="form-control"
            id="players-tier-filter"
            onChange={(event) => setSelectedTier(event.target.value)}
            value={selectedTier}
          >
            {TIERS.map((tier) => (
              <option key={tier.value} value={tier.value}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>

        <ul className="nav nav-pills" aria-label="Position filter">
          {POSITIONS.map((position) => (
            <li className="nav-item" key={position}>
              <button
                className={`nav-link ${
                  selectedPosition === position ? "active" : ""
                }`}
                onClick={() => setSelectedPosition(position)}
                type="button"
              >
                {position}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {loading ? (
        <div className="players-loading">Loading players...</div>
      ) : (
        <PlayerTable players={filteredPlayers} />
      )}
    </div>
  );
};

export default PlayersPage;
