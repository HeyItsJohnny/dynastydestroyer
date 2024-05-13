import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

import {
  getPlayerDataByID,
  getPlayerStatsData,
  createPlayerStatObject,
  getPlayerDataByPositionAndTeam
} from "../../../globalFunctions/firebasePlayerFunctions";
import { useParams } from "react-router-dom";

//Visual
import ClipLoader from "react-spinners/ClipLoader";

const QBDetails = () => {
  const { id } = useParams();
  const [playerData, setPlayerData] = useState({});
  let [loading, setLoading] = useState(false);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const data = await getPlayerDataByID(id);
      addPlayerStats(data, "2023");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const addPlayerStats = async (data, year) => {
      try {
        const getPlayerStats = await getPlayerStatsData(
          data.SleeperID,
          year
        );
        var playerStats = createPlayerStatObject(data, getPlayerStats);
      } catch (error) {
        console.error(
          `Error fetching stats for player ${data.SleeperID}:`,
          error
        );
      }
    setPlayerData(playerStats);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayerData();
    return () => {
      setPlayerData({});
    };
  }, []);
  return (
    <>
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
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="QB Details" title={playerData.FullName} />
      </div>
    )}
    </>
  )
}

export default QBDetails