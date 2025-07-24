import React, { useState, useEffect } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { useStateContext } from "../../../contexts/ContextProvider";
import DraftResetComponent from "./DraftResetComponent";

//User ID
import { useAuth } from "../../../contexts/AuthContext";
import { ClearCurrentDraftPlayer } from "../../../globalFunctions/firebaseAuctionDraft";
import { Button, Box } from "@mui/material";

//Firebase
import { db } from "../../../firebase/firebase";
import { onSnapshot, doc } from "firebase/firestore";

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

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DraftComponent = () => {
  const { currentMode } = useStateContext();
  const { currentUser } = useAuth();
  const [player, setPlayer] = useState({});

  const [playerTitle, setPlayerTitle] = useState("*Select Player*")
  const [rankTitle, setRankTitle] = useState("");
  const [line1, setLine1] = useState("");
  const [line1Value, setLine1Value] = useState("");
  const [line2, setLine2] = useState("");
  const [line2Value, setLine2Value] = useState("");
  const [line3, setLine3] = useState("");
  const [line3Value, setLine3Value] = useState("");
  const [line4, setLine4] = useState("");
  const [line4Value, setLine4Value] = useState("");
  const [line5, setLine5] = useState("");
  const [line5Value, setLine5Value] = useState("");
  const [line6, setLine6] = useState("");
  const [line6Value, setLine6Value] = useState("");

  //Handle Save Settings
  const handleClear = async () => {
    ClearCurrentDraftPlayer(currentUser.uid);
    setLine1("");
    setLine1Value("");
    setLine2("");
    setLine2Value("");
    setLine3("");
    setLine3Value("");
    setLine4("");
    setLine4Value("");
    setLine5("");
    setLine5Value("");
    setLine6("");
    setLine6Value("");
    //toast("Draft has been cleared.");
  };

  

  useEffect(() => {
    const playerRef = doc(
      db,
      "userprofile",
      currentUser.uid,
      "auctiondraft",
      "currentplayer"
    );

    const unsubscribe = onSnapshot(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayer(snapshot.data());
        switch (snapshot.data().Position) {
          case "QB":
            setPlayerTitle(snapshot.data().FullName + "(" + snapshot.data().Position + ") - " + snapshot.data().DraftStatus);
            setRankTitle("Rank");
            setLine1("Passing Yards");
            setLine1Value(snapshot.data().PassingYards);
            setLine2("Passing TDs");
            setLine2Value(snapshot.data().PassingTDs);
            setLine3("Passing INTs");
            setLine3Value(snapshot.data().PassingINT);
            setLine4("Rushing Yards");
            setLine4Value(snapshot.data().RushingYDS);
            setLine5("Rushing TDs");
            setLine5Value(snapshot.data().RushingTDs);
            setLine6("Team");
            setLine6Value(snapshot.data().Team);
            break;
          case "RB":
            setPlayerTitle(snapshot.data().FullName + "(" + snapshot.data().Position + ") - " + snapshot.data().DraftStatus);
            setRankTitle("Rank");
            setLine1("Rushing Yards");
            setLine1Value(snapshot.data().RushingYDS);
            setLine2("Rushing TDs");
            setLine2Value(snapshot.data().RushingTDs);
            setLine3("Fumbles");
            setLine3Value(snapshot.data().Fumbles);
            setLine4("Receiving Yards");
            setLine4Value(snapshot.data().ReceivingYDS);
            setLine5("Receiving TDs");
            setLine5Value(snapshot.data().ReceivingTDs);
            setLine6("Team");
            setLine6Value(snapshot.data().Team);
            break;
          case "WR":
            setPlayerTitle(snapshot.data().FullName + "(" + snapshot.data().Position + ") - " + snapshot.data().DraftStatus);
            setRankTitle("Rank");
            setLine1("Receiving Yards");
            setLine1Value(snapshot.data().ReceivingYDS);
            setLine2("Receiving TDs");
            setLine2Value(snapshot.data().ReceivingTDs);
            setLine3("Fumbles");
            setLine3Value(snapshot.data().Fumbles);
            setLine4("Receptions");
            setLine4Value(snapshot.data().ReceivingRec);
            setLine5("Targets");
            setLine5Value(snapshot.data().ReceivingTargets);
            setLine6("Team");
            setLine6Value(snapshot.data().Team);
            break;
          case "TE":
            setPlayerTitle(snapshot.data().FullName + " (" + snapshot.data().Position + ") - " + snapshot.data().DraftStatus);
            setRankTitle("Rank");
            setLine1("Receiving Yards");
            setLine1Value(snapshot.data().ReceivingYDS);
            setLine2("Receiving TDs");
            setLine2Value(snapshot.data().ReceivingTDs);
            setLine3("Fumbles");
            setLine3Value(snapshot.data().Fumbles);
            setLine4("Receptions");
            setLine4Value(snapshot.data().ReceivingRec);
            setLine5("Targets");
            setLine5Value(snapshot.data().ReceivingTargets);
            setLine6("Team");
            setLine6Value(snapshot.data().Team);
            break;
          default:
            setPlayerTitle("*Select Player*");
            setRankTitle("");
            setLine1("");
            setLine1Value("");
            setLine2("");
            setLine2Value("");
            setLine3("");
            setLine3Value("");
            setLine4("");
            setLine4Value("");
            setLine5("");
            setLine5Value("");
            setLine6("");
            setLine6Value("");
        }
      } else {
        console.log("No current player found");
        setPlayer({});
      }
    });

    return () => unsubscribe(); // clean up listener on unmount
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-850">
        <div className="flex justify-between">
          <p className="font-semibold text-xl">Auction Draft</p>
          <p className="font-semibold text-xl">
            {playerTitle}
          </p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
              <span>
                <GoPrimitiveDot />
              </span>
              <span>Teams</span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-10 flex-wrap justify-left">
          <div className=" border-r-1 border-color m-4 pr-10">
            <div className="mt-1">
              <p className="text-gray-500 mt-1">{rankTitle}</p>
              <p className="text-grey-500 text-3xl font-semibold">
                {player.PositionRank}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-gray-500 mt-1">{line1}</p>
              <p className="text-green-500 text-3xl font-semibold">
                {line1Value}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-gray-500 mt-1">{line2}</p>
              <p className="text-green-500 text-3xl font-semibold">
                {line2Value}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-gray-500 mt-1">{line3}</p>
              <p className="text-red-500 text-3xl font-semibold">
                {line3Value}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-gray-500 mt-1">{line4}</p>
              <p className="text-green-500 text-3xl font-semibold">
                {line4Value}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-gray-500 mt-1">{line5}</p>
              <p className="text-green-500 text-3xl font-semibold">
                {line5Value}
              </p>{" "}
            </div>
            <div className="mt-1">
              <p className="text-gray-500 mt-1">{line6}</p>
              <p className="text-grey-500 text-3xl font-semibold">
                {line6Value}
              </p>{" "}
            </div>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="warning"
                onClick={handleClear}
                sx={{ mr: 2 }} // Adds margin to the right of the button
              >
                Clear Draft
              </Button>
              <DraftResetComponent />
            </Box>
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
    </>
  );
};

export default DraftComponent;
