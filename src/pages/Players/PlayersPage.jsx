import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { Header } from "../../components";
import { db } from "../../firebase/firebase";
import PlayerTable from "./PlayerTable";
import "./PlayersPage.css";

const POSITIONS = ["All", "QB", "RB", "WR", "TE"];

const normalizeText = (value) => `${value ?? ""}`.toLowerCase().trim();

const sortPlayersByName = (playerList) =>
  [...playerList].sort((firstPlayer, secondPlayer) =>
    firstPlayer.fullName.localeCompare(secondPlayer.fullName)
  );

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

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playersQuery = query(
      collection(db, "players"),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      (querySnapshot) => {
        const playerList = sortPlayersByName(
          querySnapshot.docs.map(normalizePlayer)
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
      const matchesPosition =
        selectedPosition === "All" || player.position === selectedPosition;
      const matchesSearch =
        search === "" ||
        normalizeText(player.fullName).includes(search) ||
        normalizeText(player.nflTeam).includes(search);

      return matchesPosition && matchesSearch;
    });
  }, [players, searchTerm, selectedPosition]);

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
