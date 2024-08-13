import React, { useState } from "react";

//Icons
import { GoPrimitiveDot } from "react-icons/go";

//Dialog
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const PlayerDetailsQB = ({ item, icon }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleReset = () => {
    handleClose();
  };

  return (
    <>
      <button
        type="button"
        style={{
          backgroundColor: "#1A97F5",
          color: "White",
        }}
        className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
        onClick={handleShow}
      >
        {icon}
      </button>
      <Dialog
        open={show}
        onClose={handleReset}
        fullWidth
        maxWidth="md"
        PaperProps={{
          style: {
            position: "absolute",
            top: "10%", // Position the dialog 10% from the top of the screen
            margin: 0,
          },
        }}
      >
        <DialogTitle>{item.FullName} 's Fantasy Stats</DialogTitle>
        <DialogContent>
          <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-850  ">
            <div className="flex justify-between">
              <p className="font-semibold text-xl">
                {item.FullName}'s Total Points ({item.TotalPoints})
              </p>

              <div className="flex items-center gap-4">
                <p className="flex items-center gap-2 text-blue-400 hover:drop-shadow-xl font-semibold">
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
                    {item.PassingYDS}
                  </p>
                  <p className="text-gray-500 mt-1">Passing Yards</p>
                </div>
                <div className="mt-1">
                  <p className="text-green-500 text-3xl font-semibold">
                    {item.PassingTD}
                  </p>
                  <p className="text-gray-500 mt-1">Passing TDs</p>
                </div>
                <div className="mt-1">
                  <p className="text-red-500 text-3xl font-semibold">
                    {item.PassingINT}
                  </p>
                  <p className="text-gray-500 mt-1">Passing Ints</p>
                </div>
                <div className="mt-1">
                  <p className="text-green-500 text-3xl font-semibold">
                    {item.RushingYDS}
                  </p>
                  <p className="text-gray-500 mt-1">Rushing Yards</p>
                </div>
                <div className="mt-1">
                  <p className="text-green-500 text-3xl font-semibold">
                    {item.RushingTD}
                  </p>
                  <p className="text-gray-500 mt-1">Rushing TDs</p>
                </div>
                <div className="mt-1">
                  <p className="text-green-500 text-3xl font-semibold">
                    {item.TotalCarries}
                  </p>
                  <p className="text-gray-500 mt-1">Total Carries</p>
                </div>
              </div>
              <div className="mt-5">
                {/** 
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
                    services={[StackingColumnSeries, Category, Legend, Tooltip]}
                  />
                  <SeriesCollectionDirective>
                    {weeklyChartData.map((item, index) => (
                      <SeriesDirective key={index} {...item} />
                    ))}
                  </SeriesCollectionDirective>
                </ChartComponent>
                */}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerDetailsQB;
