import React from "react";

export const PLACEHOLDER_IMAGE =
  "https://placehold.co/320x320/e5e7eb/374151?text=Player";

export const SAMPLE_WEEKLY_ROWS = [
  {
    id: "placeholder-1",
    week: 1,
    opponent: "DAL",
    passingYards: 0,
    passingTDs: 0,
    rushingYards: 72,
    rushingTDs: 1,
    receptions: 4,
    receivingYards: 31,
    receivingTDs: 0,
    fantasyPoints: 20.3,
    isPlaceholder: true,
  },
  {
    id: "placeholder-2",
    week: 2,
    opponent: "PHI",
    passingYards: 0,
    passingTDs: 0,
    rushingYards: 88,
    rushingTDs: 1,
    receptions: 3,
    receivingYards: 22,
    receivingTDs: 0,
    fantasyPoints: 20,
    isPlaceholder: true,
  },
  {
    id: "placeholder-3",
    week: 3,
    opponent: "NYG",
    passingYards: 0,
    passingTDs: 0,
    rushingYards: 63,
    rushingTDs: 0,
    receptions: 5,
    receivingYards: 46,
    receivingTDs: 1,
    fantasyPoints: 21.9,
    isPlaceholder: true,
  },
  {
    id: "placeholder-4",
    week: 4,
    opponent: "WAS",
    passingYards: 0,
    passingTDs: 0,
    rushingYards: 104,
    rushingTDs: 1,
    receptions: 2,
    receivingYards: 18,
    receivingTDs: 0,
    fantasyPoints: 20.2,
    isPlaceholder: true,
  },
  {
    id: "placeholder-5",
    week: 5,
    opponent: "SF",
    passingYards: 0,
    passingTDs: 0,
    rushingYards: 57,
    rushingTDs: 0,
    receptions: 6,
    receivingYards: 51,
    receivingTDs: 0,
    fantasyPoints: 16.8,
    isPlaceholder: true,
  },
];

export const FIELD_DEFINITIONS = {
  fullName: { label: "Full Name", path: "fullName", placeholder: "Saquon Barkley" },
  nflTeam: { label: "Team", path: "nflTeam", placeholder: "PHI" },
  position: { label: "Position", path: "position", placeholder: "RB" },
  age: { label: "Age", path: "age", placeholder: 29 },
  status: { label: "Status", path: "status", placeholder: "Active" },
  depthChartPosition: {
    label: "Depth Chart Position",
    path: "depthChartPosition",
    placeholder: "RB1",
  },
  yearsExp: { label: "Years Experience", path: "yearsExp", placeholder: 7 },
  height: { label: "Height", path: "height", placeholder: "6'0\"" },
  weight: { label: "Weight", path: "weight", placeholder: "232 lbs" },
  college: { label: "College", path: "college", placeholder: "Penn State" },
  byeWeek: { label: "Bye Week", path: "byeWeek", placeholder: 9 },
  auctionValue: {
    label: "Auction Value",
    path: "rankings.auctionValue",
    placeholder: "$48",
    formatter: formatCurrency,
  },
  projectedPoints: {
    label: "Projected Points",
    path: "rankings.projectedPoints",
    placeholder: 287.4,
  },
  rank: { label: "Rank", path: "rankings.rank", placeholder: "#8", formatter: formatRank },
  tier: { label: "Tier", path: "rankings.tier", placeholder: "Elite" },
  adp: { label: "ADP", path: "draft.adp", placeholder: "7.2" },
  recommendedMaxBid: {
    label: "Recommended Max Bid",
    path: "auction.recommendedMaxBid",
    placeholder: "$58",
    formatter: formatCurrency,
  },
  hardMaxBid: {
    label: "Hard Max Bid",
    path: "auction.hardMaxBid",
    placeholder: "$62",
    formatter: formatCurrency,
  },
  fairValue: {
    label: "Fair Value",
    path: "auctionAnalysis.fairValue",
    placeholder: "$52",
    formatter: formatCurrency,
  },
  currentAverageCost: {
    label: "Current Average Cost",
    path: "auctionAnalysis.currentAverageCost",
    placeholder: "$55",
    formatter: formatCurrency,
  },
  valueScore: {
    label: "Value Score",
    path: "auctionAnalysis.valueScore",
    placeholder: "+7.4",
  },
  positionScarcity: {
    label: "Position Scarcity",
    path: "auctionAnalysis.positionScarcity",
    placeholder: "High",
  },
  threatTeams: {
    label: "Threat Teams",
    path: "auctionAnalysis.threatTeams",
    placeholder: ["Team Mike", "Team Chris", "Team Danny"],
  },
  positionRank: {
    label: "Position Rank",
    path: "rankings.positionRank",
    placeholder: "#2",
    formatter: formatRank,
  },
  overallRank: {
    label: "Overall Rank",
    path: "rankings.overallRank",
    placeholder: "#5",
    formatter: formatRank,
  },
  notes: { label: "Notes", path: "notes", placeholder: "" },
};

export const STATS_FIELD_DEFINITIONS = {
  games: { label: "Games Played", path: "games", placeholder: 16 },
  passingYards: { label: "Passing Yards", path: "passingYards", placeholder: 0 },
  passingTDs: { label: "Passing TDs", path: "passingTDs", placeholder: 0 },
  interceptions: { label: "Interceptions", path: "interceptions", placeholder: 0 },
  rushingAttempts: { label: "Attempts", path: "rushingAttempts", placeholder: 248 },
  rushingYards: { label: "Yards", path: "rushingYards", placeholder: 1248 },
  rushingTDs: { label: "TDs", path: "rushingTDs", placeholder: 11 },
  targets: { label: "Targets", path: "targets", placeholder: 68 },
  receptions: { label: "Receptions", path: "receptions", placeholder: 52 },
  receivingYards: { label: "Yards", path: "receivingYards", placeholder: 412 },
  receivingTDs: { label: "TDs", path: "receivingTDs", placeholder: 3 },
  fantasyPoints: {
    label: "Fantasy Points",
    path: "fantasyPoints",
    placeholder: 256.4,
  },
  fantasyPointsPpr: {
    label: "PPR Points",
    path: "fantasyPointsPpr",
    placeholder: 308.4,
  },
};

export const isMissingValue = (value) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

export function getNestedValue(source, path) {
  return `${path ?? ""}`.split(".").reduce((currentValue, pathPart) => {
    if (currentValue == null) {
      return undefined;
    }

    return currentValue[pathPart];
  }, source);
}

export function formatCurrency(value) {
  if (typeof value === "string" && value.startsWith("$")) {
    return value;
  }

  return value === undefined || value === null || value === "" ? value : `$${value}`;
}

export function formatRank(value) {
  if (typeof value === "string" && value.startsWith("#")) {
    return value;
  }

  return value === undefined || value === null || value === "" ? value : `#${value}`;
}

export function resolveField(source, fieldKey) {
  const definition = FIELD_DEFINITIONS[fieldKey];
  const rawValue = getNestedValue(source, definition.path);
  const isPlaceholder = isMissingValue(rawValue);
  const value = isPlaceholder ? definition.placeholder : rawValue;

  return {
    ...definition,
    key: fieldKey,
    isPlaceholder,
    value: definition.formatter ? definition.formatter(value) : value,
  };
}

export function resolveStatsField(stats, fieldKey) {
  const definition = STATS_FIELD_DEFINITIONS[fieldKey];
  const rawValue = getNestedValue(stats, definition.path);
  const isPlaceholder = isMissingValue(rawValue);

  return {
    ...definition,
    key: fieldKey,
    isPlaceholder,
    value: isPlaceholder ? definition.placeholder : rawValue,
  };
}

export function getMissingPlayerFieldKeys(player) {
  return Object.entries(FIELD_DEFINITIONS)
    .filter(([, definition]) => isMissingValue(getNestedValue(player, definition.path)))
    .map(([fieldKey]) => fieldKey);
}

export function getMissingStatsFieldKeys(stats) {
  return Object.entries(STATS_FIELD_DEFINITIONS)
    .filter(([, definition]) => isMissingValue(getNestedValue(stats, definition.path)))
    .map(([fieldKey]) => `seasonStats.${fieldKey}`);
}

export function PlaceholderBadge({ label = "Placeholder" }) {
  return <span className="badge bg-warning text-dark ms-2">{label}</span>;
}

export function FieldValue({ field }) {
  return (
    <>
      <span>{Array.isArray(field.value) ? field.value.join(", ") : field.value}</span>
      {field.isPlaceholder && <PlaceholderBadge />}
    </>
  );
}

export function InfoRow({ label, field }) {
  return (
    <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
      <span className="text-muted">{label}</span>
      <span className="fw-semibold text-end">
        <FieldValue field={field} />
      </span>
    </div>
  );
}
