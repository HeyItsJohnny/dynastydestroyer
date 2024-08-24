import React from "react";
import {
  stackedPrimaryXAxis,
  stackedPrimaryYAxisDraftStats,
} from "../../../../data/gridData";
import { useStateContext } from "../../../../contexts/ContextProvider";
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

const TeamStatistics = ({
  QBTotal,
  RBTotal,
  WRTotal,
  TETotal,
  totalLeft,
  auctionDraftStats
}) => {
  const { currentMode } = useStateContext();
  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-850  ">
      <div className="flex justify-between">
        <p className="font-semibold text-xl">Draft Statistics</p>
      </div>
      <div className="mt-5 flex gap-10 flex-wrap justify-left">
        <div className=" border-r-1 border-color m-4 pr-10">
          <div className="mt-1">
            <p className="text-green-500 text-xl font-semibold">{QBTotal}</p>
            <p className="text-gray-500 mt-1">QB Total Amount</p>
          </div>
          <div className="mt-1">
            <p className="text-green-500 text-xl font-semibold">{RBTotal}</p>
            <p className="text-gray-500 mt-1">RB Total Amount</p>
          </div>
          <div className="mt-1">
            <p className="text-green-500 text-xl font-semibold">{WRTotal}</p>
            <p className="text-gray-500 mt-1">WR Total Amount</p>
          </div>
          <div className="mt-1">
            <p className="text-green-500 text-xl font-semibold">{TETotal}</p>
            <p className="text-gray-500 mt-1">TE Total Amount</p>
          </div>
          <div className="mt-1">
            <p className="text-red-500 text-xl font-semibold">{totalLeft}</p>
            <p className="text-gray-500 mt-1">Amount Left</p>
          </div>
        </div>
        <div className="mt-5">
          <ChartComponent
            id="charts"
            primaryXAxis={stackedPrimaryXAxis}
            primaryYAxis={stackedPrimaryYAxisDraftStats}
            width="300px"
            height="360px"
            chartArea={{ border: { width: 0 } }}
            tooltip={{ enable: true }}
            background={currentMode === "Dark" ? "#33373E" : "#fff"}
            legendSettings={{ background: "white" }}
          >
            <Inject
              services={[StackingColumnSeries, Category, Legend, Tooltip]}
            />
            <SeriesCollectionDirective>
              {/* eslint-disable-next-line react/jsx-props-no-spreading  */}
              {auctionDraftStats.map((item, index) => (
                <SeriesDirective key={index} {...item} />
              ))}
            </SeriesCollectionDirective>
          </ChartComponent>
        </div>
      </div>
    </div>
  );
};

export default TeamStatistics;
