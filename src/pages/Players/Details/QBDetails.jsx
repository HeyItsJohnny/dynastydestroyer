import React, { useState, useEffect } from "react";
import { Header } from "../../../components";
import { GoPrimitiveDot } from "react-icons/go";
import { TbSquareRoundedLetterW } from "react-icons/tb";
import { TbSquareRoundedLetterT } from "react-icons/tb";
import { TbSquareRoundedLetterR } from "react-icons/tb";
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
import SetTier from "../../../modals/SetTier";
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

const QBDetails = () => {
  const { id } = useParams();
  let [loading, setLoading] = useState(false);
  const [playerData, setPlayerData] = useState({});

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const data = await getPlayerDataByID(id);
      //addPlayerStats(data, "2023");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  useEffect(() => {
      fetchPlayerData();
      return () => {
        setPlayerData({});
      };
    }, []);
  <>
    {loading ? (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
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
          <Header category="Quarterback Details" title={playerData.FullName} />
          {/**
            <SetTier playerData={playerData} />
             */}
        </div>
        {/**
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
           */}
      </>
    )}
  </>;
};

export default QBDetails;
