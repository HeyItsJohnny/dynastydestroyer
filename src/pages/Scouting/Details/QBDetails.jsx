import React, { useState, useEffect } from "react";
import { Header } from "../../../components";
import { GoPrimitiveDot } from "react-icons/go";
import { TbSquareRoundedLetterW } from "react-icons/tb";
import { TbSquareRoundedLetterT } from "react-icons/tb";
import { TbSquareRoundedLetterR } from "react-icons/tb";

import {
  getPlayerDataByID,
  getPlayerStatsData,
  createPlayerStatObject,
  getPlayerDataByPositionAndTeam,
} from "../../../globalFunctions/firebasePlayerFunctions";
import { useParams } from "react-router-dom";

//Visual
import ClipLoader from "react-spinners/ClipLoader";

const QBDetails = () => {
  const { id } = useParams();
  const [playerData, setPlayerData] = useState({});
  const [teamWRData, setTeamWRData] = useState([]);
  const [teamRBData, setTeamRBData] = useState([]);
  const [teamTEData, setTeamTEData] = useState([]);
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
      const getPlayerStats = await getPlayerStatsData(data.SleeperID, year);
      var playerStats = createPlayerStatObject(data, getPlayerStats);
    } catch (error) {
      console.error(
        `Error fetching stats for player ${data.SleeperID}:`,
        error
      );
    }
    console.log(playerStats);
    setPlayerData(playerStats);
    fetchPlayerWRData(playerStats.Team);
    fetchPlayerRBData(playerStats.Team);
    fetchPlayerTEData(playerStats.Team);
  };

  const fetchPlayerWRData = async (team) => {
    try {
      const data = await getPlayerDataByPositionAndTeam("WR", team);
      //setTeamWRData(data);
      addSkillPlayerStats(data, "2023", "WR");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const fetchPlayerRBData = async (team) => {
    try {
      const data = await getPlayerDataByPositionAndTeam("RB", team);
      //setTeamRBData(data);
      addSkillPlayerStats(data, "2023", "RB");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const fetchPlayerTEData = async (team) => {
    try {
      const data = await getPlayerDataByPositionAndTeam("TE", team);
      //setTeamTEData(data);
      addSkillPlayerStats(data, "2023", "TE");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
    setLoading(false);
  };

  const addSkillPlayerStats = async (data, year, position) => {
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

      console.log(sortedPlayerStatsArray);

      if (position === "WR") {
        setTeamWRData(sortedPlayerStatsArray);
      } else if (position === "TE") {
        setTeamTEData(sortedPlayerStatsArray);
      } else if (position === "RB") {
        setTeamRBData(sortedPlayerStatsArray);
      }
    } catch (error) {
      console.error("Error in addPlayerStats:", error);
    }
  };

  useEffect(() => {
    fetchPlayerData();
    return () => {
      setPlayerData({});
      setTeamWRData([]);
      setTeamRBData([]);
      setTeamTEData([]);
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
        <>
          <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
            <Header category="QB Details" title={playerData.FullName} />
          </div>
          <div className="flex gap-10 flex-wrap justify-center">
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-780  ">
              <div className="flex justify-between">
                <p className="font-semibold text-xl">{playerData.FullName}'s Fantasy Stats</p>
                <div className="flex items-center gap-4">
                  <p className="flex items-center gap-2 text-gray-600 hover:drop-shadow-xl">
                    <span>
                      <GoPrimitiveDot />
                    </span>
                    <span>Expense</span>
                  </p>
                  <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
                    <span>
                      <GoPrimitiveDot />
                    </span>
                    <span>Budget</span>
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-10 flex-wrap justify-left">
                <div className=" border-r-1 border-color m-4 pr-10">
                  <div className="mt-1">
                    <p className="text-grey-500 text-3xl font-semibold">
                      {playerData.Age}
                    </p>
                    <p className="text-gray-500 mt-1">Age</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-grey-500 text-3xl font-semibold">
                      {playerData.Rank}
                    </p>
                    <p className="text-gray-500 mt-1">Rank</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-grey-500 text-3xl font-semibold">
                      {playerData.SearchRank}
                    </p>
                    <p className="text-gray-500 mt-1">Search Rank</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.PassingYDS}
                    </p>
                    <p className="text-gray-500 mt-1">Passing Yards</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.PassingTD}
                    </p>
                    <p className="text-gray-500 mt-1">Passing TDs</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-red-500 text-3xl font-semibold">
                      {playerData.PassingINT}
                    </p>
                    <p className="text-gray-500 mt-1">Passing Ints</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.RushingYDS}
                    </p>
                    <p className="text-gray-500 mt-1">Rushing Yards</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.RushingTD}
                    </p>
                    <p className="text-gray-500 mt-1">Rushing TDs</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.TotalCarries}
                    </p>
                    <p className="text-gray-500 mt-1">Total Carries</p>
                  </div>
                </div>
                <div>PIE CHART HERE</div>
              </div>
            </div>
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
              <div className="flex justify-between items-center gap-2">
                <p className="text-xl font-semibold">
                  {playerData.Team} Skill Positions
                </p>
              </div>
              <div className="mt-5 w-72 md:w-400">
                {teamWRData.map((player) => (
                  <div className="flex justify-between mt-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        style={{
                          backgroundColor: "#1A97F5",
                          color: "White",
                        }}
                        className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                      >
                        <TbSquareRoundedLetterW />
                      </button>

                      <div>
                        <p className="text-md font-semibold">
                          {player.FullName} ({player.Position})
                        </p>
                        <p className="text-sm text-gray-400">
                          Total Points: {player.TotalPoints}
                        </p>
                      </div>
                    </div>
                    <p className={`text-green-600`}>Rank: {player.Rank}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 w-72 md:w-400">
                {teamTEData.map((player) => (
                  <div className="flex justify-between mt-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        style={{
                          backgroundColor: "#1A97F5",
                          color: "White",
                        }}
                        className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                      >
                        <TbSquareRoundedLetterT />
                      </button>

                      <div>
                        <p className="text-md font-semibold">
                          {player.FullName} ({player.Position})
                        </p>
                        <p className="text-sm text-gray-400">
                          Total Points: {player.TotalPoints}
                        </p>
                      </div>
                    </div>
                    <p className={`text-green-600`}>Rank: {player.Rank}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 w-72 md:w-400">
                {teamRBData.map((player) => (
                  <div className="flex justify-between mt-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        style={{
                          backgroundColor: "#1A97F5",
                          color: "White",
                        }}
                        className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                      >
                        <TbSquareRoundedLetterR />
                      </button>

                      <div>
                        <p className="text-md font-semibold">
                          {player.FullName} ({player.Position})
                        </p>
                        <p className="text-sm text-gray-400">
                          Total Points: {player.TotalPoints}
                        </p>
                      </div>
                    </div>
                    <p className={`text-green-600`}>Rank: {player.Rank}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default QBDetails;
