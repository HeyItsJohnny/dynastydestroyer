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

const TEDetails = () => {
  const { id } = useParams();
  const { currentMode } = useStateContext();
  let [loading, setLoading] = useState(false);
  const [playerData, setPlayerData] = useState({});

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const data = await getPlayerDataByID(id);
      setPlayerData(data);
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
    };
  }, []);

  return (
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
            <Header category="Details" title={playerData.FullName} />
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
                    <span>2024 Weekly Points Breakdown</span>
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-10 flex-wrap justify-left">
                <div className=" border-r-1 border-color m-4 pr-10">
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Rank</p>
                    <p className="text-grey-500 text-3xl font-semibold">
                      {playerData.PositionRank}
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Receptions</p>
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingRec}
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Targets</p>
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingTargets}
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Redzone Targets</p>
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.RedzoneTargets}
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Reception Percentage</p>
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceptionPercentage}%
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Receiving Yards</p>
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingYDS}
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Receiving TDs</p>
                    <p className="text-green-500 text-3xl font-semibold">
                      {playerData.ReceivingTDs}
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-gray-500 mt-1">Fumbles</p>
                    <p className="text-red-500 text-3xl font-semibold">
                      {playerData.Fumbles}
                    </p>
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
                      {/**
                      {weeklyChartData.map((item, index) => (
                        <SeriesDirective key={index} {...item} />
                      ))}
                         */}
                    </SeriesCollectionDirective>
                  </ChartComponent>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TEDetails;
