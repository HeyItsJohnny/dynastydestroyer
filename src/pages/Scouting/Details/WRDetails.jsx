import React, { useState, useEffect } from "react";
import { Header } from "../../../components";
import { GoPrimitiveDot } from "react-icons/go";
import { TbSquareRoundedLetterT } from "react-icons/tb";
import { TbSquareRoundedLetterR } from "react-icons/tb";
import { TbSquareRoundedLetterQ } from "react-icons/tb";
import { useStateContext } from "../../../contexts/ContextProvider";

import SkillPlayerComponent from "../../../components/PlayerComponents/SkillPlayerComponent";
import PlayerDetailComponent from "../../../components/PlayerComponents/PlayerDetailComponent";

import {
  getPlayerDataByID,
  getPlayerStatsData,
  createPlayerStatObject,
  getPlayerDataByPositionAndTeam,
  getPlayerWeeklyPoints,
} from "../../../globalFunctions/firebasePlayerFunctions";
import { useParams } from "react-router-dom";

//Visual
import ClipLoader from "react-spinners/ClipLoader";
import {
  stackedPrimaryXAxis,
  stackedPrimaryYAxis,
} from "../../../data/gridData";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Category,
  StackingColumnSeries,
  Tooltip,
} from "@syncfusion/ej2-react-charts";

const WRDetails = () => {
  const { id } = useParams();
  const { currentMode } = useStateContext();
  const [playerData, setPlayerData] = useState({});
  const [teamQBData, setTeamQBData] = useState([]);
  const [teamTEData, setTeamTEData] = useState([]);
  const [teamRBData, setTeamRBData] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
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
    fetchPlayerTEData(playerStats.Team);
    fetchPlayerRBData(playerStats.Team);
    fetchWeeklyData(playerStats.KeepTradeCutIdentifier);
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

  const fetchPlayerTEData = async (team) => {
    try {
      const data = await getPlayerDataByPositionAndTeam("TE", team);
      addSkillPlayerStats(data, "2023", "TE");
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

      if (position === "TE") {
        setTeamTEData(sortedPlayerStatsArray);
      } else if (position === "QB") {
        setTeamQBData(sortedPlayerStatsArray);
      } else if (position === "RB") {
        setTeamRBData(sortedPlayerStatsArray);
      }
    } catch (error) {
      console.error("Error in addPlayerStats:", error);
    }
  };

  const fetchWeeklyData = async (KTCIdentifier) => {
    try {
      //Fetch Weekly Data Here
      const WeekStatsArray = [];
      const Week1Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week1"
      );
      const Week2Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week2"
      );
      const Week3Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week3"
      );
      const Week4Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week4"
      );
      const Week5Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week5"
      );
      const Week6Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week6"
      );
      const Week7Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week7"
      );
      const Week8Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week8"
      );
      const Week9Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week9"
      );
      const Week10Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week10"
      );
      const Week11Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week11"
      );
      const Week12Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week12"
      );
      const Week13Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week13"
      );
      const Week14Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week14"
      );
      const Week15Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week15"
      );
      const Week16Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week16"
      );
      const Week17Points = await getPlayerWeeklyPoints(
        KTCIdentifier,
        "2023",
        "Week17"
      );

      WeekStatsArray.push(Week1Points);
      WeekStatsArray.push(Week2Points);
      WeekStatsArray.push(Week3Points);
      WeekStatsArray.push(Week4Points);
      WeekStatsArray.push(Week5Points);
      WeekStatsArray.push(Week6Points);
      WeekStatsArray.push(Week7Points);
      WeekStatsArray.push(Week8Points);
      WeekStatsArray.push(Week9Points);
      WeekStatsArray.push(Week10Points);
      WeekStatsArray.push(Week11Points);
      WeekStatsArray.push(Week12Points);
      WeekStatsArray.push(Week13Points);
      WeekStatsArray.push(Week14Points);
      WeekStatsArray.push(Week15Points);
      WeekStatsArray.push(Week16Points);
      WeekStatsArray.push(Week17Points);

      const tmpArray = [
        {
          dataSource: WeekStatsArray,
          xName: "x",
          yName: "y",
          name: "Weekly Points",
          type: "StackingColumn",
          background: "blue",
        },
      ];

      setWeeklyChartData(tmpArray);

      setLoading(false);
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  useEffect(() => {
    fetchPlayerData();
    return () => {
      setPlayerData({});
      setTeamQBData([]);
      setTeamTEData([]);
      setTeamRBData([]);
      setWeeklyChartData([]);
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
            <Header
              category="Wide Receiver Details"
              title={playerData.FullName}
            />
          </div>
          <div className="flex gap-10 flex-wrap justify-center">
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-850  ">
              <div className="flex justify-between">
                <p className="font-semibold text-xl">
                  {playerData.FullName}'s Fantasy Stats
                </p>
                <div className="flex items-center gap-4">
                  <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
                    <span>
                      <GoPrimitiveDot />
                    </span>
                    <span>2023 Weekly Points Breakdown</span>
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
                <div className="mt-5">
                  <ChartComponent
                    id="charts"
                    primaryXAxis={stackedPrimaryXAxis}
                    primaryYAxis={stackedPrimaryYAxis}
                    width="500px"
                    height="360px"
                    chartArea={{ border: { width: 0 } }}
                    tooltip={{ enable: true }}
                    background={currentMode === "Dark" ? "#33373E" : "#fff"}
                    legendSettings={{ background: "white" }}
                  >
                    <Inject
                      services={[
                        StackingColumnSeries,
                        Category,
                        Legend,
                        Tooltip,
                      ]}
                    />
                    <SeriesCollectionDirective>
                      {weeklyChartData.map((item, index) => (
                        <SeriesDirective key={index} {...item} />
                      ))}
                    </SeriesCollectionDirective>
                  </ChartComponent>
                </div>
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
                {teamTEData.map((player) => (
                  <SkillPlayerComponent
                    fullname={player.FullName}
                    position={player.Position}
                    totalpoints={player.TotalPoints}
                    rank={player.Rank}
                    icon={<TbSquareRoundedLetterT />}
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

export default WRDetails;
