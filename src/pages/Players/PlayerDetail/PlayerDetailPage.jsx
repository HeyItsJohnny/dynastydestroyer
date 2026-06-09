import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const getLastSeasonYear = (date = new Date()) => getCurrentSeasonYear(date) - 1;

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
    paths: [
      "projectedStats.auction_value",
      "projectedStats.Auction Value",
      "rankings.auctionValue",
    ],
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
    paths: [
      "projectedStats.max_bid",
      "projectedStats.Max Bid",
      "auction.recommendedMaxBid",
    ],
    placeholder: "$48",
    formatter: (value) =>
      typeof value === "string" && value.startsWith("$") ? value : `$${value}`,
  },
  hardMax: {
    label: "Hard Max",
    paths: [
      "projectedStats.hard_max_bid",
      "projectedStats.Hard Max Bid",
      "auction.hardMaxBid",
    ],
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

const DraftFlagButton = ({ active, color, label, onClick }) => {
  const colors = {
    success: "#198754",
    danger: "#dc3545",
    purple: "#7c3aed",
  };
  const buttonColor = colors[color] ?? colors.success;
  const buttonStyle = {
    backgroundColor: active ? buttonColor : "transparent",
    borderColor: buttonColor,
    borderRadius: "9999px",
    color: "#fff",
  };

  return (
    <button
      className="btn rounded-pill px-4 shadow-sm"
      onClick={onClick}
      style={buttonStyle}
      type="button"
    >
      <span className="me-2">{active ? "★" : "☆"}</span>
      {label}
    </button>
  );
};

const getDraftFlagToastMessage = (playerName, flagName, isActive) => {
  const activeMessages = {
    target: `${playerName} set as Target`,
    doNotDraft: `${playerName} set as Do Not Draft`,
    sleeper: `${playerName} set as Sleeper`,
  };
  const removedLabels = {
    target: "Targeted",
    doNotDraft: "Do Not Draft",
    sleeper: "Sleeper",
  };
  const removedLabel = removedLabels[flagName] ?? flagName;

  return isActive
    ? activeMessages[flagName] ?? `${playerName} set as ${flagName}`
    : `${playerName} removed as ${removedLabel}`;
};

const getStatValue = (source, paths) => {
  const value = paths
    .map((path) => getNestedValue(source, path))
    .find((item) => !isMissingValue(item));

  return isMissingValue(value) ? "-" : value;
};

const getSeasonStats = (player) => ({
  ...(player?.seasonStats ?? {}),
  ...(player?.seasonStats?.stats ?? {}),
});

const getWeeklyStatsRows = (player) =>
  [...(player?.weeklyStats ?? [])]
    .filter((week) => {
      const weekNumber = Number(week.week);
      return weekNumber >= 1 && weekNumber <= 18;
    })
    .sort((firstWeek, secondWeek) => Number(firstWeek.week ?? 0) - Number(secondWeek.week ?? 0));

const getSeasonSummaryFields = (positionValue) => {
  if (positionValue === "QB") {
    return [
      { label: "Games", paths: ["games"] },
      { label: "Pass Yds", paths: ["passingYards"] },
      { label: "Pass TD", paths: ["passingTDs"] },
      {
        label: "INT",
        paths: [
          "interceptions",
          "passing_interceptions",
          "rawRow.passing_interceptions",
          "passing_intercentions",
          "rawRow.passing_intercentions",
        ],
      },
      { label: "Rush Yds", paths: ["rushingYards"] },
      { label: "Rush TD", paths: ["rushingTDs"] },
      { label: "Fantasy Pts", paths: ["fantasyPoints"] },
      { label: "PPR", paths: ["fantasyPointsPpr"] },
    ];
  }

  if (positionValue === "RB") {
    return [
      { label: "Games", paths: ["games"] },
      { label: "Carries", paths: ["rushingAttempts"] },
      { label: "Rush Yds", paths: ["rushingYards"] },
      { label: "Rush TD", paths: ["rushingTDs"] },
      { label: "Targets", paths: ["targets"] },
      { label: "Rec", paths: ["receptions"] },
      { label: "Rec Yds", paths: ["receivingYards"] },
      { label: "Rec TD", paths: ["receivingTDs"] },
      { label: "Fantasy Pts", paths: ["fantasyPoints"] },
      { label: "PPR", paths: ["fantasyPointsPpr"] },
    ];
  }

  return [
    { label: "Games", paths: ["games"] },
    { label: "Targets", paths: ["targets"] },
    { label: "Rec", paths: ["receptions"] },
    { label: "Rec Yds", paths: ["receivingYards"] },
    { label: "Rec TD", paths: ["receivingTDs"] },
    { label: "Rush Yds", paths: ["rushingYards"] },
    { label: "Rush TD", paths: ["rushingTDs"] },
    { label: "Fantasy Pts", paths: ["fantasyPoints"] },
    { label: "PPR", paths: ["fantasyPointsPpr"] },
  ];
};

const getWeeklyStatsColumns = (positionValue) => {
  if (positionValue === "QB") {
    return [
      { label: "Week", paths: ["week"] },
      { label: "Opp", paths: ["opponent"] },
      { label: "Pass Yds", paths: ["passing.yards"] },
      { label: "Pass TD", paths: ["passing.touchdowns"] },
      {
        label: "INT",
        paths: [
          "passing.interceptions",
          "passing_interceptions",
          "passing_intercentions",
        ],
      },
      { label: "Rush Yds", paths: ["rushing.yards"] },
      { label: "Rush TD", paths: ["rushing.touchdowns"] },
      { label: "PPR", paths: ["fantasy.pointsPpr"] },
    ];
  }

  if (positionValue === "RB") {
    return [
      { label: "Week", paths: ["week"] },
      { label: "Opp", paths: ["opponent"] },
      { label: "Rush Att", paths: ["rushing.attempts"] },
      { label: "Rush Yds", paths: ["rushing.yards"] },
      { label: "Rush TD", paths: ["rushing.touchdowns"] },
      { label: "Rec", paths: ["receiving.receptions"] },
      { label: "Rec Yds", paths: ["receiving.yards"] },
      { label: "Rec TD", paths: ["receiving.touchdowns"] },
      { label: "PPR", paths: ["fantasy.pointsPpr"] },
    ];
  }

  return [
    { label: "Week", paths: ["week"] },
    { label: "Opp", paths: ["opponent"] },
    { label: "Targets", paths: ["receiving.targets"] },
    { label: "Rec", paths: ["receiving.receptions"] },
    { label: "Rec Yds", paths: ["receiving.yards"] },
    { label: "Rec TD", paths: ["receiving.touchdowns"] },
    { label: "Rush Yds", paths: ["rushing.yards"] },
    { label: "Rush TD", paths: ["rushing.touchdowns"] },
    { label: "PPR", paths: ["fantasy.pointsPpr"] },
  ];
};

const getStatGridColumnsClass = (columns) => {
  if (columns === 1) {
    return "grid-cols-1";
  }

  if (columns === 2) {
    return "grid-cols-1 md:grid-cols-2";
  }

  return "grid-cols-1 md:grid-cols-3";
};

const SeasonStatGrid = ({ columns = 3, fields, seasonStats }) => (
  <div className={`mt-3 grid ${getStatGridColumnsClass(columns)} gap-x-6 gap-y-2`}>
    {fields.map((field) => (
      <div className="border-b border-color py-2" key={field.label}>
        <p className="text-gray-500 mb-1">{field.label}</p>
        <p className="font-semibold mb-0">
          {getStatValue(seasonStats, field.paths)}
        </p>
      </div>
    ))}
  </div>
);

const CompactSeasonSections = ({ seasonStats, sections }) => (
  <div className="md:w-400">
    {sections.map((section) => (
      <div
        className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-2 p-4 rounded-2xl"
        key={section.title}
      >
        <p className="text-xl font-semibold mb-0">{section.title}</p>
        <SeasonStatGrid
          columns={section.columns}
          fields={section.fields}
          seasonStats={seasonStats}
        />
      </div>
    ))}
  </div>
);

const SeasonSummaryCard = ({ player }) => {
  const seasonStats = getSeasonStats(player);
  const fields = getSeasonSummaryFields(player.position);

  if (player.position === "QB") {
    const qbSections = [
      {
        title: `${player.selectedSeason} Passing`,
        columns: 3,
        fields: [
          { label: "Pass Yds", paths: ["passingYards"] },
          { label: "Pass TD", paths: ["passingTDs"] },
          {
            label: "INT",
            paths: [
              "interceptions",
              "passing_interceptions",
              "rawRow.passing_interceptions",
              "passing_intercentions",
              "rawRow.passing_intercentions",
            ],
          },
        ],
      },
      {
        title: `${player.selectedSeason} Rushing`,
        columns: 2,
        fields: [
          { label: "Rush Yds", paths: ["rushingYards"] },
          { label: "Rush TD", paths: ["rushingTDs"] },
        ],
      },
      {
        title: `${player.selectedSeason} Fantasy Summary`,
        columns: 3,
        fields: [
          { label: "Games", paths: ["games"] },
          { label: "Fantasy Pts", paths: ["fantasyPoints"] },
          { label: "PPR Pts", paths: ["fantasyPointsPpr"] },
        ],
      },
    ];

    return <CompactSeasonSections seasonStats={seasonStats} sections={qbSections} />;
  }

  if (player.position === "RB") {
    const rbSections = [
      {
        title: `${player.selectedSeason} Rushing`,
        columns: 3,
        fields: [
          { label: "Carries", paths: ["rushingAttempts"] },
          { label: "Rush Yds", paths: ["rushingYards"] },
          { label: "Rush TD", paths: ["rushingTDs"] },
        ],
      },
      {
        title: `${player.selectedSeason} Receiving`,
        columns: 2,
        fields: [
          { label: "Targets", paths: ["targets"] },
          { label: "Rec", paths: ["receptions"] },
          { label: "Rec Yds", paths: ["receivingYards"] },
          { label: "Rec TD", paths: ["receivingTDs"] },
        ],
      },
      {
        title: `${player.selectedSeason} Fantasy Summary`,
        columns: 3,
        fields: [
          { label: "Games", paths: ["games"] },
          { label: "Fantasy Pts", paths: ["fantasyPoints"] },
          { label: "PPR", paths: ["fantasyPointsPpr"] },
        ],
      },
    ];

    return <CompactSeasonSections seasonStats={seasonStats} sections={rbSections} />;
  }

  if (["WR", "TE"].includes(player.position)) {
    const receivingSections = [
      {
        title: `${player.selectedSeason} Receiving`,
        columns: 2,
        fields: [
          { label: "Targets", paths: ["targets"] },
          { label: "Rec", paths: ["receptions"] },
          { label: "Rec Yds", paths: ["receivingYards"] },
          { label: "Rec TD", paths: ["receivingTDs"] },
        ],
      },
      {
        title: `${player.selectedSeason} Rushing`,
        columns: 2,
        fields: [
          { label: "Rush Yds", paths: ["rushingYards"] },
          { label: "Rush TD", paths: ["rushingTDs"] },
        ],
      },
      {
        title: `${player.selectedSeason} Fantasy Summary`,
        columns: 3,
        fields: [
          { label: "Games", paths: ["games"] },
          { label: "Fantasy Pts", paths: ["fantasyPoints"] },
          { label: "PPR Pts", paths: ["fantasyPointsPpr"] },
        ],
      },
    ];

    return (
      <CompactSeasonSections
        seasonStats={seasonStats}
        sections={receivingSections}
      />
    );
  }

  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl md:w-400">
      <p className="text-xl font-semibold">{player.selectedSeason} Season Summary</p>
      <SeasonStatGrid fields={fields} seasonStats={seasonStats} />
    </div>
  );
};

const WeeklyStatsCard = ({ player }) => {
  const weeklyRows = getWeeklyStatsRows(player);
  const columns = getWeeklyStatsColumns(player.position);

  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl md:w-1000">
      <div className="flex justify-between items-center gap-2">
        <p className="text-xl font-semibold mb-0">Weekly Stats</p>
        <p className="text-xl font-semibold mb-0">{player.selectedSeason}</p>
      </div>
      <div className="table-responsive mt-4" style={{ maxHeight: "520px", overflowY: "auto" }}>
        <table
          className="table table-striped table-hover mb-0 text-center"
          style={{ minWidth: "900px" }}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th className="text-center text-gray-500" key={column.label} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeklyRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>No weekly stats found.</td>
              </tr>
            ) : (
              weeklyRows.map((row) => (
                <tr key={row.id ?? `${row.season}-${row.week}`}>
                  {columns.map((column) => (
                    <td className="text-center" key={column.label}>
                      {getStatValue(row, column.paths)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const NotesCard = ({ notes, onNotesChange, onSave, season }) => (
  <div
    className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl"
    style={{ maxWidth: "1400px", width: "90%" }}
  >
    <div className="flex flex-wrap justify-between items-center gap-3">
      <p className="text-xl font-semibold mb-0">{season} Notes</p>
      <button
        className="btn btn-success rounded-pill px-4"
        onClick={onSave}
        style={{
          backgroundColor: "#198754",
          borderColor: "#198754",
          borderRadius: "9999px",
          color: "#fff",
        }}
        type="button"
      >
        Save
      </button>
    </div>
    <textarea
      className="mt-4 p-3 rounded"
      onChange={(event) => onNotesChange(event.target.value)}
      style={{
        backgroundColor: "transparent",
        border: "1px solid rgba(148, 163, 184, 0.45)",
        boxSizing: "border-box",
        color: "inherit",
        display: "block",
        minHeight: "260px",
        resize: "vertical",
        width: "100%",
      }}
      value={notes}
    />
  </div>
);

const PlayerDetailPage = () => {
  const { sleeperId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [notesText, setNotesText] = useState("");

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

      const lastSeasonYear = getLastSeasonYear();
      const projectedSeasonYear = getProjectedSeasonYear();
      const seasonStatsSnap = await getDoc(
        doc(playerRef, "seasonStats", `${lastSeasonYear}`)
      );
      const projectedStatsSnap = await getDoc(
        doc(playerRef, "projectedStats", `${projectedSeasonYear}`)
      );
      const seasonNotesSnap = await getDoc(
        doc(playerRef, "seasonNotes", `${projectedSeasonYear}`)
      );
      const weeklyStatsSnapshot = await getDocs(
        query(
          collection(playerRef, "weeklyStats"),
          where("season", "==", lastSeasonYear)
        )
      );

      setPlayer(
        normalizePlayerDoc(playerSnap.id, {
          ...playerSnap.data(),
          selectedSeason: lastSeasonYear,
          projectedSeason: projectedSeasonYear,
          seasonNotesYear: projectedSeasonYear,
          seasonStats: seasonStatsSnap.exists() ? seasonStatsSnap.data() : {},
          projectedStats: projectedStatsSnap?.exists() ? projectedStatsSnap.data() : {},
          seasonNotes: seasonNotesSnap.exists() ? seasonNotesSnap.data() : {},
          weeklyStats: weeklyStatsSnapshot.docs.map((weeklyStatsDoc) => ({
            id: weeklyStatsDoc.id,
            ...weeklyStatsDoc.data(),
          })),
        })
      );
      setNotesText(seasonNotesSnap.exists() ? seasonNotesSnap.data().notes ?? "" : "");
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
      const notesYear = player?.seasonNotesYear ?? getProjectedSeasonYear();
      const nextValue = !player?.seasonNotes?.[flagName];

      await setDoc(
        doc(db, "players", sleeperId, "seasonNotes", `${notesYear}`),
        {
          season: notesYear,
          [flagName]: nextValue,
          timestamps: {
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      setPlayer((currentPlayer) => ({
        ...(currentPlayer ?? {}),
        seasonNotes: {
          ...(currentPlayer?.seasonNotes ?? {}),
          [flagName]: nextValue,
        },
      }));
      const toastMessage = getDraftFlagToastMessage(
        player?.fullName ?? "Player",
        flagName,
        nextValue
      );
      const toastOptions = {
        autoClose: 2500,
        position: "top-center",
      };

      if (nextValue) {
        toast.success(toastMessage, toastOptions);
      } else {
        toast.error(toastMessage, toastOptions);
      }
    } catch (error) {
      setMessage(`Updating draft flag failed: ${error.message}`);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const notesYear = player?.seasonNotesYear ?? getProjectedSeasonYear();

      await setDoc(
        doc(db, "players", sleeperId, "seasonNotes", `${notesYear}`),
        {
          season: notesYear,
          notes: notesText,
          timestamps: {
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      setPlayer((currentPlayer) => ({
        ...(currentPlayer ?? {}),
        seasonNotes: {
          ...(currentPlayer?.seasonNotes ?? {}),
          notes: notesText,
        },
      }));
      toast.success("Notes Saved", {
        autoClose: 2500,
        position: "top-center",
      });
    } catch (error) {
      setMessage(`Saving notes failed: ${error.message}`);
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
  const firstDraftValueColumn = ["rank", "tier", "strengthOfSchedule"].map((fieldKey) =>
    resolveField(player, fieldKey)
  );
  const secondDraftValueColumn = ["auctionValue", "maxBid", "hardMax"].map((fieldKey) =>
    resolveField(player, fieldKey)
  );
  const draftFlags = player.seasonNotes ?? {};
  const headerRank = resolveField(player, "rank");
  const headerTier = resolveField(player, "tier");

  return (
    <>
      <ToastContainer />

      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xl font-semibold mb-0">
            {fullName.value}
            {fullName.isPlaceholder ? "*" : ""} • {position.value}
            {position.isPlaceholder ? "*" : ""} • Rank: {headerRank.value}
            {headerRank.isPlaceholder ? "*" : ""} • Tier {headerTier.value}
            {headerTier.isPlaceholder ? "*" : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            <DraftFlagButton
              active={!!draftFlags.target}
              color="success"
              label="Target"
              onClick={() => handleFlagPlayer("target")}
            />
            <DraftFlagButton
              active={!!draftFlags.doNotDraft}
              color="danger"
              label="Do Not Draft"
              onClick={() => handleFlagPlayer("doNotDraft")}
            />
            <DraftFlagButton
              active={!!draftFlags.sleeper}
              color="purple"
              label="Sleeper"
              onClick={() => handleFlagPlayer("sleeper")}
            />
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
                  field={field}
                  key={field.key}
                />
              ))}
            </div>
            <div>
              {secondDraftValueColumn.map((field) => (
                <DetailRow field={field} key={field.key} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap justify-center mt-4">
        <SeasonSummaryCard player={player} />
        <WeeklyStatsCard player={player} />
      </div>

      <div className="flex gap-4 flex-wrap justify-center mt-4">
        <NotesCard
          notes={notesText}
          onNotesChange={setNotesText}
          onSave={handleSaveNotes}
          season={player.seasonNotesYear}
        />
      </div>
    </>
  );
};

export default PlayerDetailPage;
