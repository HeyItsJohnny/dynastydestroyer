import React, { useState, useEffect } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { useStateContext } from "../../contexts/ContextProvider";
import { TbSquareRoundedLetterW } from "react-icons/tb";

import { stackedPrimaryXAxis, stackedPrimaryYAxis } from "../../data/gridData";
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

const Draft = () => {
  const { currentMode } = useStateContext();
  return (
    <>
      <div className="flex gap-10 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-850">
          <div className="flex justify-between">
            <p className="font-semibold text-xl">NAME's Fantasy Stats</p>

            <div className="flex items-center gap-4">
              <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
                <span>
                  <GoPrimitiveDot />
                </span>
                <span>
                  Players Projection or Current Team's Spending Habits
                </span>
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-10 flex-wrap justify-left">
            <div className=" border-r-1 border-color m-4 pr-10">
              <div className="mt-1">
                <p className="text-gray-500 mt-1">Rank</p>
                <p className="text-grey-500 text-3xl font-semibold">100</p>
              </div>
              <div className="mt-1">
                <p className="text-gray-500 mt-1">Passing Yards</p>
                <p className="text-green-500 text-3xl font-semibold">100</p>
              </div>
              <div className="mt-1">
                <p className="text-gray-500 mt-1">Passing TDs</p>
                <p className="text-green-500 text-3xl font-semibold">100</p>
              </div>
              <div className="mt-1">
                <p className="text-gray-500 mt-1">Passing Ints</p>
                <p className="text-red-500 text-3xl font-semibold">100</p>
              </div>
              <div className="mt-1">
                <p className="text-gray-500 mt-1">Rushing Yards</p>
                <p className="text-green-500 text-3xl font-semibold">100</p>
              </div>
              <div className="mt-1">
                <p className="text-gray-500 mt-1">Rushing TDs</p>
                <p className="text-green-500 text-3xl font-semibold">
                  100
                </p>{" "}
              </div>
            </div>
            <div className="mt-5">
              <ChartComponent
                id="charts"
                primaryXAxis={stackedPrimaryXAxis}
                primaryYAxis={stackedPrimaryYAxis}
                width="400px"
                height="300px"
                chartArea={{ border: { width: 0 } }}
                tooltip={{ enable: true }}
                background={currentMode === "Dark" ? "#33373E" : "#fff"}
                legendSettings={{ background: "white" }}
              >
                <Inject
                  services={[StackingColumnSeries, Category, Legend, Tooltip]}
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

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xl font-semibold">Teams</p>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 1</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 2</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 3</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 4</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 5</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 6</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 7</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 8</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 9</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">TEAM 10</p>
                  <p className="text-sm text-gray-400">Remaining $:</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xl font-semibold">Players</p>
          </div>
          <div className="mt-2 w-48">
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
                  <p className="text-sm font-semibold">Player 1</p>
                  <p className="text-sm text-gray-400">Rank:</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Draft;
