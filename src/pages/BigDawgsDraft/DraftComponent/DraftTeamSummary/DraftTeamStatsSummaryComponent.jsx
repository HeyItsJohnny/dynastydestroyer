import React, { useState, useEffect } from "react";

//Firebase
import { db } from "../../../../firebase/firebase";
import { onSnapshot, doc, collection } from "firebase/firestore";

//User ID
import { useAuth } from "../../../../contexts/AuthContext";

import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  PieSeries,
  AccumulationTooltip,
  AccumulationDataLabel,
  AccumulationLegend,
} from "@syncfusion/ej2-react-charts";

import { useStateContext } from "../../../../contexts/ContextProvider";

const DraftTeamStatsSummaryComponent = ({ team }) => {
  const { currentUser } = useAuth();
  const { currentMode } = useStateContext();
  const [pieChartData, setPieChartData] = useState([]);
  /*
  const pieChartData = [
    { x: "Team A", y: 35 },
    { x: "Team B", y: 25 },
    { x: "Team C", y: 15 },
    { x: "Team D", y: 25 },
  ];*/

  useEffect(() => {
  if (!team || !currentUser.uid || !team.id || !team.TeamAmount) return;

  const playersRef = collection(
    db,
    "userprofile",
    currentUser.uid,
    "teams",
    team.id,
    "players"
  );

  const unsub = onSnapshot(playersRef, (snapshot) => {
    const positionSums = { QB: 0, RB: 0, WR: 0, TE: 0 };
    let totalSpent = 0;

    snapshot.forEach((doc) => {
      const player = doc.data();
      const position = player.Position;
      const draftAmount = parseFloat(player.DraftAmount) || 0;

      totalSpent += draftAmount;

      if (positionSums.hasOwnProperty(position)) {
        positionSums[position] += draftAmount;
      }
    });

    const remaining = Math.max(team.TeamAmount - totalSpent, 0);

    const pieData = Object.entries(positionSums)
      .filter(([_, amount]) => amount > 0)
      .map(([x, y]) => ({ x, y }));

    pieData.push({ x: "Remaining", y: remaining });

    setPieChartData(pieData);
  });

  return () => unsub();
}, [currentUser.uid, team]);

  return (
    <div className="w-1/3 min-w-[250px]">
      <AccumulationChartComponent
        title={team.TeamName}
        height="100%"
        width="100%"
        id={`pie-chart-${team.id.replace(/[^a-zA-Z0-9-_]/g, "")}`}
        background={currentMode === "Dark" ? "#33373E" : "#fff"}
        legendSettings={{
          visible: true,
          textStyle: {
            color: "white", // Set legend text to white
            fontWeight: "500",
            size: "13px",
          },
        }}
        titleStyle={{
          color: "white",
          fontSize: "14px",
          fontWeight: "bold",
        }}
        tooltip={{ enable: true }}
      >
        <Inject
          services={[
            PieSeries,
            AccumulationTooltip,
            AccumulationDataLabel,
            AccumulationLegend,
          ]}
        />
        <AccumulationSeriesCollectionDirective>
          <AccumulationSeriesDirective
            dataSource={pieChartData}
            xName="x"
            yName="y"
            type="Pie"
            dataLabel={{
              visible: true,
              position: "Inside",
              name: "x",
              font: {
                fontWeight: "600",
                size: "10px", // smaller labels
              },
            }}
            radius="60%" // smaller pie
          />
        </AccumulationSeriesCollectionDirective>
      </AccumulationChartComponent>
    </div>
  );
};

export default DraftTeamStatsSummaryComponent;
