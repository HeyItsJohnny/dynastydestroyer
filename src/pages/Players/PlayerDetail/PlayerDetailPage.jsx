import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "../../../firebase/firebase";
import {
  PLACEHOLDER_IMAGE,
  getNestedValue,
  isMissingValue,
} from "./PlayerDetailHelpers";

const getCurrentSeasonYear = (date = new Date()) => date.getFullYear();

const getProjectedSeasonYear = (date = new Date()) => getCurrentSeasonYear(date);

const normalizePlayerDoc = (playerId, data) => ({
  id: playerId,
  ...data,
  fullName: data.fullName ?? data.FullName ?? "",
  nflTeam: data.nflTeam ?? data.Team ?? data.sleeper?.rawData?.team ?? "",
  position: data.position ?? data.Position ?? data.sleeper?.rawData?.position ?? "",
  age: data.age ?? data.Age ?? data.sleeper?.rawData?.age ?? "",
  status: data.status ?? data.Status ?? data.sleeper?.rawData?.status ?? "",
  depthChartPosition:
    data.depthChartPosition ??
    data.DepthChartPosition ??
    data.depth_chart_position ??
    data.Depth_chart_position ??
    data.sleeper?.rawData?.depth_chart_position ??
    "",
  depthChartOrder:
    data.depthChartOrder ??
    data.DepthChartOrder ??
    data.depth_chart_order ??
    data.Depth_chart_order ??
    data.sleeper?.rawData?.depth_chart_order ??
    "",
  yearsExp: data.yearsExp ?? data.YearsExperience ?? data.sleeper?.rawData?.years_exp ?? "",
  height: data.height ?? data.Height ?? data.sleeper?.rawData?.height ?? "",
  weight: data.weight ?? data.Weight ?? data.sleeper?.rawData?.weight ?? "",
  college: data.college ?? data.College ?? data.sleeper?.rawData?.college ?? "",
  byeWeek: data.byeWeek ?? data.ByeWeek ?? data.sleeper?.rawData?.bye_week ?? "",
});

const FIELD_DEFINITIONS = {
  fullName: { label: "Full Name", paths: ["fullName"], placeholder: "Christian McCaffrey" },
  nflTeam: { label: "Team", paths: ["nflTeam"], placeholder: "SF" },
  position: { label: "Position", paths: ["position"], placeholder: "RB" },
  age: { label: "Age", paths: ["age"], placeholder: 29 },
  status: { label: "Status", paths: ["status"], placeholder: "Active" },
  depthChart: {
    label: "Depth Chart",
    paths: ["depthChartPosition", "depthChartOrder"],
    placeholder: "RB1",
  },
  yearsExp: { label: "Years Exp.", paths: ["yearsExp"], placeholder: 5 },
  height: { label: "Height", paths: ["height"], placeholder: "5'11\"" },
  weight: { label: "Weight", paths: ["weight"], placeholder: 210 },
  college: { label: "College", paths: ["college"], placeholder: "Alabama" },
  byeWeek: {
    label: "Bye Week",
    paths: ["projectedStats.bye_week", "projectedStats.byeWeek", "byeWeek"],
    placeholder: 9,
  },
  auctionValue: {
    label: "Auction Value",
    paths: ["projectedStats.auction_value", "rankings.auctionValue"],
    placeholder: "$42",
    formatter: (value) =>
      typeof value === "string" && value.startsWith("$") ? value : `$${value}`,
  },
  projectedPoints: {
    label: "Projected Pts.",
    paths: ["projectedStats.projected_points", "rankings.projectedPoints"],
    placeholder: 255.8,
  },
  rank: {
    label: "Rank",
    paths: ["projectedStats.rank", "rankings.rank"],
    placeholder: "#12",
    formatter: (value) =>
      typeof value === "string" && value.startsWith("#") ? value : `#${value}`,
  },
  tier: { label: "Tier", paths: ["projectedStats.tier", "rankings.tier"], placeholder: 2 },
  strengthOfSchedule: {
    label: "SOS",
    title: "Strength of Schedule",
    paths: [
      "projectedStats.strength_of_schedule",
      "projectedStats.stength_of_schedule",
    ],
    placeholder: 3,
    formatter: (value) => {
      const rating = Math.max(0, Math.min(5, Number(value) || 0));
      return `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
    },
  },
  maxBid: {
    label: "Max Bid",
    paths: ["auction.recommendedMaxBid"],
    placeholder: "$48",
    formatter: (value) =>
      typeof value === "string" && value.startsWith("$") ? value : `$${value}`,
  },
  hardMax: {
    label: "Hard Max",
    paths: ["auction.hardMaxBid"],
    placeholder: "$52",
    formatter: (value) =>
      typeof value === "string" && value.startsWith("$") ? value : `$${value}`,
  },
};

const resolveField = (player, fieldKey) => {
  const definition = FIELD_DEFINITIONS[fieldKey];

  if (fieldKey === "depthChart") {
    const playerPosition = getNestedValue(player, "position");
    const depthChartPosition = getNestedValue(player, "depthChartPosition");
    const depthChartOrder = getNestedValue(player, "depthChartOrder");
    const depthValue = [depthChartPosition, depthChartOrder]
      .map((value) => String(value ?? "").match(/\d+/)?.[0])
      .find((value) => !isMissingValue(value));
    const hasPosition = !isMissingValue(playerPosition);
    const hasDepthValue = !isMissingValue(depthValue);
    const isPlaceholder = !hasPosition || !hasDepthValue;
    const value = isPlaceholder ? definition.placeholder : `${playerPosition}${depthValue}`;

    return {
      ...definition,
      key: fieldKey,
      isPlaceholder,
      value,
    };
  }

  const rawValue = definition.paths
    .map((path) => getNestedValue(player, path))
    .find((value) => !isMissingValue(value));
  const isPlaceholder = isMissingValue(rawValue);
  const value = isPlaceholder ? definition.placeholder : rawValue;

  return {
    ...definition,
    key: fieldKey,
    isPlaceholder,
    value: definition.formatter ? definition.formatter(value) : value,
  };
};

const DetailRow = ({ field, emphasize = false }) => (
  <div className="flex justify-between gap-4 border-b border-color py-3">
    <p className="text-gray-500" title={field.title ?? ""}>
      {field.label}
    </p>
    <p
      className={`font-semibold text-right ${
        field.isPlaceholder ? "text-gray-400 italic" : emphasize ? "text-green-500 text-3xl" : ""
      }`}
    >
      {field.value}
      {field.isPlaceholder ? "*" : ""}
    </p>
  </div>
);

const PlayerDetailPage = () => {
  const { sleeperId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadPlayerDetail = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const playerRef = doc(db, "players", sleeperId);
      const playerSnap = await getDoc(playerRef);

      if (!playerSnap.exists()) {
        setPlayer(null);
        setMessage("Player not found.");
        return;
      }

      const currentSeasonYear = getCurrentSeasonYear();
      const projectedSeasonYear = getProjectedSeasonYear();
      const seasonStatsSnap = await getDoc(
        doc(playerRef, "seasonStats", `${currentSeasonYear}`)
      );
      const projectedStatsSnap = await getDoc(
        doc(playerRef, "projectedStats", `${projectedSeasonYear}`)
      );
      const weeklyStatsSnapshot = await getDocs(
        query(
          collection(playerRef, "weeklyStats"),
          where("season", "==", currentSeasonYear)
        )
      );

      setPlayer(
        normalizePlayerDoc(playerSnap.id, {
          ...playerSnap.data(),
          selectedSeason: currentSeasonYear,
          projectedSeason: projectedSeasonYear,
          seasonStats: seasonStatsSnap.exists() ? seasonStatsSnap.data() : {},
          projectedStats: projectedStatsSnap?.exists() ? projectedStatsSnap.data() : {},
          weeklyStats: weeklyStatsSnapshot.docs.map((weeklyStatsDoc) => ({
            id: weeklyStatsDoc.id,
            ...weeklyStatsDoc.data(),
          })),
        })
      );
    } catch (error) {
      setMessage(`Loading player failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [sleeperId]);

  useEffect(() => {
    loadPlayerDetail();
  }, [loadPlayerDetail]);

  const handleFlagPlayer = async (flagName) => {
    try {
      const nextValue = !player?.draftFlags?.[flagName];

      await setDoc(
        doc(db, "players", sleeperId),
        {
          draftFlags: {
            ...(player?.draftFlags ?? {}),
            [flagName]: nextValue,
          },
          timestamps: {
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      setPlayer((currentPlayer) => ({
        ...(currentPlayer ?? {}),
        draftFlags: {
          ...(currentPlayer?.draftFlags ?? {}),
          [flagName]: nextValue,
        },
      }));
    } catch (error) {
      setMessage(`Updating draft flag failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <div className="alert alert-info mb-0">Loading player detail...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/players")}>
          Back to Players
        </button>
        <div className="alert alert-danger mb-0">{message || "Player not found."}</div>
      </div>
    );
  }

  const fullName = resolveField(player, "fullName");
  const team = resolveField(player, "nflTeam");
  const position = resolveField(player, "position");
  const headshotUrl = player?.media?.headshotUrl || PLACEHOLDER_IMAGE;
  const headshotIsPlaceholder = isMissingValue(player?.media?.headshotUrl);
  const firstPlayerInfoColumn = ["age", "status", "depthChart", "yearsExp"].map((fieldKey) =>
    resolveField(player, fieldKey)
  );
  const secondPlayerInfoColumn = ["height", "weight", "college", "byeWeek"].map((fieldKey) =>
    resolveField(player, fieldKey)
  );
  const firstDraftValueColumn = ["rank", "tier", "strengthOfSchedule", "projectedPoints"].map((fieldKey) =>
    resolveField(player, fieldKey)
  );
  const secondDraftValueColumn = ["auctionValue", "maxBid", "hardMax"].map((fieldKey) =>
    resolveField(player, fieldKey)
  );

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/players")}>
            Back to Players
          </button>

          <p className={`text-xl font-semibold mb-0 ${fullName.isPlaceholder ? "text-gray-400 italic" : ""}`}>
            {fullName.value}
            {fullName.isPlaceholder ? "*" : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              className={`btn ${
                player.draftFlags?.target ? "btn-success" : "btn-outline-success"
              }`}
              onClick={() => handleFlagPlayer("target")}
              type="button"
            >
              Target
            </button>
            <button
              className={`btn ${
                player.draftFlags?.doNotDraft ? "btn-danger" : "btn-outline-danger"
              }`}
              onClick={() => handleFlagPlayer("doNotDraft")}
              type="button"
            >
              Do Not Draft
            </button>
          </div>
        </div>

        {message && <div className="alert alert-info mt-4 mb-0">{message}</div>}
      </div>

      <div className="flex gap-10 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl text-center w-72">
          <img
            alt={`${fullName.value} headshot`}
            className="img-fluid rounded mb-4"
            src={headshotUrl}
            style={{ maxHeight: "260px", objectFit: "cover", width: "100%" }}
          />
          {headshotIsPlaceholder && (
            <p className="text-gray-400 italic mb-2">Image*</p>
          )}
          <p
            className={`text-xl font-semibold mb-1 ${
              fullName.isPlaceholder ? "text-gray-400 italic" : ""
            }`}
          >
            {fullName.value}
            {fullName.isPlaceholder ? "*" : ""}
          </p>
          <p className="text-gray-500 mt-1">
            {position.value}
            {position.isPlaceholder ? "*" : ""} • {team.value}
            {team.isPlaceholder ? "*" : ""}
          </p>
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl md:w-850">
          <p className="text-xl font-semibold">Player Information</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <div>
              {firstPlayerInfoColumn.map((field) => (
                <DetailRow field={field} key={field.key} />
              ))}
            </div>
            <div>
              {secondPlayerInfoColumn.map((field) => (
                <DetailRow field={field} key={field.key} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl md:w-600">
          <p className="text-xl font-semibold">Draft Value</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <div>
              {firstDraftValueColumn.map((field) => (
                <DetailRow
                  emphasize={field.key === "projectedPoints"}
                  field={field}
                  key={field.key}
                />
              ))}
            </div>
            <div>
              {secondDraftValueColumn.map((field) => (
                <DetailRow
                  emphasize={field.key === "auctionValue"}
                  field={field}
                  key={field.key}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerDetailPage;
