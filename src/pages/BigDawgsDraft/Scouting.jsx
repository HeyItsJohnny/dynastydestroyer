import React, { useEffect, useMemo, useState } from "react";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

import { Header } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useStateContext } from "../../contexts/ContextProvider";
import { db } from "../../firebase/firebase";
import {
  buildFallbackScoutingNotes,
  getOpenAIScoutingNotes,
} from "../../services/openAIKeeperService";
import "../Players/PlayersPage.css";

const positionFilters = [
  { label: "QB", value: "QB", title: "Quarterbacks" },
  { label: "RB", value: "RB", title: "Running Backs" },
  { label: "WR", value: "WR", title: "Wide Receivers" },
  { label: "TE", value: "TE", title: "Tight Ends" },
];

const tierFilters = [
  { label: "All Tiers", value: "All" },
  { label: "Tier 1", value: "1" },
  { label: "Tier 2", value: "2" },
  { label: "Tier 3", value: "3" },
  { label: "Tier 4", value: "4" },
  { label: "Tier 5", value: "5" },
  { label: "Tier 6 and below", value: "6+" },
];

const rankFilters = [
  { label: "All Ranks", value: "All" },
  { label: "Top 5", value: "5" },
  { label: "Top 10", value: "10" },
  { label: "Top 15", value: "15" },
  { label: "Top 20", value: "20" },
  { label: "21+", value: "21+" },
];

const sleeperFilters = [
  { label: "All Targets", value: "All" },
  { label: "Sleepers", value: "Sleepers" },
];

const targetSortOptions = [
  { label: "DD Score", value: "ddScore" },
  { label: "Sleeper Score", value: "sleeperScore" },
  { label: "Auction Value", value: "auctionValue" },
  { label: "Tier", value: "tier" },
  { label: "Position Rank", value: "positionRank" },
];

const TARGET_BOARD_PAGE_SIZE = 8;
const WISHLIST_PAGE_SIZE = 5;
const BUDGET_STRATEGY_PAGE_SIZE = 7;
const SELECTABLE_PLAYER_PAGE_SIZE = 10;
const comboSlotCounts = {
  QB: 2,
  RB: 3,
  WR: 4,
  TE: 2,
};

const defaultAllocationRules = [
  { position: "RB", minPercent: 35, maxPercent: 45 },
  { position: "WR", minPercent: 35, maxPercent: 45 },
  { position: "QB", minPercent: 5, maxPercent: 10 },
  { position: "TE", minPercent: 5, maxPercent: 10 },
];

const budgetStrategyText = {
  QB: {
    title: "QB Budget Strategy",
    eliteTitle: "⭐ Elite QB1s",
    eliteDescription:
      "Difference-making quarterbacks worth a meaningful allocation commitment.",
    foundationDescription:
      "Reliable starters and stable QB builds that protect weekly scoring.",
    valueDescription:
      "Quarterbacks expected to outperform acquisition cost.",
    sleeperDescription:
      "Cheap upside quarterbacks, role bets, and depth targets.",
    underallocated: "QB Budget Underallocated",
    balanced: "Balanced QB Strategy",
    overallocated: "QB Budget Overallocated",
  },
  WR: {
    title: "WR Budget Strategy",
    eliteTitle: "⭐ Elite WR1s",
    eliteDescription:
      "Cornerstone WRs that can anchor a roster and consume a large portion of the WR budget.",
    foundationDescription:
      "Reliable starters that provide weekly stability and serve as the core of a balanced WR room.",
    valueDescription:
      "Players expected to outperform their acquisition cost. Mid players with high upside",
    sleeperDescription:
      "High-upside players, breakout candidates, rookies, injury discounts, and lottery tickets.",
    underallocated: "WR Budget Underallocated",
    balanced: "Balanced WR Strategy",
    overallocated: "WR Budget Overallocated",
  },
  RB: {
    title: "RB Budget Strategy",
    eliteTitle: "⭐ Elite RB1s",
    eliteDescription:
      "League-winning workhorse backs and cornerstone roster pieces.",
    foundationDescription:
      "Reliable RB2 and strong RB1 candidates that form the backbone of an RB room.",
    valueDescription:
      "Players expected to outperform their acquisition cost. Mid players with high upside",
    sleeperDescription:
      "Breakout candidates, rookies, committee backs with upside, and late-round dart throws.",
    underallocated: "RB Budget Underallocated",
    balanced: "Balanced RB Strategy",
    overallocated: "RB Budget Overallocated",
  },
  TE: {
    title: "TE Budget Strategy",
    eliteTitle: "⭐ Elite TE1s",
    eliteDescription:
      "Premium tight ends that create a weekly positional edge.",
    foundationDescription:
      "Reliable tight ends that stabilize the roster without breaking allocation.",
    valueDescription:
      "Tight ends expected to outperform acquisition cost.",
    sleeperDescription:
      "Cheap upside tight ends, breakout candidates, and depth targets.",
    underallocated: "TE Budget Underallocated",
    balanced: "Balanced TE Strategy",
    overallocated: "TE Budget Overallocated",
  },
};

const getCurrentSeasonYear = (date = new Date()) => date.getFullYear();

const getLastSeasonYear = (date = new Date()) => getCurrentSeasonYear(date) - 1;

const getProjectedSeasonYear = (date = new Date()) => date.getFullYear();

const hasValue = (value) =>
  value !== undefined && value !== null && `${value}`.trim() !== "";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || !hasValue(value) ? fallback : parsed;
};

const getFirstValue = (...values) => values.find(hasValue);

const formatCurrency = (value) => `$${Math.round(toNumber(value))}`;

const formatPercent = (value) => `${Math.round(toNumber(value))}%`;

const normalizeAllocationRules = (rules) => {
  const existingRules = Array.isArray(rules) ? rules : [];

  return defaultAllocationRules.map((defaultRule) => {
    const existingRule = existingRules.find(
      (rule) => rule.position === defaultRule.position
    );

    return {
      ...defaultRule,
      ...(existingRule ?? {}),
      minPercent: toNumber(existingRule?.minPercent, defaultRule.minPercent),
      maxPercent: toNumber(existingRule?.maxPercent, defaultRule.maxPercent),
    };
  });
};

const getStatValue = (stats, ...paths) => {
  const value = paths
    .map((path) =>
      path.split(".").reduce((currentValue, pathPart) => {
        if (currentValue === undefined || currentValue === null) return undefined;
        return currentValue[pathPart];
      }, stats)
    )
    .find(hasValue);

  return hasValue(value) ? value : "-";
};

const getSortableNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || !hasValue(value)
    ? Number.MAX_SAFE_INTEGER
    : parsed;
};

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const normalizeRangeScore = (value, min, max) => {
  if (max <= min) return 80;
  return clampScore(((value - min) / (max - min)) * 100);
};

const getDDScoreLabel = (score) => {
  if (score >= 90) return "Elite Target";
  if (score >= 80) return "Strong Buy";
  if (score >= 70) return "Fair Value";
  if (score >= 60) return "Risky Value";
  return "Fade";
};

const getSleeperLabel = (score) => {
  if (score >= 90) return "Priority Sleeper";
  if (score >= 80) return "Strong Sleeper";
  if (score >= 70) return "Watchlist Sleeper";
  if (score >= 60) return "Deep Sleeper";
  return "Not A Sleeper";
};

const addUniqueTag = (tags, tag) => (tags.includes(tag) ? tags : [...tags, tag]);

const sortPlayersByRankThenTier = (players) =>
  [...players].sort((firstPlayer, secondPlayer) => {
    const rankDifference =
      getSortableNumber(firstPlayer.rank) - getSortableNumber(secondPlayer.rank);

    if (rankDifference !== 0) return rankDifference;

    const tierDifference =
      getSortableNumber(firstPlayer.tier) - getSortableNumber(secondPlayer.tier);

    if (tierDifference !== 0) return tierDifference;

    return firstPlayer.fullName.localeCompare(secondPlayer.fullName);
  });

const isRookiePlayer = (player) => {
  const currentSeason = getProjectedSeasonYear();
  const yearsExperience = toNumber(
    player.yearsExp ?? player.YearsExperience ?? player.years_exp,
    null
  );
  const rookieYear = toNumber(player.rookieYear ?? player.rookie_year, null);
  const draftYear = toNumber(player.draftYear ?? player.draft_year, null);

  return (
    yearsExperience === 0 ||
    rookieYear === currentSeason ||
    draftYear === currentSeason
  );
};

const normalizePlayer = (playerDoc) => {
  const data = playerDoc.data();

  return {
    id: playerDoc.id,
    sleeperId: data.SleeperID ?? data.sleeperId ?? playerDoc.id,
    fullName: data.fullName ?? data.FullName ?? "",
    nflTeam: data.nflTeam ?? data.Team ?? "",
    position: data.position ?? data.Position ?? "",
    depthChartOrder:
      data.depthChartOrder ?? data.depth_chart_order ?? data.DepthChartOrder ?? "",
    age: data.age ?? data.Age ?? "",
    yearsExp: data.yearsExp ?? data.years_exp ?? data.YearsExperience ?? "",
    rookieYear: data.rookieYear ?? data.rookie_year ?? data.RookieYear ?? "",
    draftYear: data.draftYear ?? data.draft_year ?? data.DraftYear ?? "",
  };
};

const addProjectedStatsToPlayer = async (player) => {
  const projectedStatsSnap = await getDoc(
    doc(db, "players", player.id, "projectedStats", `${getProjectedSeasonYear()}`)
  );
  const projectedStats = projectedStatsSnap.exists() ? projectedStatsSnap.data() : {};

  return {
    ...player,
    rank: getFirstValue(projectedStats.rank, projectedStats.overall_rank, ""),
    positionRank: getFirstValue(
      projectedStats.position_rank,
      projectedStats.positionRank,
      projectedStats.rank,
      ""
    ),
    tier: projectedStats.tier ?? "",
    projectedPoints: getFirstValue(
      projectedStats.projected_points,
      projectedStats.ProjectedPoints,
      projectedStats.projectedPoints,
      0
    ),
    auctionValue: getFirstValue(
      projectedStats.auction_value,
      projectedStats["Auction Value"],
      0
    ),
    maxBid: getFirstValue(projectedStats.max_bid, projectedStats["Max Bid"], 0),
    hardMax: getFirstValue(
      projectedStats.hard_max_bid,
      projectedStats["Hard Max Bid"],
      0
    ),
    passingAttempts: getFirstValue(
      projectedStats.pass_attempts,
      projectedStats.passing_attempts,
      projectedStats.PassingAttempts,
      projectedStats.PassingAtt,
      0
    ),
    rushingAttempts: getFirstValue(
      projectedStats.rush_attempts,
      projectedStats.rushing_attempts,
      projectedStats.RushingAttempts,
      projectedStats.TotalCarries,
      0
    ),
    rushingYards: getFirstValue(
      projectedStats.rush_yards,
      projectedStats.rushing_yards,
      projectedStats.RushingYDS,
      0
    ),
    gamesStarted: getFirstValue(
      projectedStats.games_started,
      projectedStats.GamesStarted,
      projectedStats.starts,
      0
    ),
    targets: getFirstValue(
      projectedStats.targets,
      projectedStats.ReceivingTargets,
      projectedStats.receiving_targets,
      0
    ),
    snapShare: getFirstValue(
      projectedStats.snap_share,
      projectedStats.SnapShare,
      projectedStats.snapShare,
      0
    ),
    routeParticipation: getFirstValue(
      projectedStats.route_participation,
      projectedStats.RouteParticipation,
      projectedStats.routeParticipation,
      0
    ),
    redZoneTargets: getFirstValue(
      projectedStats.red_zone_targets,
      projectedStats.RedzoneTargets,
      projectedStats.RedZoneTargets,
      0
    ),
  };
};

const addLastSeasonStatsToPlayer = async (player) => {
  const lastSeasonYear = getLastSeasonYear();
  const seasonStatsSnap = await getDoc(
    doc(db, "players", player.id, "seasonStats", `${lastSeasonYear}`)
  );
  const seasonStats = seasonStatsSnap.exists() ? seasonStatsSnap.data() : {};

  return {
    ...player,
    selectedSeason: lastSeasonYear,
    seasonStats: {
      ...seasonStats,
      ...(seasonStats.stats ?? {}),
    },
  };
};

const getTargetPlayerSeasonSections = (position, season) => {
  if (position === "QB") {
    return [
      {
        title: "Passing",
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
        title: "Rushing",
        columns: 2,
        fields: [
          { label: "Rush Yds", paths: ["rushingYards"] },
          { label: "Rush TD", paths: ["rushingTDs"] },
        ],
      },
      {
        title: "Fantasy Summary",
        columns: 3,
        fields: [
          { label: "Games", paths: ["games"] },
          { label: "Fantasy Pts", paths: ["fantasyPoints"] },
          { label: "PPR", paths: ["fantasyPointsPpr"] },
        ],
      },
    ];
  }

  if (position === "RB") {
    return [
      {
        title: "Rushing",
        columns: 3,
        fields: [
          { label: "Carries", paths: ["rushingAttempts"] },
          { label: "Rush Yds", paths: ["rushingYards"] },
          { label: "Rush TD", paths: ["rushingTDs"] },
        ],
      },
      {
        title: "Receiving",
        columns: 2,
        fields: [
          { label: "Targets", paths: ["targets"] },
          { label: "Rec", paths: ["receptions"] },
          { label: "Rec Yds", paths: ["receivingYards"] },
          { label: "Rec TD", paths: ["receivingTDs"] },
        ],
      },
      {
        title: "Fantasy Summary",
        columns: 3,
        fields: [
          { label: "Games", paths: ["games"] },
          { label: "Fantasy Pts", paths: ["fantasyPoints"] },
          { label: "PPR", paths: ["fantasyPointsPpr"] },
        ],
      },
    ];
  }

  return [
    {
      title: "Receiving",
      columns: 2,
      fields: [
        { label: "Targets", paths: ["targets"] },
        { label: "Rec", paths: ["receptions"] },
        { label: "Rec Yds", paths: ["receivingYards"] },
        { label: "Rec TD", paths: ["receivingTDs"] },
      ],
    },
    {
      title: "Rushing",
      columns: 2,
      fields: [
        { label: "Rush Yds", paths: ["rushingYards"] },
        { label: "Rush TD", paths: ["rushingTDs"] },
      ],
    },
    {
      title: "Fantasy Summary",
      columns: 3,
      fields: [
        { label: "Games", paths: ["games"] },
        { label: "Fantasy Pts", paths: ["fantasyPoints"] },
        { label: "PPR", paths: ["fantasyPointsPpr"] },
      ],
    },
  ];
};

const buildAuctionRecommendation = (player) => {
  const auctionValue = toNumber(player.auctionValue);
  const maxBid = toNumber(player.maxBid, auctionValue);
  const hardMax = toNumber(player.hardMax, maxBid);
  const valueGap = maxBid - auctionValue;
  let label = "Fair Value";
  let valueTag = "Fair Value";

  if (valueGap >= 8) {
    label = "Target Aggressively";
    valueTag = "Underpriced";
  } else if (valueGap >= 3) {
    label = "Good Value";
    valueTag = "Underpriced";
  } else if (valueGap <= -8) {
    label = "Avoid";
    valueTag = "Overpriced";
  } else if (valueGap <= -3) {
    label = "Overpriced";
    valueTag = "Overpriced";
  }

  return {
    recommendation: {
      label,
      recommendedRange: `${formatCurrency(Math.max(0, auctionValue - 3))}-${formatCurrency(
        maxBid || auctionValue
      )}`,
      hardStop: Math.max(hardMax, maxBid, auctionValue),
    },
    valueTag,
  };
};

const buildTierCliff = (player, positionPlayers) => {
  const sameTierPlayers = positionPlayers.filter(
    (positionPlayer) => `${positionPlayer.tier}` === `${player.tier}`
  );
  const currentTierIndex = sameTierPlayers.findIndex(
    (positionPlayer) => positionPlayer.id === player.id
  );
  const playersLeftInTier =
    currentTierIndex === -1
      ? sameTierPlayers.length
      : sameTierPlayers.length - currentTierIndex;
  const nextTierPlayer = positionPlayers.find(
    (positionPlayer) => toNumber(positionPlayer.tier) > toNumber(player.tier)
  );
  const nextTierDrop = nextTierPlayer
    ? Math.max(
        0,
        toNumber(player.projectedPoints) - toNumber(nextTierPlayer.projectedPoints)
      )
    : 0;

  return {
    isCliff: playersLeftInTier <= 3,
    playersLeftInTier,
    nextTierDrop: Number(nextTierDrop.toFixed(1)),
  };
};

const getProjectedPointsRank = (player, positionPlayers) => {
  const projectedRankings = [...positionPlayers].sort(
    (firstPlayer, secondPlayer) =>
      toNumber(secondPlayer.projectedPoints) - toNumber(firstPlayer.projectedPoints)
  );

  const projectedIndex = projectedRankings.findIndex(
    (positionPlayer) => positionPlayer.id === player.id
  );

  return projectedIndex === -1 ? toNumber(player.positionRank) : projectedIndex + 1;
};

const buildOpportunityValue = (player) => {
  if (player.position === "QB") {
    return (
      toNumber(player.passingAttempts) * 0.35 +
      toNumber(player.rushingAttempts) * 1.2 +
      toNumber(player.rushingYards) * 0.08 +
      toNumber(player.gamesStarted) * 8
    );
  }

  if (player.position === "RB") {
    return (
      toNumber(player.rushingAttempts) * 1.1 +
      toNumber(player.targets) * 1.4 +
      toNumber(player.snapShare) * 0.8
    );
  }

  if (player.position === "WR") {
    return (
      toNumber(player.targets) * 1.3 +
      toNumber(player.routeParticipation) * 0.8 +
      toNumber(player.redZoneTargets) * 2
    );
  }

  if (player.position === "TE") {
    return (
      toNumber(player.targets) * 1.4 +
      toNumber(player.routeParticipation) * 0.9 +
      toNumber(player.redZoneTargets) * 2
    );
  }

  return 0;
};

const buildSleeperScore = (player, positionPlayers, tierCliff) => {
  const projectedRank = getProjectedPointsRank(player, positionPlayers);
  const rankGap = toNumber(player.positionRank) - projectedRank;
  const rankGapScore = clampScore((rankGap + 5) * 6.67);
  const nearbyRankPlayers = positionPlayers.filter(
    (positionPlayer) =>
      Math.abs(toNumber(positionPlayer.positionRank) - toNumber(player.positionRank)) <=
      3
  );
  const expectedCostPlayers =
    nearbyRankPlayers.length > 0 ? nearbyRankPlayers : positionPlayers;
  const expectedCost =
    expectedCostPlayers.reduce(
      (total, positionPlayer) => total + toNumber(positionPlayer.auctionValue),
      0
    ) / Math.max(expectedCostPlayers.length, 1);
  const auctionDiscount = expectedCost - toNumber(player.auctionValue);
  const auctionDiscountScore = clampScore((auctionDiscount + 8) * 5);
  const sameTierPlayers = positionPlayers.filter(
    (positionPlayer) => `${positionPlayer.tier}` === `${player.tier}`
  );
  const sameTierAverageAuction =
    sameTierPlayers.reduce(
      (total, positionPlayer) => total + toNumber(positionPlayer.auctionValue),
      0
    ) / Math.max(sameTierPlayers.length, 1);
  const tierPositionIndex = sameTierPlayers.findIndex(
    (positionPlayer) => positionPlayer.id === player.id
  );
  const topOfTierScore =
    tierPositionIndex === -1
      ? 40
      : clampScore(100 - (tierPositionIndex / Math.max(sameTierPlayers.length, 1)) * 100);
  const sameTierDiscountScore = clampScore(
    (sameTierAverageAuction - toNumber(player.auctionValue) + 8) * 5
  );
  const tierCliffScore = tierCliff.isCliff ? 90 : 45;
  const tierValueScore = clampScore(
    topOfTierScore * 0.35 + sameTierDiscountScore * 0.35 + tierCliffScore * 0.3
  );
  const opportunityValues = positionPlayers.map(buildOpportunityValue);
  const opportunityScore = normalizeRangeScore(
    buildOpportunityValue(player),
    Math.min(...opportunityValues),
    Math.max(...opportunityValues)
  );
  const upsideRange =
    toNumber(player.hardMax) - toNumber(player.auctionValue) +
    Math.max(0, toNumber(player.maxBid) - toNumber(player.auctionValue));
  const upsideScore = clampScore(upsideRange * 5);
  const elitePenalty =
    toNumber(player.tier) <= 2 && toNumber(player.auctionValue) >= 25 ? 20 : 0;
  const sleeperScore = clampScore(
    rankGapScore * 0.35 +
      auctionDiscountScore * 0.25 +
      tierValueScore * 0.15 +
      opportunityScore * 0.15 +
      upsideScore * 0.1 -
      elitePenalty
  );

  return {
    sleeperScore,
    sleeperLabel: getSleeperLabel(sleeperScore),
    isSleeper: sleeperScore >= 80,
  };
};

const buildTargetedPlayer = (player, positionPlayers) => {
  const rankScore = clampScore(100 - (toNumber(player.rank) - 1) * 1.5);
  const tierScore = clampScore(100 - (toNumber(player.tier) - 1) * 14);
  const projectedPointValues = positionPlayers.map((item) =>
    toNumber(item.projectedPoints)
  );
  const auctionValues = positionPlayers.map((item) => toNumber(item.auctionValue));
  const projectedPointsScore = normalizeRangeScore(
    toNumber(player.projectedPoints),
    Math.min(...projectedPointValues),
    Math.max(...projectedPointValues)
  );
  const auctionValueScore = normalizeRangeScore(
    toNumber(player.auctionValue),
    Math.min(...auctionValues),
    Math.max(...auctionValues)
  );
  const scarcityScore = clampScore(100 - (toNumber(player.positionRank) - 1) * 4);
  const ddScore = clampScore(
    rankScore * 0.25 +
      tierScore * 0.25 +
      projectedPointsScore * 0.2 +
      auctionValueScore * 0.2 +
      scarcityScore * 0.1
  );
  const tierCliff = buildTierCliff(player, positionPlayers);
  const { recommendation, valueTag } = buildAuctionRecommendation(player);
  const sleeper = buildSleeperScore(player, positionPlayers, tierCliff);
  let systemTags = [valueTag];

  if (tierCliff.isCliff) {
    systemTags = addUniqueTag(systemTags, "Tier Cliff");
  }

  if (sleeper.sleeperScore >= 80) {
    systemTags = addUniqueTag(systemTags, "Sleeper");
  }

  if (sleeper.sleeperScore >= 90) {
    systemTags = addUniqueTag(systemTags, "Priority Sleeper");
  }

  return {
    playerId: player.id,
    sleeperId: player.sleeperId ?? player.id,
    name: player.fullName,
    position: player.position,
    team: player.nflTeam,
    rank: toNumber(player.rank),
    positionRank: toNumber(player.positionRank),
    tier: toNumber(player.tier),
    projectedPoints: toNumber(player.projectedPoints),
    auctionValue: toNumber(player.auctionValue),
    maxBid: toNumber(player.maxBid),
    hardMaxBid: toNumber(player.hardMax),
    ddScore,
    ddScoreLabel: getDDScoreLabel(ddScore),
    sleeperScore: sleeper.sleeperScore,
    sleeperLabel: sleeper.sleeperLabel,
    isSleeper: sleeper.isSleeper,
    tierCliff,
    auctionRecommendation: recommendation,
    systemTags,
    userTags: [],
    watchlist: false,
    systemNotes: "",
    recommendationNotes: "",
    userNotes: "",
  };
};

const getBuildPlayerCost = (player) =>
  hasValue(player.purchasePrice) ? toNumber(player.purchasePrice) : toNumber(player.auctionValue);

const getPlayerSurplus = (player) => {
  const maxBid = toNumber(player.maxBid || player.hardMaxBid, toNumber(player.auctionValue));

  return maxBid - toNumber(player.auctionValue);
};

const getPlayerValueEfficiencyScore = (player) => {
  const auctionValue = Math.max(toNumber(player.auctionValue), 1);
  const valuePerDollar = (toNumber(player.ddScore) + toNumber(player.sleeperScore) * 0.6) / auctionValue;

  return clampScore(45 + getPlayerSurplus(player) * 4 + valuePerDollar * 6);
};

const getStackCandidateScore = (player) =>
  getPlayerValueEfficiencyScore(player) +
  (player.watchlist ? 18 : 0) +
  toNumber(player.ddScore) * 0.12 +
  toNumber(player.sleeperScore) * 0.08;

const getAllocationFitScore = (totalCost, minBudget, maxBudget) => {
  if (totalCost >= minBudget && totalCost <= maxBudget) return 100;

  const targetMidpoint = (minBudget + maxBudget) / 2;
  const targetSpan = Math.max(maxBudget - minBudget, 1);
  const distance = totalCost < minBudget ? minBudget - totalCost : totalCost - maxBudget;

  return clampScore(100 - (distance / Math.max(targetSpan, targetMidpoint * 0.25, 1)) * 100);
};

const getBuildStatus = (totalCost, minBudget, maxBudget) => {
  if (totalCost < minBudget) return "Below Target";
  if (totalCost > maxBudget) return "Above Target";
  return "On Target";
};

const getBuildType = (players, totalCost, minBudget, maxBudget) => {
  const costs = players.map(getBuildPlayerCost);
  const tiers = players.map((player) => toNumber(player.tier, 9));
  const averageSleeper =
    players.reduce((total, player) => total + toNumber(player.sleeperScore), 0) /
    Math.max(players.length, 1);
  const averageEfficiency =
    players.reduce((total, player) => total + getPlayerValueEfficiencyScore(player), 0) /
    Math.max(players.length, 1);
  const hasElite = players.some(
    (player) => toNumber(player.tier, 9) <= 2 || getBuildPlayerCost(player) >= 45
  );
  const hasCheapValue = players.some((player) => getBuildPlayerCost(player) <= 8);
  const costSpread = Math.max(...costs) - Math.min(...costs);
  const tierSpread = Math.max(...tiers) - Math.min(...tiers);
  const midpoint = (minBudget + maxBudget) / 2;

  if (hasElite && hasCheapValue) return "Stars + Value";
  if (averageSleeper >= 82) return "Upside";
  if (totalCost > maxBudget || totalCost >= midpoint + Math.max(6, (maxBudget - minBudget) * 0.25)) {
    return "Aggressive";
  }
  if (totalCost < minBudget || totalCost <= midpoint - Math.max(6, (maxBudget - minBudget) * 0.25)) {
    return "Conservative";
  }
  if (averageEfficiency >= 76) return "Value";
  if (costSpread <= 18 && tierSpread <= 2) return "Balanced";

  return "Balanced";
};

const buildStackExplanation = (position, players, totalCost, minBudget, maxBudget) => {
  const ownedPlayers = players.filter((player) => hasValue(player.leagueTeam));
  const wishlistPlayers = players.filter((player) => player.watchlist);
  const elitePlayer = players.find(
    (player) => toNumber(player.tier, 9) <= 2 || getBuildPlayerCost(player) >= 45
  );
  const valuePlayer = [...players]
    .filter((player) => getPlayerSurplus(player) > 0)
    .sort((firstPlayer, secondPlayer) => getPlayerSurplus(secondPlayer) - getPlayerSurplus(firstPlayer))[0];
  const sleeperPlayer = [...players].sort(
    (firstPlayer, secondPlayer) =>
      toNumber(secondPlayer.sleeperScore) - toNumber(firstPlayer.sleeperScore)
  )[0];
  const cheapPlayer = [...players]
    .filter((player) => getBuildPlayerCost(player) <= 8)
    .sort(
      (firstPlayer, secondPlayer) =>
        toNumber(secondPlayer.ddScore) + toNumber(secondPlayer.sleeperScore) -
        (toNumber(firstPlayer.ddScore) + toNumber(firstPlayer.sleeperScore))
    )[0];
  const notes = [];

  if (ownedPlayers.length > 0) {
    notes.push(`Locks in ${ownedPlayers.length} owned ${position} at known auction cost.`);
  }

  if (wishlistPlayers.length > 0) {
    notes.push(`Includes ${wishlistPlayers.length} wishlisted target${wishlistPlayers.length === 1 ? "" : "s"} you marked as a priority.`);
  }

  if (elitePlayer) {
    notes.push(`Creates an elite ${position} foundation with ${elitePlayer.name}.`);
  }

  if (valuePlayer) {
    notes.push(`${valuePlayer.name} adds positive auction surplus against max bid.`);
  }

  if (sleeperPlayer && toNumber(sleeperPlayer.sleeperScore) >= 80) {
    notes.push(`${sleeperPlayer.name} raises the upside profile with a strong Sleeper Score.`);
  }

  if (cheapPlayer) {
    notes.push(`${cheapPlayer.name} gives cheap depth with upside.`);
  }

  notes.push(
    totalCost >= minBudget && totalCost <= maxBudget
      ? "Fits inside the allocation range while protecting roster balance."
      : "Sits near the allocation target because the score profile is strong enough to consider."
  );

  return [...new Set(notes)].slice(0, 4);
};

const buildPositionStackBuilds = ({
  allocationRules,
  leagueTeams,
  leagueBudget,
  position,
  targetBoardPlayers,
}) => {
  if (!["RB", "WR"].includes(position)) return [];

  const slotCount = comboSlotCounts[position];
  const allocationRule =
    allocationRules.find((rule) => rule.position === position) ??
    defaultAllocationRules.find((rule) => rule.position === position);
  const minBudget = (toNumber(leagueBudget) * toNumber(allocationRule?.minPercent)) / 100;
  const maxBudget = (toNumber(leagueBudget) * toNumber(allocationRule?.maxPercent)) / 100;
  const positionPlayers = targetBoardPlayers.filter(
    (player) => player.position === position
  );
  const myTeamNumbers = leagueTeams
    .filter((team) => team.MyTeam)
    .map((team) => `${team.TeamNumber}`);
  const isMyTeamPlayer = (player) =>
    hasValue(player.leagueTeam) &&
    (myTeamNumbers.length === 0 ||
      myTeamNumbers.includes(`${player.leagueTeamNumber}`));
  const isClaimedByOtherTeam = (player) =>
    hasValue(player.leagueTeam) && !isMyTeamPlayer(player);
  const availablePositionPlayers = positionPlayers.filter(
    (player) => !isClaimedByOtherTeam(player)
  );
  const ownedPlayers = availablePositionPlayers
    .filter((player) => hasValue(player.leagueTeam))
    .sort(
      (firstPlayer, secondPlayer) =>
        getSortableNumber(firstPlayer.positionRank || firstPlayer.rank) -
        getSortableNumber(secondPlayer.positionRank || secondPlayer.rank)
    );
  if (ownedPlayers.length > slotCount) return [];

  const lockedPlayers = ownedPlayers;
  const lockedIds = new Set(lockedPlayers.map((player) => player.playerId));
  const fillSlotCount = slotCount - lockedPlayers.length;

  if (fillSlotCount < 0) return [];

  const candidatePlayers = availablePositionPlayers
    .filter((player) => {
      const auctionValue = toNumber(player.auctionValue);
      const hardMaxBid = toNumber(player.hardMaxBid);

      return (
        !lockedIds.has(player.playerId) &&
        !hasValue(player.leagueTeam) &&
        (hardMaxBid <= 0 || auctionValue <= hardMaxBid)
      );
    })
    .sort(
      (firstPlayer, secondPlayer) =>
        getStackCandidateScore(secondPlayer) - getStackCandidateScore(firstPlayer) ||
        toNumber(secondPlayer.ddScore) - toNumber(firstPlayer.ddScore)
    )
    .slice(0, 24);
  const playerCombinations = [];

  const collectCombinations = (startIndex, currentCombination) => {
    if (currentCombination.length === fillSlotCount) {
      playerCombinations.push(currentCombination);
      return;
    }

    for (
      let index = startIndex;
      index <= candidatePlayers.length - (fillSlotCount - currentCombination.length);
      index += 1
    ) {
      collectCombinations(index + 1, [...currentCombination, candidatePlayers[index]]);
    }
  };

  if (fillSlotCount === 0) {
    playerCombinations.push([]);
  } else {
    collectCombinations(0, []);
  }

  const seenBuildKeys = new Set();

  return playerCombinations
    .map((combination) => {
      const players = [...lockedPlayers, ...combination].sort(
        (firstPlayer, secondPlayer) =>
          getSortableNumber(firstPlayer.positionRank || firstPlayer.rank) -
            getSortableNumber(secondPlayer.positionRank || secondPlayer.rank) ||
          getBuildPlayerCost(secondPlayer) - getBuildPlayerCost(firstPlayer)
      );
      const buildKey = players
        .map((player) => player.playerId)
        .sort()
        .join("-");

      if (seenBuildKeys.has(buildKey)) return null;
      seenBuildKeys.add(buildKey);

      const totalCost = players.reduce(
        (total, player) => total + getBuildPlayerCost(player),
        0
      );
      const averageEfficiency =
        players.reduce((total, player) => total + getPlayerValueEfficiencyScore(player), 0) /
        Math.max(players.length, 1);
      const allocationScore = getAllocationFitScore(totalCost, minBudget, maxBudget);
      const auctionEfficiencyScore = clampScore(averageEfficiency * 0.65 + allocationScore * 0.35);
      const tierStrengthScore = clampScore(
        players.reduce(
          (total, player) => total + (100 - Math.max(toNumber(player.tier, 6) - 1, 0) * 14),
          0
        ) / Math.max(players.length, 1)
      );
      const ddScoreAverage =
        players.reduce((total, player) => total + toNumber(player.ddScore), 0) /
        Math.max(players.length, 1);
      const sleeperScoreAverage =
        players.reduce((total, player) => total + toNumber(player.sleeperScore), 0) /
        Math.max(players.length, 1);
      const wishlistCount = players.filter((player) => player.watchlist).length;
      const wishlistScoreBoost = Math.min(wishlistCount * 4, 10);
      const score = clampScore(
        auctionEfficiencyScore * 0.35 +
          tierStrengthScore * 0.25 +
          ddScoreAverage * 0.25 +
          sleeperScoreAverage * 0.15 +
          wishlistScoreBoost
      );

      return {
        allocationRange: `${formatCurrency(minBudget)}-${formatCurrency(maxBudget)}`,
        buildType: getBuildType(players, totalCost, minBudget, maxBudget),
        explanations: buildStackExplanation(position, players, totalCost, minBudget, maxBudget),
        maxBudget,
        minBudget,
        players,
        score,
        status: getBuildStatus(totalCost, minBudget, maxBudget),
        totalCost,
      };
    })
    .filter(Boolean)
    .sort((firstBuild, secondBuild) => secondBuild.score - firstBuild.score)
    .slice(0, 20);
};

const Scouting = ({
  lockedPosition = "",
  pageTitle = "Scouting",
  showPositionFilters = true,
  playerListInModal = false,
  showTargetFilterCard = true,
}) => {
  const { currentUser } = useAuth();
  const { currentColor } = useStateContext();
  const [selectedPosition, setSelectedPosition] = useState(lockedPosition);
  const [selectedTier, setSelectedTier] = useState("All");
  const [targetPosition, setTargetPosition] = useState(
    showTargetFilterCard ? "" : lockedPosition
  );
  const [targetTier, setTargetTier] = useState("All");
  const [targetRank, setTargetRank] = useState("All");
  const [targetSearchTerm, setTargetSearchTerm] = useState("");
  const [targetSleeperFilter, setTargetSleeperFilter] = useState("All");
  const [targetSortBy, setTargetSortBy] = useState("ddScore");
  const [targetPage, setTargetPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [stackBuildPage, setStackBuildPage] = useState(1);
  const [budgetStrategyPages, setBudgetStrategyPages] = useState({});
  const [selectablePlayerPage, setSelectablePlayerPage] = useState(1);
  const [playerData, setPlayerData] = useState([]);
  const [targetBoardPlayers, setTargetBoardPlayers] = useState([]);
  const [leagueTeams, setLeagueTeams] = useState([]);
  const [leagueBudget, setLeagueBudget] = useState(200);
  const [allocationRules, setAllocationRules] = useState(defaultAllocationRules);
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState(null);
  const [teamTargetPlayer, setTeamTargetPlayer] = useState(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [playerSearchTerm, setPlayerSearchTerm] = useState("");
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isTargetActionModalOpen, setIsTargetActionModalOpen] = useState(false);
  const [isAddToTeamModalOpen, setIsAddToTeamModalOpen] = useState(false);
  const [selectedLeagueTeamNumber, setSelectedLeagueTeamNumber] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [targetPlayerStatsLoading, setTargetPlayerStatsLoading] = useState(false);
  const [watchlistSavingPlayerId, setWatchlistSavingPlayerId] = useState("");
  const [teamSavingPlayerId, setTeamSavingPlayerId] = useState("");
  const [removingTargetPlayerId, setRemovingTargetPlayerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [processingTotal, setProcessingTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedFilter = positionFilters.find(
    (position) => position.value === selectedPosition
  );
  const selectedCount = selectedPlayerIds.length;
  const selectedPlayerSet = useMemo(
    () => new Set(selectedPlayerIds),
    [selectedPlayerIds]
  );
  const filteredPlayerData = useMemo(
    () =>
      playerData.filter((player) => {
        const playerTier = toNumber(player.tier, null);
        const searchTerm = playerSearchTerm.toLowerCase().trim();
        const matchesSearch =
          searchTerm === "" || player.fullName.toLowerCase().includes(searchTerm);

        return (
          matchesSearch &&
          (selectedTier === "All" ||
            (selectedTier === "6+" && playerTier >= 6) ||
            playerTier === Number(selectedTier))
        );
      }),
    [playerData, playerSearchTerm, selectedTier]
  );
  const selectablePlayerPageCount = Math.max(
    1,
    Math.ceil(filteredPlayerData.length / SELECTABLE_PLAYER_PAGE_SIZE)
  );
  const selectablePlayerPageItems = useMemo(() => {
    const startIndex =
      (selectablePlayerPage - 1) * SELECTABLE_PLAYER_PAGE_SIZE;

    return filteredPlayerData.slice(
      startIndex,
      startIndex + SELECTABLE_PLAYER_PAGE_SIZE
    );
  }, [filteredPlayerData, selectablePlayerPage]);
  const filteredTargetBoardPlayers = useMemo(
    () => {
      const filteredPlayers = targetBoardPlayers.filter((player) => {
        const playerTier = toNumber(player.tier, null);
        const rawPlayerRank = player.positionRank || player.rank;
        const playerRank = toNumber(rawPlayerRank, null);
        const searchTerm = targetSearchTerm.toLowerCase().trim();
        const matchesPosition =
          targetPosition === "" || player.position === targetPosition;
        const matchesTier =
          targetTier === "All" ||
          (targetTier === "6+" && playerTier >= 6) ||
          playerTier === Number(targetTier);
        const matchesRank =
          targetRank === "All" ||
          (hasValue(rawPlayerRank) &&
            ((targetRank === "21+" && playerRank >= 21) ||
              playerRank <= Number(targetRank)));
        const matchesSearch =
          searchTerm === "" ||
          `${player.name ?? ""}`.toLowerCase().includes(searchTerm);
        const matchesSleeper =
          targetSleeperFilter === "All" || toNumber(player.sleeperScore) >= 80;

        return matchesPosition && matchesTier && matchesRank && matchesSearch && matchesSleeper;
      });

      return [...filteredPlayers].sort((firstPlayer, secondPlayer) => {
        if (targetSortBy === "tier" || targetSortBy === "positionRank") {
          return (
            getSortableNumber(firstPlayer[targetSortBy]) -
              getSortableNumber(secondPlayer[targetSortBy]) ||
            getSortableNumber(secondPlayer.ddScore) -
              getSortableNumber(firstPlayer.ddScore)
          );
        }

        return (
          getSortableNumber(secondPlayer[targetSortBy]) -
            getSortableNumber(firstPlayer[targetSortBy]) ||
          getSortableNumber(firstPlayer.positionRank) -
            getSortableNumber(secondPlayer.positionRank)
        );
      });
    },
    [
      targetBoardPlayers,
      targetPosition,
      targetRank,
      targetSearchTerm,
      targetSleeperFilter,
      targetSortBy,
      targetTier,
    ]
  );
  const targetBoardPageCount = Math.max(
    1,
    Math.ceil(filteredTargetBoardPlayers.length / TARGET_BOARD_PAGE_SIZE)
  );
  const targetBoardPageItems = useMemo(() => {
    const startIndex = (targetPage - 1) * TARGET_BOARD_PAGE_SIZE;

    return filteredTargetBoardPlayers.slice(
      startIndex,
      startIndex + TARGET_BOARD_PAGE_SIZE
    );
  }, [filteredTargetBoardPlayers, targetPage]);
  const wishlistPlayers = useMemo(
    () =>
      targetBoardPlayers
        .filter(
          (player) =>
            Boolean(player.watchlist) &&
            (!lockedPosition || player.position === lockedPosition)
        )
        .sort(
          (firstPlayer, secondPlayer) =>
            getSortableNumber(firstPlayer.positionRank || firstPlayer.rank) -
              getSortableNumber(secondPlayer.positionRank || secondPlayer.rank) ||
            getSortableNumber(secondPlayer.ddScore) -
              getSortableNumber(firstPlayer.ddScore)
        ),
    [lockedPosition, targetBoardPlayers]
  );
  const wishlistPageCount = Math.max(
    1,
    Math.ceil(wishlistPlayers.length / WISHLIST_PAGE_SIZE)
  );
  const wishlistPageItems = useMemo(() => {
    const startIndex = (wishlistPage - 1) * WISHLIST_PAGE_SIZE;

    return wishlistPlayers.slice(startIndex, startIndex + WISHLIST_PAGE_SIZE);
  }, [wishlistPage, wishlistPlayers]);
  const budgetStrategy = useMemo(() => {
    if (!["QB", "RB", "WR", "TE"].includes(lockedPosition)) return null;

    const strategyCopy = budgetStrategyText[lockedPosition];
    const allocationRule =
      allocationRules.find((rule) => rule.position === lockedPosition) ??
      defaultAllocationRules.find((rule) => rule.position === lockedPosition);
    const minBudget =
      (toNumber(leagueBudget) * toNumber(allocationRule?.minPercent)) / 100;
    const maxBudget =
      (toNumber(leagueBudget) * toNumber(allocationRule?.maxPercent)) / 100;
    const midpointBudget = (minBudget + maxBudget) / 2 || 1;
    const strategyPlayers = targetBoardPlayers.filter(
      (player) => player.position === lockedPosition
    );
    const withValueScores = (players) =>
      players.map((player) => ({
        ...player,
        valueScore: toNumber(player.ddScore) - toNumber(player.auctionValue),
        budgetPercent: (toNumber(player.auctionValue) / midpointBudget) * 100,
      }));
    const sortByPositionRank = (players) =>
      players.sort(
        (firstPlayer, secondPlayer) =>
          getSortableNumber(firstPlayer.positionRank || firstPlayer.rank) -
            getSortableNumber(secondPlayer.positionRank || secondPlayer.rank) ||
          getSortableNumber(firstPlayer.rank) - getSortableNumber(secondPlayer.rank) ||
          firstPlayer.name.localeCompare(secondPlayer.name)
      );

    const categories = [
      {
        key: "elite",
        title: strategyCopy.eliteTitle,
        description: strategyCopy.eliteDescription,
        players: withValueScores(
          sortByPositionRank(
            strategyPlayers.filter((player) => toNumber(player.auctionValue) >= 45)
          )
        ),
      },
      {
        key: "foundation",
        title: "🎯 Foundation Pieces",
        description: strategyCopy.foundationDescription,
        players: withValueScores(
          sortByPositionRank(
            strategyPlayers.filter((player) => {
              const auctionValue = toNumber(player.auctionValue);
              return auctionValue >= 20 && auctionValue <= 44;
            })
          )
        ),
      },
      {
        key: "value",
        title: "💰 Value Targets",
        description: strategyCopy.valueDescription,
        players: withValueScores(
          sortByPositionRank(
            strategyPlayers.filter((player) => {
              const auctionValue = toNumber(player.auctionValue);
              return auctionValue >= 8 && auctionValue <= 19;
            })
          )
        ),
      },
      {
        key: "sleepers",
        title: "🚀 Sleepers & Upside",
        description: strategyCopy.sleeperDescription,
        players: withValueScores(
          sortByPositionRank(
            strategyPlayers.filter((player) => toNumber(player.auctionValue) < 8)
          )
        ),
      },
    ];
    const combinedCost = strategyPlayers.reduce(
      (total, player) => total + toNumber(player.auctionValue),
      0
    );
    const averageCost =
      strategyPlayers.length > 0 ? combinedCost / strategyPlayers.length : 0;
    const status =
      combinedCost < minBudget
        ? { label: strategyCopy.underallocated, tone: "under" }
        : combinedCost > maxBudget
          ? { label: strategyCopy.overallocated, tone: "over" }
          : { label: strategyCopy.balanced, tone: "balanced" };

    return {
      categories,
      combinedCost,
      averageCost,
      maxBudget,
      minBudget,
      midpointBudget,
      playerCount: strategyPlayers.length,
      status,
      text: strategyCopy,
      wishlistCount: strategyPlayers.filter((player) => player.watchlist).length,
      allocationRule,
    };
  }, [allocationRules, leagueBudget, lockedPosition, targetBoardPlayers]);
  const positionStackBuilds = useMemo(
    () =>
      buildPositionStackBuilds({
        allocationRules,
        leagueTeams,
        leagueBudget,
        position: lockedPosition,
        targetBoardPlayers,
      }),
    [allocationRules, leagueBudget, leagueTeams, lockedPosition, targetBoardPlayers]
  );
  const stackBuildPageCount = Math.max(1, positionStackBuilds.length);
  const targetPaginationItems = useMemo(() => {
    if (targetBoardPageCount <= 5) {
      return Array.from({ length: targetBoardPageCount }, (_, index) => index + 1);
    }

    if (targetPage <= 3) {
      return [1, 2, 3, "ellipsis", targetBoardPageCount];
    }

    if (targetPage >= targetBoardPageCount - 2) {
      return [
        1,
        "ellipsis",
        targetBoardPageCount - 2,
        targetBoardPageCount - 1,
        targetBoardPageCount,
      ];
    }

    return [1, "ellipsis", targetPage, "ellipsis", targetBoardPageCount];
  }, [targetBoardPageCount, targetPage]);
  const wishlistPaginationItems = useMemo(() => {
    if (wishlistPageCount <= 5) {
      return Array.from({ length: wishlistPageCount }, (_, index) => index + 1);
    }

    if (wishlistPage <= 3) {
      return [1, 2, 3, "ellipsis", wishlistPageCount];
    }

    if (wishlistPage >= wishlistPageCount - 2) {
      return [
        1,
        "ellipsis",
        wishlistPageCount - 2,
        wishlistPageCount - 1,
        wishlistPageCount,
      ];
    }

    return [1, "ellipsis", wishlistPage, "ellipsis", wishlistPageCount];
  }, [wishlistPageCount, wishlistPage]);

  useEffect(() => {
    setSelectablePlayerPage(1);
  }, [playerSearchTerm, selectedPosition, selectedTier]);

  useEffect(() => {
    setSelectablePlayerPage((currentPage) =>
      Math.min(Math.max(currentPage, 1), selectablePlayerPageCount)
    );
  }, [selectablePlayerPageCount]);

  useEffect(() => {
    setTargetPage(1);
  }, [
    targetPosition,
    targetRank,
    targetSearchTerm,
    targetSleeperFilter,
    targetSortBy,
    targetTier,
  ]);

  useEffect(() => {
    setTargetPage((currentPage) =>
      Math.min(Math.max(currentPage, 1), targetBoardPageCount)
    );
  }, [targetBoardPageCount]);

  useEffect(() => {
    setWishlistPage((currentPage) =>
      Math.min(Math.max(currentPage, 1), wishlistPageCount)
    );
  }, [wishlistPageCount]);

  useEffect(() => {
    setStackBuildPage(1);
  }, [lockedPosition]);

  useEffect(() => {
    setStackBuildPage((currentPage) =>
      Math.min(Math.max(currentPage, 1), stackBuildPageCount)
    );
  }, [stackBuildPageCount]);

  useEffect(() => {
    setBudgetStrategyPages((currentPages) => {
      if (!budgetStrategy) return {};

      return budgetStrategy.categories.reduce((nextPages, category) => {
        const pageCount = Math.max(
          1,
          Math.ceil(category.players.length / BUDGET_STRATEGY_PAGE_SIZE)
        );
        const currentPage = currentPages[category.key] ?? 1;

        return {
          ...nextPages,
          [category.key]: Math.min(Math.max(currentPage, 1), pageCount),
        };
      }, {});
    });
  }, [budgetStrategy]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    const leagueSettingsRef = doc(
      db,
      "userprofile",
      currentUser.uid,
      "leaguesettings",
      "settings"
    );

    const unsubscribe = onSnapshot(
      leagueSettingsRef,
      (settingsDoc) => {
        const settingsTeams = settingsDoc.exists()
          ? settingsDoc.data().LeagueTeams
          : [];
        const settingsData = settingsDoc.exists() ? settingsDoc.data() : {};
        const normalizedTeams = Array.isArray(settingsTeams)
          ? settingsTeams
              .map((team, index) => ({
                MyTeam: team.MyTeam === true,
                TeamName: team.TeamName ?? "",
                TeamNumber: team.TeamNumber ?? index + 1,
              }))
              .filter((team) => team.TeamName.trim() !== "")
          : [];

        setLeagueTeams(normalizedTeams);
        setLeagueBudget(toNumber(settingsData.Budget, 200));
        setAllocationRules(normalizeAllocationRules(settingsData.AllocationRules));
      },
      (error) => {
        console.error("Error loading league teams:", error);
        setLeagueTeams([]);
        setLeagueBudget(200);
        setAllocationRules(defaultAllocationRules);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    const targetedPlayersRef = collection(
      db,
      "userprofile",
      currentUser.uid,
      "targetedPlayers"
    );

    const unsubscribe = onSnapshot(
      targetedPlayersRef,
      (querySnapshot) => {
        const targetedPlayers = querySnapshot.docs.map((targetDoc) => ({
          id: targetDoc.id,
          ...targetDoc.data(),
        }));

        setTargetBoardPlayers(
          targetedPlayers.sort(
            (firstPlayer, secondPlayer) =>
              getSortableNumber(secondPlayer.ddScore) -
                getSortableNumber(firstPlayer.ddScore) ||
              getSortableNumber(firstPlayer.rank) -
                getSortableNumber(secondPlayer.rank)
          )
        );
      },
      (error) => {
        console.error("Error loading target board:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!selectedPosition) {
      setPlayerData([]);
      setSelectedPlayerIds([]);
      setLoading(false);
      return undefined;
    }

    setPlayerData([]);
    setSelectedPlayerIds([]);
    setErrorMessage("");
    setLoading(true);

    const playersQuery = query(
      collection(db, "players"),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      async (querySnapshot) => {
        try {
          const players = await Promise.all(
            querySnapshot.docs.map(normalizePlayer).map(addProjectedStatsToPlayer)
          );
          const filteredPlayers = players.filter(
            (player) =>
              player.position === selectedPosition &&
              hasValue(player.rank) &&
              hasValue(player.tier)
          );

          setPlayerData(sortPlayersByRankThenTier(filteredPlayers));
          setLoading(false);
        } catch (error) {
          console.error("Error fetching scouting players:", error);
          setPlayerData([]);
          setErrorMessage("Unable to load players for this position.");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error loading scouting players:", error);
        setPlayerData([]);
        setErrorMessage("Unable to load players for this position.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedPosition]);

  const handlePositionSelect = (position) => {
    setSelectedPosition(lockedPosition || position);
  };

  const handleTierSelect = (event) => {
    setSelectedTier(event.target.value);
    setSelectedPlayerIds([]);
  };

  const handleTargetTierSelect = (event) => {
    setTargetTier(event.target.value);
  };

  const handleTargetRankSelect = (event) => {
    setTargetRank(event.target.value);
  };

  const handleTargetSleeperFilterSelect = (event) => {
    setTargetSleeperFilter(event.target.value);
  };

  const handleTargetSortSelect = (event) => {
    setTargetSortBy(event.target.value);
  };

  const handleTogglePlayer = (playerId) => {
    setSelectedPlayerIds((currentIds) =>
      currentIds.includes(playerId)
        ? currentIds.filter((id) => id !== playerId)
        : [...currentIds, playerId]
    );
  };

  const handleSelectAllPlayers = () => {
    setSelectedPlayerIds(filteredPlayerData.map((player) => player.id));
  };

  const handleSelectAllVets = () => {
    setSelectedPlayerIds(
      filteredPlayerData
        .filter((player) => !isRookiePlayer(player))
        .map((player) => player.id)
    );
  };

  const handleUnselectAllPlayers = () => {
    setSelectedPlayerIds([]);
  };

  const handleOpenTargetActionModal = async (player) => {
    setSelectedTargetPlayer(player);
    setIsTargetActionModalOpen(true);
    setTargetPlayerStatsLoading(true);

    try {
      const playerWithStats = await addLastSeasonStatsToPlayer({
        id: player.playerId,
        ...player,
      });

      setSelectedTargetPlayer((currentPlayer) =>
        currentPlayer?.playerId === player.playerId
          ? {
              ...currentPlayer,
              selectedSeason: playerWithStats.selectedSeason,
              seasonStats: playerWithStats.seasonStats,
            }
          : currentPlayer
      );
    } catch (error) {
      console.error("Error loading target player stats:", error);
    } finally {
      setTargetPlayerStatsLoading(false);
    }
  };

  const handleCloseTargetActionModal = () => {
    setIsTargetActionModalOpen(false);
    setSelectedTargetPlayer(null);
    setTargetPlayerStatsLoading(false);
  };

  const handleOpenAddToTeamModal = (player) => {
    setTeamTargetPlayer(player);
    setSelectedLeagueTeamNumber(player.leagueTeamNumber ?? "");
    setPurchasePrice(
      player.purchasePrice !== undefined && player.purchasePrice !== null
        ? `${player.purchasePrice}`
        : ""
    );
    setIsTargetActionModalOpen(false);
    setIsAddToTeamModalOpen(true);
  };

  const handleCloseAddToTeamModal = () => {
    setIsAddToTeamModalOpen(false);
    setTeamTargetPlayer(null);
    setSelectedLeagueTeamNumber("");
    setPurchasePrice("");
  };

  const handleToggleWatchlist = async (player) => {
    if (!currentUser?.uid || !player?.playerId) return;

    const nextWatchlist = !player.watchlist;

    setWatchlistSavingPlayerId(player.playerId);
    setSelectedTargetPlayer((currentPlayer) =>
      currentPlayer?.playerId === player.playerId
        ? { ...currentPlayer, watchlist: nextWatchlist }
        : currentPlayer
    );
    setTargetBoardPlayers((currentPlayers) =>
      currentPlayers.map((targetPlayer) =>
        targetPlayer.playerId === player.playerId
          ? { ...targetPlayer, watchlist: nextWatchlist }
          : targetPlayer
      )
    );

    try {
      await setDoc(
        doc(
          db,
          "userprofile",
          currentUser.uid,
          "targetedPlayers",
          player.playerId
        ),
        {
          watchlist: nextWatchlist,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating watchlist:", error);
      setSelectedTargetPlayer((currentPlayer) =>
        currentPlayer?.playerId === player.playerId
          ? { ...currentPlayer, watchlist: player.watchlist }
          : currentPlayer
      );
      setTargetBoardPlayers((currentPlayers) =>
        currentPlayers.map((targetPlayer) =>
          targetPlayer.playerId === player.playerId
            ? { ...targetPlayer, watchlist: player.watchlist }
            : targetPlayer
        )
      );
    } finally {
      setWatchlistSavingPlayerId("");
    }
  };

  const handleRemoveTargetPlayer = async (player) => {
    if (!currentUser?.uid || !player?.playerId) return;

    setRemovingTargetPlayerId(player.playerId);

    try {
      await deleteDoc(
        doc(
          db,
          "userprofile",
          currentUser.uid,
          "targetedPlayers",
          player.playerId
        )
      );

      setTargetBoardPlayers((currentPlayers) =>
        currentPlayers.filter(
          (targetPlayer) => targetPlayer.playerId !== player.playerId
        )
      );
      handleCloseTargetActionModal();
    } catch (error) {
      console.error("Error removing target player:", error);
    } finally {
      setRemovingTargetPlayerId("");
    }
  };

  const handleSavePlayerTeam = async () => {
    if (!currentUser?.uid || !teamTargetPlayer?.playerId) return;

    const selectedTeam = leagueTeams.find(
      (team) => `${team.TeamNumber}` === `${selectedLeagueTeamNumber}`
    );

    if (selectedLeagueTeamNumber !== "" && !selectedTeam) return;

    const parsedPurchasePrice =
      purchasePrice === "" ? "" : Number(purchasePrice);

    if (parsedPurchasePrice !== "" && Number.isNaN(parsedPurchasePrice)) return;

    const teamUpdate = {
      leagueTeam: selectedTeam?.TeamName ?? "",
      leagueTeamNumber: selectedTeam?.TeamNumber ?? "",
      purchasePrice: selectedTeam ? parsedPurchasePrice : "",
      updatedAt: serverTimestamp(),
    };

    setTeamSavingPlayerId(teamTargetPlayer.playerId);

    try {
      await setDoc(
        doc(
          db,
          "userprofile",
          currentUser.uid,
          "targetedPlayers",
          teamTargetPlayer.playerId
        ),
        teamUpdate,
        { merge: true }
      );

      setTargetBoardPlayers((currentPlayers) =>
        currentPlayers.map((targetPlayer) =>
          targetPlayer.playerId === teamTargetPlayer.playerId
            ? { ...targetPlayer, ...teamUpdate }
            : targetPlayer
        )
      );
      handleCloseAddToTeamModal();
    } catch (error) {
      console.error("Error adding player to team:", error);
    } finally {
      setTeamSavingPlayerId("");
    }
  };

  const processSelectedPlayers = async () => {
    if (!currentUser?.uid || selectedCount === 0) return;

    const totalToProcess = selectedCount;

    if (playerListInModal) {
      setIsPlayerModalOpen(false);
      setIsProgressModalOpen(true);
    }

    setProcessing(true);
    setProcessedCount(0);
    setProcessingTotal(totalToProcess);
    setErrorMessage("");

    try {
      const selectedPlayers = selectedPlayerIds
        .map((playerId) => playerData.find((player) => player.id === playerId))
        .filter(Boolean);

      for (const player of selectedPlayers) {
        const targetedPlayerRef = doc(
          db,
          "userprofile",
          currentUser.uid,
          "targetedPlayers",
          player.id
        );
        const existingTargetSnap = await getDoc(targetedPlayerRef);

        if (existingTargetSnap.exists()) {
          setProcessedCount((count) => count + 1);
          continue;
        }

        const masterPlayerSnap = await getDoc(doc(db, "players", player.id));

        if (!masterPlayerSnap.exists()) {
          setProcessedCount((count) => count + 1);
          continue;
        }

        const masterPlayer = normalizePlayer(masterPlayerSnap);
        const playerWithStats = await addProjectedStatsToPlayer(masterPlayer);
        const targetedPlayer = buildTargetedPlayer(playerWithStats, playerData);
        let notes = buildFallbackScoutingNotes(targetedPlayer);

        try {
          notes = await getOpenAIScoutingNotes(targetedPlayer);
        } catch (error) {
          console.warn("Using fallback scouting notes:", error);
        }

        await setDoc(
          targetedPlayerRef,
          {
            ...targetedPlayer,
            systemNotes: notes.systemNotes ?? targetedPlayer.systemNotes,
            recommendationNotes:
              notes.recommendationNotes ?? targetedPlayer.recommendationNotes,
            userNotes: "",
            userTags: [],
            watchlist: false,
            leagueTeam: "",
            leagueTeamNumber: "",
            purchasePrice: "",
            processedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        setProcessedCount((count) => count + 1);
      }

      setSelectedPlayerIds([]);
    } catch (error) {
      console.error("Error processing selected players:", error);
      setErrorMessage("Unable to process selected players.");
    } finally {
      setProcessing(false);
    }
  };

  const renderSelectablePlayerList = ({ processButtonLabel = "Process Selected Players" }) => (
    <>
      <div className="table-responsive players-table-wrap">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Select</th>
              <th scope="col">Player Name</th>
              <th scope="col">Position Rank</th>
              <th scope="col">Tier</th>
              <th scope="col">Auction Value</th>
            </tr>
          </thead>
          <tbody>
            {selectablePlayerPageItems.map((player) => (
              <tr key={player.id}>
                <td>
                  <label className="keeper-checkbox-label">
                    <input
                      checked={selectedPlayerSet.has(player.id)}
                      disabled={processing}
                      onChange={() => handleTogglePlayer(player.id)}
                      type="checkbox"
                    />
                    <span>Select</span>
                  </label>
                </td>
                <td className="fw-semibold">{player.fullName}</td>
                <td>
                  {player.position}
                  {player.positionRank}
                </td>
                <td>Tier {player.tier}</td>
                <td>{formatCurrency(player.auctionValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="target-board-pagination target-board-selectable-pagination">
        <button
          aria-label="Previous selectable player page"
          className="target-board-page-button"
          disabled={selectablePlayerPage === 1}
          onClick={() =>
            setSelectablePlayerPage((currentPage) =>
              Math.max(currentPage - 1, 1)
            )
          }
          type="button"
        >
          <FiChevronLeft />
        </button>
        <span className="target-board-page-ellipsis">
          Page {selectablePlayerPage} of {selectablePlayerPageCount}
        </span>
        <button
          aria-label="Next selectable player page"
          className="target-board-page-button"
          disabled={selectablePlayerPage === selectablePlayerPageCount}
          onClick={() =>
            setSelectablePlayerPage((currentPage) =>
              Math.min(currentPage + 1, selectablePlayerPageCount)
            )
          }
          type="button"
        >
          <FiChevronRight />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {selectedCount} Players Selected
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={filteredPlayerData.length === 0 || processing}
            onClick={handleSelectAllPlayers}
            className="px-5 py-3 text-sm font-semibold border disabled:opacity-50 disabled:cursor-not-allowed hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
            style={{ borderRadius: "10px" }}
          >
            Select All
          </button>
          <button
            type="button"
            disabled={filteredPlayerData.length === 0 || processing}
            onClick={handleSelectAllVets}
            className="px-5 py-3 text-sm font-semibold border disabled:opacity-50 disabled:cursor-not-allowed hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
            style={{ borderRadius: "10px" }}
          >
            Select All Vets
          </button>
          <button
            type="button"
            disabled={selectedCount === 0 || processing}
            onClick={handleUnselectAllPlayers}
            className="px-5 py-3 text-sm font-semibold border disabled:opacity-50 disabled:cursor-not-allowed hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
            style={{ borderRadius: "10px" }}
          >
            Unselect All
          </button>
          <button
            type="button"
            disabled={selectedCount === 0 || processing}
            onClick={processSelectedPlayers}
            className="px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:drop-shadow-xl"
            style={{
              backgroundColor: currentColor,
              borderRadius: "10px",
            }}
          >
            {processButtonLabel}
          </button>
        </div>
      </div>
    </>
  );

  const renderWatchlistStar = (player) => {
    const isWatchlisted = Boolean(player.watchlist);
    const isSaving = watchlistSavingPlayerId === player.playerId;
    const handleToggle = (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (!isSaving) {
        handleToggleWatchlist(player);
      }
    };

    return (
      <span
        aria-label={`${isWatchlisted ? "Remove" : "Add"} ${player.name} ${
          isWatchlisted ? "from" : "to"
        } wishlist`}
        aria-pressed={isWatchlisted}
        className={`target-board-watchlist-star ${
          isWatchlisted ? "active" : ""
        } ${isSaving ? "saving" : ""}`}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            handleToggle(event);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {isWatchlisted ? "★" : "☆"}
      </span>
    );
  };

  const renderTargetBoardList = () => (
    <div className="target-board-list">
      <div className="target-board-list-head">
        <span>Rank</span>
        <span>Player</span>
        <span>Tier</span>
        <span>DD Score</span>
        <span>Sleeper</span>
        <span>Value</span>
        <span>Max</span>
      </div>
      {targetBoardPageItems.map((player) => {
        const ddLabel =
          toNumber(player.ddScore) >= 90 ? "Elite" : player.ddScoreLabel;

        return (
          <div
            className="target-board-row"
            data-team-watermark={player.leagueTeam || undefined}
            key={player.playerId}
          >
            <div className="target-board-rank">
              {renderWatchlistStar(player)}
              {player.positionRank || player.rank}
            </div>
            <button
              aria-label={`Open actions for ${player.name}`}
              className="target-board-player"
              onClick={() => handleOpenTargetActionModal(player)}
              type="button"
            >
              <img
                alt=""
                className="target-board-avatar"
                src={`https://sleepercdn.com/content/nfl/players/${
                  player.sleeperId || player.playerId
                }.jpg`}
              />
              <div>
                <div className="target-board-name">{player.name}</div>
                <div className="target-board-meta">
                  {player.team} <span>•</span> {player.position}
                </div>
              </div>
            </button>
            <div>
              <span className="target-board-tier">{player.tier}</span>
            </div>
            <div className="target-board-score">
              <span className="target-board-score-ring">
                {toNumber(player.ddScore)}
              </span>
              <span>{ddLabel}</span>
            </div>
            <div className="target-board-score sleeper">
              <span className="target-board-sleeper-score">
                {toNumber(player.sleeperScore)}
              </span>
              <span>
                {player.sleeperLabel || getSleeperLabel(toNumber(player.sleeperScore))}
              </span>
            </div>
            <div className="target-board-money">
              {formatCurrency(player.auctionValue)}
            </div>
            <div className="target-board-money">
              {formatCurrency(player.maxBid)}
            </div>
          </div>
        );
      })}
      {targetBoardPageCount > 1 && (
        <div className="target-board-pagination">
          <button
            aria-label="Previous target page"
            className="target-board-page-button"
            disabled={targetPage === 1}
            onClick={() => setTargetPage((page) => Math.max(1, page - 1))}
            type="button"
          >
            <FiChevronLeft />
          </button>
          {targetPaginationItems.map((pageItem, index) =>
            pageItem === "ellipsis" ? (
              <span
                className="target-board-page-button target-board-page-ellipsis"
                key={`target-ellipsis-${index}`}
              >
                ...
              </span>
            ) : (
              <button
                className={`target-board-page-button ${
                  targetPage === pageItem ? "active" : ""
                }`}
                key={pageItem}
                onClick={() => setTargetPage(pageItem)}
                type="button"
              >
                {pageItem}
              </button>
            )
          )}
          <button
            aria-label="Next target page"
            className="target-board-page-button"
            disabled={targetPage === targetBoardPageCount}
            onClick={() =>
              setTargetPage((page) => Math.min(targetBoardPageCount, page + 1))
            }
            type="button"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );

  const renderWishlistCard = () => (
    <div className="target-board-wishlist-card p-6 md:p-8 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="target-board-action-header">
        <h2>Top Wishlist</h2>
        <span>{wishlistPlayers.length} players</span>
      </div>
      <p className="target-board-wishlist-subtitle">Organized by rank</p>
      <div className="target-board-action-divider" />

      {wishlistPlayers.length === 0 ? (
        <div className="players-empty-state target-board-wishlist-empty">
          Turn on Watchlist from a player popup to build this list.
        </div>
      ) : (
        <>
          <div className="target-board-wishlist-list">
            {wishlistPageItems.map((player, index) => {
              const displayRank = player.positionRank || player.rank;
              const listRank =
                (wishlistPage - 1) * WISHLIST_PAGE_SIZE + index + 1;

              return (
                <button
                  aria-label={`Open actions for ${player.name}`}
                  className="target-board-wishlist-row"
                  data-team-watermark={player.leagueTeam || undefined}
                  key={player.playerId}
                  onClick={() => handleOpenTargetActionModal(player)}
                  type="button"
                >
                  <span className="target-board-wishlist-number">
                    {renderWatchlistStar(player)}
                    {displayRank || listRank}
                  </span>
                  <img
                    alt=""
                    className="target-board-wishlist-avatar"
                    src={`https://sleepercdn.com/content/nfl/players/${
                      player.sleeperId || player.playerId
                    }.jpg`}
                  />
                  <span className="target-board-wishlist-player">
                    <span className="target-board-wishlist-name">
                      {player.name}
                    </span>
                    <span className="target-board-meta">
                      {player.team} <span>•</span> {player.position}
                    </span>
                  </span>
                  <span className="target-board-wishlist-value">
                    {formatCurrency(player.auctionValue)}
                  </span>
                  <span className="target-board-score-ring">
                    {toNumber(player.ddScore)}
                  </span>
                </button>
              );
            })}
          </div>

          {wishlistPageCount > 1 && (
            <div className="target-board-pagination target-board-wishlist-pagination">
              <button
                aria-label="Previous wishlist page"
                className="target-board-page-button"
                disabled={wishlistPage === 1}
                onClick={() => setWishlistPage((page) => Math.max(1, page - 1))}
                type="button"
              >
                <FiChevronLeft />
              </button>
              {wishlistPaginationItems.map((pageItem, index) =>
                pageItem === "ellipsis" ? (
                  <span
                    className="target-board-page-button target-board-page-ellipsis"
                    key={`wishlist-ellipsis-${index}`}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    className={`target-board-page-button ${
                      wishlistPage === pageItem ? "active" : ""
                    }`}
                    key={pageItem}
                    onClick={() => setWishlistPage(pageItem)}
                    type="button"
                  >
                    {pageItem}
                  </button>
                )
              )}
              <button
                aria-label="Next wishlist page"
                className="target-board-page-button"
                disabled={wishlistPage === wishlistPageCount}
                onClick={() =>
                  setWishlistPage((page) => Math.min(wishlistPageCount, page + 1))
                }
                type="button"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderTargetedCombosCard = () => {
    const comboSlotCount = comboSlotCounts[lockedPosition] ?? 0;
    const comboTitle = lockedPosition ? `${lockedPosition} Stacks` : "Targeted Stacks";
    const shouldRenderBuildGenerator = ["RB", "WR"].includes(lockedPosition);
    const selectedStackBuild = positionStackBuilds[stackBuildPage - 1];

    return (
      <div className="target-board-combos-card p-6 md:p-8 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <div className="target-board-action-header">
          <h2>{comboTitle}</h2>
        </div>
        <p className="target-board-wishlist-subtitle">
          AI based, calculated combo of players based off of auction values. A
          list of players I can grab based off of allocation percentage.
        </p>
        <div className="target-board-action-divider" />

        {shouldRenderBuildGenerator ? (
          positionStackBuilds.length === 0 ? (
            <div className="players-empty-state target-board-combos-empty">
              Add available {lockedPosition} targets to generate optimized auction builds.
            </div>
          ) : (
            <div className="target-board-stack-builds">
              {selectedStackBuild && (
                <div
                  className="target-board-stack-build"
                  key={`${lockedPosition}-stack-build-${stackBuildPage}-${selectedStackBuild.score}`}
                >
                  <div className="target-board-stack-build-header">
                    <div>
                      <h3>{selectedStackBuild.buildType}</h3>
                      <p>Score: {selectedStackBuild.score}</p>
                    </div>
                    <span
                      className={`target-board-stack-status target-board-stack-status-${selectedStackBuild.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {selectedStackBuild.status}
                    </span>
                  </div>

                  <div className="target-board-stack-player-list">
                    {selectedStackBuild.players.map((player, playerIndex) => (
                      <div
                        className="target-board-stack-player"
                        key={`${stackBuildPage}-${player.playerId}`}
                      >
                        <span>
                          {lockedPosition}
                          {playerIndex + 1}
                        </span>
                        <strong>{player.name}</strong>
                        <em>{formatCurrency(getBuildPlayerCost(player))}</em>
                      </div>
                    ))}
                  </div>

                  <div className="target-board-stack-summary">
                    <div>
                      <span>Total Cost</span>
                      <strong>{formatCurrency(selectedStackBuild.totalCost)}</strong>
                    </div>
                    <div>
                      <span>Allocation Range</span>
                      <strong>{selectedStackBuild.allocationRange}</strong>
                    </div>
                  </div>

                  <div className="target-board-stack-explanation">
                    <h4>Why This Build Works</h4>
                    <ul>
                      {selectedStackBuild.explanations.map((explanation) => (
                        <li key={explanation}>{explanation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="target-board-pagination target-board-stack-pagination">
                <button
                  aria-label="Previous stack build"
                  className="target-board-page-button"
                  disabled={stackBuildPage === 1}
                  onClick={() =>
                    setStackBuildPage((page) => Math.max(1, page - 1))
                  }
                  type="button"
                >
                  <FiChevronLeft />
                </button>
                <span className="target-board-page-ellipsis">
                  Stack {stackBuildPage} of {positionStackBuilds.length}
                </span>
                <button
                  aria-label="Next stack build"
                  className="target-board-page-button"
                  disabled={stackBuildPage === positionStackBuilds.length}
                  onClick={() =>
                    setStackBuildPage((page) =>
                      Math.min(positionStackBuilds.length, page + 1)
                    )
                  }
                  type="button"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="target-board-combos-slots">
            {Array.from({ length: comboSlotCount }).map((_, index) => (
              <div
                className="target-board-combos-slot"
                key={`targeted-combo-${lockedPosition}-${index + 1}`}
              >
                <span>{lockedPosition || "POS"}</span>
                <strong>Slot {index + 1}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBudgetStrategyCard = (category) => {
    const totalAuctionValue = category.players.reduce(
      (total, player) => total + toNumber(player.auctionValue),
      0
    );
    const pageCount = Math.max(
      1,
      Math.ceil(category.players.length / BUDGET_STRATEGY_PAGE_SIZE)
    );
    const currentPage = Math.min(
      Math.max(budgetStrategyPages[category.key] ?? 1, 1),
      pageCount
    );
    const startIndex = (currentPage - 1) * BUDGET_STRATEGY_PAGE_SIZE;
    const pagePlayers = category.players.slice(
      startIndex,
      startIndex + BUDGET_STRATEGY_PAGE_SIZE
    );
    const handleBudgetStrategyPageChange = (nextPage) => {
      setBudgetStrategyPages((currentPages) => ({
        ...currentPages,
        [category.key]: Math.min(Math.max(nextPage, 1), pageCount),
      }));
    };

    return (
      <div
        className="budget-strategy-card bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl"
        key={category.key}
      >
        <div className="budget-strategy-card-header">
          <div>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </div>
          <div className="budget-strategy-card-totals">
            <span>{category.players.length} players</span>
            <strong>{formatCurrency(totalAuctionValue)}</strong>
          </div>
        </div>

        {category.players.length === 0 ? (
          <div className="players-empty-state budget-strategy-empty">
            No Targeted Players In This Tier Yet.
          </div>
        ) : (
          <>
            <div className="budget-strategy-player-list">
              {pagePlayers.map((player) => (
                <button
                  className="budget-strategy-player-row target-board-wishlist-row"
                  data-team-watermark={player.leagueTeam || undefined}
                  key={`${category.key}-${player.playerId}`}
                  onClick={() => handleOpenTargetActionModal(player)}
                  type="button"
                >
                  <span className="target-board-wishlist-number">
                    {renderWatchlistStar(player)}
                    {player.positionRank || player.rank || "-"}
                  </span>
                  <span className="target-board-wishlist-player">
                    <span className="target-board-wishlist-name">
                      {player.name}
                    </span>
                    <span className="target-board-meta">
                      {player.team} <span>•</span> {player.position}
                    </span>
                  </span>
                  <span className="target-board-wishlist-value">
                    {formatCurrency(player.auctionValue)}
                  </span>
                  <span className="target-board-wishlist-value">
                    {formatPercent(player.budgetPercent)}
                  </span>
                </button>
              ))}
            </div>

            {pageCount > 1 && (
              <div className="target-board-pagination budget-strategy-pagination">
                <button
                  aria-label={`Previous ${category.title} page`}
                  className="target-board-page-button"
                  disabled={currentPage === 1}
                  onClick={() => handleBudgetStrategyPageChange(currentPage - 1)}
                  type="button"
                >
                  <FiChevronLeft />
                </button>
                <span className="target-board-page-ellipsis">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  aria-label={`Next ${category.title} page`}
                  className="target-board-page-button"
                  disabled={currentPage === pageCount}
                  onClick={() => handleBudgetStrategyPageChange(currentPage + 1)}
                  type="button"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderBudgetStrategySummary = () => {
    if (!budgetStrategy) return null;

    const summaryItems = [
      {
        label: `Target ${lockedPosition} Allocation`,
        value: `${formatPercent(budgetStrategy.allocationRule?.minPercent)} - ${formatPercent(
          budgetStrategy.allocationRule?.maxPercent
        )}`,
      },
      {
        label: `Target ${lockedPosition} Budget`,
        value: `${formatCurrency(budgetStrategy.minBudget)} - ${formatCurrency(
          budgetStrategy.maxBudget
        )}`,
      },
      {
        label: "Targeted Players",
        value: budgetStrategy.playerCount,
      },
      {
        label: "Wishlist Players",
        value: budgetStrategy.wishlistCount,
      },
    ];

    return (
      <div className="budget-strategy-summary p-6 md:p-8 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <div className="budget-strategy-title-row">
          <div>
            <p className="text-gray-400 text-sm mb-1">Targeted Players Dashboard</p>
            <h2>{budgetStrategy.text.title}</h2>
          </div>
          <span
            className={`budget-strategy-status budget-strategy-status-${budgetStrategy.status.tone}`}
          >
            {budgetStrategy.status.label}
          </span>
        </div>
        <div className="budget-strategy-summary-grid">
          {summaryItems.map((item) => (
            <div className="budget-strategy-summary-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBudgetStrategySection = () => {
    if (!budgetStrategy) return null;

    return (
      <section className="budget-strategy-section mt-6">
        <div className="budget-strategy-grid">
          {budgetStrategy.categories.map(renderBudgetStrategyCard)}
        </div>
      </section>
    );
  };

  return (
    <div className="players-page m-2 md:m-10 mt-24">
      <div className="p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Command Center" title={pageTitle} />
        <div className="flex flex-wrap gap-3">
          {showPositionFilters &&
            positionFilters.map((position) => {
              const isSelected = selectedPosition === position.value;

              return (
                <button
                  key={position.value}
                  type="button"
                  onClick={() => handlePositionSelect(position.value)}
                  className={`px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl ${
                    isSelected
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                  }`}
                  style={{
                    backgroundColor: isSelected ? currentColor : "transparent",
                    borderColor: isSelected ? currentColor : undefined,
                    borderRadius: "10px",
                  }}
                >
                  {position.label}
                </button>
              );
            })}
          {showPositionFilters && (
            <button
              type="button"
              onClick={() => handlePositionSelect("")}
              className="px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
              style={{ borderRadius: "10px" }}
            >
              Clear
            </button>
          )}
          {!playerListInModal && (
            <div className="players-tier-filter">
              <label className="players-filter-label" htmlFor="scouting-tier-filter">
                Tiers
              </label>
              <select
                aria-label="Tier filter"
                className="form-control"
                id="scouting-tier-filter"
                onChange={handleTierSelect}
                value={selectedTier}
              >
                {tierFilters.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {playerListInModal && isPlayerModalOpen && selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="players-page w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl p-4 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-gray-400 text-sm mb-1">Player List</p>
                <h2 className="text-2xl font-semibold">
                  {selectedFilter?.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPlayerModalOpen(false)}
                className="px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                style={{ borderRadius: "10px" }}
              >
                Close
              </button>
            </div>

            <div className="players-toolbar">
              <div className="players-search">
                <input
                  aria-label="Search players"
                  className="form-control"
                  onChange={(event) => setPlayerSearchTerm(event.target.value)}
                  placeholder="Search by player name"
                  type="search"
                  value={playerSearchTerm}
                />
              </div>
              <div className="players-tier-filter">
                <label
                  className="players-filter-label"
                  htmlFor="scouting-modal-tier-filter"
                >
                  Tiers
                </label>
                <select
                  aria-label="Tier filter"
                  className="form-control"
                  id="scouting-modal-tier-filter"
                  onChange={handleTierSelect}
                  value={selectedTier}
                >
                  {tierFilters.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>
              {!loading && !errorMessage && (
                <span className="text-sm text-gray-500 dark:text-gray-300">
                  {filteredPlayerData.length} players
                </span>
              )}
            </div>

            {loading ? (
              <div className="players-loading">Loading players...</div>
            ) : errorMessage ? (
              <div className="players-empty-state text-red-500">{errorMessage}</div>
            ) : filteredPlayerData.length === 0 ? (
              <div className="players-empty-state">
                No ranked and tiered players found for {selectedPosition}.
              </div>
            ) : (
              renderSelectablePlayerList({ processButtonLabel: "Process" })
            )}
          </div>
        </div>
      )}

      {playerListInModal && isProgressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl p-6 md:p-8">
            <p className="text-gray-400 text-sm mb-1">Progress</p>
            <h2 className="text-2xl font-semibold mb-5">
              {processing ? "Processing Players" : "Processing Complete"}
            </h2>
            <div className="players-loading">
              {processedCount}/{processingTotal} players processed
            </div>
            {!processing && (
              <button
                type="button"
                onClick={() => {
                  setIsProgressModalOpen(false);
                  setProcessingTotal(0);
                }}
                className="mt-5 w-full px-5 py-3 text-sm font-semibold text-white hover:drop-shadow-xl"
                style={{
                  backgroundColor: currentColor,
                  borderRadius: "10px",
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {isTargetActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="players-page w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl p-6 md:p-8">
            <p className="text-gray-400 text-sm mb-1">Target Player</p>
            <h2 className="text-2xl font-semibold mb-2">
              {selectedTargetPlayer?.name || "Player"}
            </h2>
            {selectedTargetPlayer && (
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-5">
                {selectedTargetPlayer.team} / {selectedTargetPlayer.position}
                {selectedTargetPlayer.positionRank}
              </p>
            )}
            {selectedTargetPlayer && (
              <div className="target-player-modal-stats mb-5">
                {targetPlayerStatsLoading ? (
                  <div className="players-loading target-player-modal-stats-loading">
                    Loading stats...
                  </div>
                ) : (
                  <div className="target-player-season-sections">
                    <div className="target-player-season-section">
                      <h3>
                        {selectedTargetPlayer.selectedSeason ||
                          getLastSeasonYear()}{" "}
                        Stats
                      </h3>
                      {getTargetPlayerSeasonSections(
                        selectedTargetPlayer.position,
                        selectedTargetPlayer.selectedSeason || getLastSeasonYear()
                      ).map((section) => (
                        <div
                          className="target-player-season-group"
                          key={section.title}
                        >
                          <div
                            className={`target-player-season-grid target-player-season-grid-${section.columns}`}
                          >
                            {section.fields.map((field) => (
                              <div
                                className="target-player-season-stat"
                                key={`${section.title}-${field.label}`}
                              >
                                <span>{field.label}</span>
                                <strong>
                                  {getStatValue(
                                    selectedTargetPlayer.seasonStats,
                                    ...field.paths
                                  )}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedTargetPlayer && (
              <FormControlLabel
                className="mb-5"
                control={
                  <Switch
                  checked={Boolean(selectedTargetPlayer.watchlist)}
                  disabled={
                    watchlistSavingPlayerId === selectedTargetPlayer.playerId
                  }
                  onChange={() => handleToggleWatchlist(selectedTargetPlayer)}
                  />
                }
                label="Watchlist"
              />
            )}
            {selectedTargetPlayer && (
              <button
                type="button"
                onClick={() => handleOpenAddToTeamModal(selectedTargetPlayer)}
                className="mb-3 w-full px-5 py-3 text-sm font-semibold text-white hover:drop-shadow-xl"
                style={{
                  backgroundColor: currentColor,
                  borderRadius: "10px",
                }}
              >
                Add to Team
              </button>
            )}
            {selectedTargetPlayer && (
              <button
                type="button"
                disabled={
                  removingTargetPlayerId === selectedTargetPlayer.playerId
                }
                onClick={() => handleRemoveTargetPlayer(selectedTargetPlayer)}
                className="mb-3 w-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:drop-shadow-xl"
                style={{
                  backgroundColor: "#dc2626",
                  borderRadius: "10px",
                }}
              >
                Remove Player
              </button>
            )}
            <button
              type="button"
              onClick={handleCloseTargetActionModal}
              className="w-full px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
              style={{
                borderRadius: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isAddToTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl p-6 md:p-8">
            <p className="text-gray-400 text-sm mb-1">Add to Team</p>
            <h2 className="text-2xl font-semibold mb-2">
              {teamTargetPlayer?.name || "Player"}
            </h2>
            {teamTargetPlayer && (
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-5">
                {teamTargetPlayer.team} / {teamTargetPlayer.position}
                {teamTargetPlayer.positionRank}
              </p>
            )}

            <div className="flex flex-col gap-5 mb-6">
              <FormControl fullWidth>
                <InputLabel
                  id="target-player-team-label"
                  className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
                >
                  Team
                </InputLabel>
                <Select
                  labelId="target-player-team-label"
                  label="Team"
                  value={selectedLeagueTeamNumber}
                  onChange={(event) =>
                    setSelectedLeagueTeamNumber(event.target.value)
                  }
                  className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
                >
                  <MenuItem value="">
                    <em>Blank</em>
                  </MenuItem>
                  {leagueTeams.map((team) => (
                    <MenuItem
                      key={`target-player-team-${team.TeamNumber}`}
                      value={team.TeamNumber}
                    >
                      {team.TeamName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                InputProps={{
                  className:
                    "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
                }}
                InputLabelProps={{
                  className:
                    "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
                }}
              />
            </div>

            {leagueTeams.length === 0 && (
              <p className="text-sm text-red-500 mb-4">
                Add teams in League Settings before assigning a player.
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={
                  teamSavingPlayerId === teamTargetPlayer?.playerId
                }
                onClick={handleSavePlayerTeam}
                className="w-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:drop-shadow-xl"
                style={{
                  backgroundColor: currentColor,
                  borderRadius: "10px",
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCloseAddToTeamModal}
                className="w-full px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                style={{ borderRadius: "10px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPosition && !playerListInModal && (
        <div className="mt-6 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-gray-400 text-sm mb-1">Player List</p>
              <h2 className="text-2xl font-semibold">
                {selectedFilter?.title}
              </h2>
            </div>
            {!loading && !errorMessage && (
              <span className="text-sm text-gray-500 dark:text-gray-300">
                {filteredPlayerData.length} players
              </span>
            )}
          </div>

          {loading ? (
            <div className="players-loading">Loading players...</div>
          ) : errorMessage ? (
            <div className="players-empty-state text-red-500">{errorMessage}</div>
          ) : filteredPlayerData.length === 0 ? (
            <div className="players-empty-state">
              No ranked and tiered players found for {selectedPosition}.
            </div>
          ) : (
            <>
              {renderSelectablePlayerList({
                processButtonLabel: "Process Selected Players",
              })}
              {processing && (
                <div className="players-loading mt-5">
                  Processing {processingTotal} Players... {processedCount} /{" "}
                  {processingTotal} Complete
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showTargetFilterCard && (
        <div className="mt-6 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
          <Header category="Target Players" title="Filters" />
          <div className="flex flex-wrap gap-3">
            {positionFilters.map((position) => {
              const isSelected = targetPosition === position.value;

              return (
                <button
                  key={position.value}
                  type="button"
                  onClick={() => setTargetPosition(position.value)}
                  className={`px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl ${
                    isSelected
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                  }`}
                  style={{
                    backgroundColor: isSelected ? currentColor : "transparent",
                    borderColor: isSelected ? currentColor : undefined,
                    borderRadius: "10px",
                  }}
                >
                  {position.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setTargetPosition("")}
              className="px-5 py-3 text-sm font-semibold border hover:drop-shadow-xl text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
              style={{ borderRadius: "10px" }}
            >
              Clear
            </button>
            <div className="players-tier-filter">
              <label
                className="players-filter-label"
                htmlFor="target-board-tier-filter"
              >
                Tiers
              </label>
              <select
                aria-label="Target board tier filter"
                className="form-control"
                id="target-board-tier-filter"
                onChange={handleTargetTierSelect}
                value={targetTier}
              >
                {tierFilters.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="players-tier-filter">
              <label
                className="players-filter-label"
                htmlFor="target-board-sleeper-filter"
              >
                Sleepers
              </label>
              <select
                aria-label="Target board sleeper filter"
                className="form-control"
                id="target-board-sleeper-filter"
                onChange={handleTargetSleeperFilterSelect}
                value={targetSleeperFilter}
              >
                {sleeperFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="players-tier-filter">
              <label
                className="players-filter-label"
                htmlFor="target-board-sort"
              >
                Sort
              </label>
              <select
                aria-label="Target board sort"
                className="form-control"
                id="target-board-sort"
                onChange={handleTargetSortSelect}
                value={targetSortBy}
              >
                {targetSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="target-board-layout mt-6">
        <div className="target-board-main-column">
          <div className="target-board-card p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
            <div className="target-board-toolbar">
              <div className="target-board-search">
                <FiSearch />
                <input
                  aria-label="Search target players"
                  onChange={(event) => setTargetSearchTerm(event.target.value)}
                  placeholder={`Search ${targetPosition || lockedPosition || "targets"}...`}
                  type="search"
                  value={targetSearchTerm}
                />
              </div>
              <span className="target-board-count">
                {filteredTargetBoardPlayers.length}{" "}
                {targetPosition || lockedPosition || "targets"}
              </span>
              <select
                aria-label="Target board rank filter"
                className="target-board-select"
                onChange={handleTargetRankSelect}
                value={targetRank}
              >
                {rankFilters.map((rank) => (
                  <option key={rank.value} value={rank.value}>
                    {rank.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Target board tier filter"
                className="target-board-select"
                onChange={handleTargetTierSelect}
                value={targetTier}
              >
                {tierFilters.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {filteredTargetBoardPlayers.length === 0 ? (
              <div className="players-empty-state">
                Process selected players to build your target board.
              </div>
            ) : (
              renderTargetBoardList()
            )}
          </div>

          {budgetStrategy && renderBudgetStrategySummary()}
        </div>

        {playerListInModal && (
          <div className="target-board-side-column">
            <div className="target-board-action-card p-6 md:p-8 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
              <div className="target-board-action-header">
                <h2>Actions</h2>
              </div>
              <div className="target-board-action-divider" />
              <button
                id="open-player-list"
                type="button"
                onClick={() => setIsPlayerModalOpen(true)}
                className="target-board-action-button"
                style={{
                  backgroundColor: currentColor,
                }}
              >
                Target Players
              </button>
            </div>
            {renderWishlistCard()}
            {renderTargetedCombosCard()}
          </div>
        )}
      </div>

      {renderBudgetStrategySection()}
    </div>
  );
};

export default Scouting;
