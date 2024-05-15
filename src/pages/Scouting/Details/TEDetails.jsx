import React, { useState, useEffect } from "react";
import { Header } from "../../../components";
import { GoPrimitiveDot } from "react-icons/go";
import { TbSquareRoundedLetterW } from "react-icons/tb";
import { TbSquareRoundedLetterR } from "react-icons/tb";
import { TbSquareRoundedLetterQ } from "react-icons/tb";

import SkillPlayerComponent from "../../../components/PlayerComponents/SkillPlayerComponent";
import PlayerDetailComponent from "../../../components/PlayerComponents/PlayerDetailComponent";

import {
  getPlayerDataByID,
  getPlayerStatsData,
  createPlayerStatObject,
  getPlayerDataByPositionAndTeam,
} from "../../../globalFunctions/firebasePlayerFunctions";
import { useParams } from "react-router-dom";

//Visual
import ClipLoader from "react-spinners/ClipLoader";

const TEDetails = () => {
  const { id } = useParams();
  const [playerData, setPlayerData] = useState({});
  const [teamQBData, setTeamQBData] = useState([]);
  const [teamWRData, setTeamWRData] = useState([]);
  const [teamRBData, setTeamRBData] = useState([]);
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
    setPlayerData(playerStats);
    fetchPlayerQBData(playerStats.Team);
    fetchPlayerWRData(playerStats.Team);
    fetchPlayerRBData(playerStats.Team);
  };

  const fetchPlayerQBData = async (team) => {
    try {
      const data = await getPlayerDataByPositionAndTeam("QB", team);
      addSkillPlayerStats(data, "2023", "QB");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const fetchPlayerWRData = async (team) => {
    try {
      const data = await getPlayerDataByPositionAndTeam("WR", team);
      addSkillPlayerStats(data, "2023", "WR");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const fetchPlayerRBData = async (team) => {
    try {
      const data = await getPlayerDataByPositionAndTeam("RB", team);
      addSkillPlayerStats(data, "2023", "RB");
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

      if (position === "WR") {
        setTeamWRData(sortedPlayerStatsArray);
      } else if (position === "QB") {
        setTeamQBData(sortedPlayerStatsArray);
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
      setTeamQBData([]);
      setTeamWRData([]);
      setTeamRBData([]);
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
            <Header category="Tight End Details" title={playerData.FullName} />
          </div>
          <div className="flex gap-10 flex-wrap justify-center">
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-780  ">
              <div className="flex justify-between">
                <p className="font-semibold text-xl">
                  {playerData.FullName}'s Fantasy Stats
                </p>
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
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingRec}
                    </p>
                    <p className="text-gray-500 mt-1">Receptions</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingTargets}
                    </p>
                    <p className="text-gray-500 mt-1">Targets</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.RedzoneTargets}
                    </p>
                    <p className="text-gray-500 mt-1">Redzone Targets</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceptionPercentage}%
                    </p>
                    <p className="text-gray-500 mt-1">Reception Percentage</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingYDS}
                    </p>
                    <p className="text-gray-500 mt-1">Receiving Yards</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingTD}
                    </p>
                    <p className="text-gray-500 mt-1">Receiving TDs</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-red-500 text-3xl font-semibold">
                      {playerData.Fumbles}
                    </p>
                    <p className="text-gray-500 mt-1">Fumbles</p>
                  </div>
                </div>
                <div>PIE CHART HERE</div>
              </div>
            </div>
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
              <div className="flex justify-between items-center gap-2">
                <p className="text-xl font-semibold">Fantasy Details</p>
              </div>
              <PlayerDetailComponent
                rank={playerData.Rank}
                searchrank={playerData.SearchRank}
                age={playerData.Age}
                yearsexperience={playerData.YearsExperience}
              />
              <div className="flex justify-between items-center gap-2 mt-5">
                <p className="text-xl font-semibold">
                  {playerData.Team} Skill Positions
                </p>
              </div>
              <div className="mt-5 w-72 md:w-400">
                {teamQBData.map((player) => (
                  <SkillPlayerComponent
                    fullname={player.FullName}
                    position={player.Position}
                    totalpoints={player.TotalPoints}
                    rank={player.Rank}
                    icon={<TbSquareRoundedLetterQ />}
                  />
                ))}
              </div>
              <div className="mt-5 w-72 md:w-400">
                {teamWRData.map((player) => (
                  <SkillPlayerComponent
                    fullname={player.FullName}
                    position={player.Position}
                    totalpoints={player.TotalPoints}
                    rank={player.Rank}
                    icon={<TbSquareRoundedLetterW />}
                  />
                ))}
              </div>
              <div className="mt-5 w-72 md:w-400">
                {teamRBData.map((player) => (
                  <SkillPlayerComponent
                    fullname={player.FullName}
                    position={player.Position}
                    totalpoints={player.TotalPoints}
                    rank={player.Rank}
                    icon={<TbSquareRoundedLetterR />}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TEDetails;
