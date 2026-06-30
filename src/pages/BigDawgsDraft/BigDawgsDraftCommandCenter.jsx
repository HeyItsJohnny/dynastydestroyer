import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaUserCheck } from "react-icons/fa";
import {
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiCpu,
  FiMinus,
  FiPlus,
  FiShield,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Header } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";
import { PLACEHOLDER_IMAGE } from "../Players/PlayerDetail/PlayerDetailHelpers";
import "../Players/PlayersPage.css";
import {
  AddBigDawgDraftedPlayerToTeam,
  ClearBigDawgCurrentAuction,
  CreateOrUpdateBigDawgCurrentAuction,
  UpdateBigDawgCurrentAuctionBid,
} from "../../globalFunctions/firebaseAuctionDraft";
import { setPlayerDraftStatus } from "../../globalFunctions/firebaseFunctions";

const emptyAuction = {
  FullName: "Select a player",
  Position: "--",
  Team: "N/A",
  Age: "--",
  YearsExperience: "--",
  CurrentBid: 0,
  NonSuperFlexValue: 0,
  SuperFlexValue: 0,
  PositionRank: "--",
};

const DRAFTED_PLAYERS_PAGE_SIZE = 5;

const currency = (value) => `$${Number(value || 0).toLocaleString()}`;
const normalizeStatus = (value) => `${value ?? ""}`.trim().toLowerCase();

const statValue = (value) => {
  if (value === undefined || value === null || value === "") return "--";
  return value;
};

const getProjectedSeasonYear = (date = new Date()) => date.getFullYear();

const getFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getPaginationItems = (pageCount, currentPage) => {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", pageCount];
  }

  if (currentPage >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount];
  }

  return [1, "ellipsis", currentPage, "ellipsis", pageCount];
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || value === undefined || value === null || value === ""
    ? fallback
    : parsed;
};

const hasTextValue = (value) =>
  value !== undefined && value !== null && `${value}`.trim() !== "";

const normalizeAuctionPlayer = async (playerDoc) => {
  const data = playerDoc.data();
  const projectedStatsSnap = await getDoc(
    doc(db, "players", playerDoc.id, "projectedStats", `${getProjectedSeasonYear()}`)
  );
  const projectedStats = projectedStatsSnap.exists() ? projectedStatsSnap.data() : {};
  const auctionValue = getFirstValue(
    projectedStats.auction_value,
    projectedStats["Auction Value"]
  );
  const maxBid = getFirstValue(projectedStats.max_bid, projectedStats["Max Bid"]);
  const hardMax = getFirstValue(
    projectedStats.hard_max_bid,
    projectedStats["Hard Max Bid"]
  );
  const rank = getFirstValue(projectedStats.rank, projectedStats.Rank);
  const tier = getFirstValue(projectedStats.tier, projectedStats.Tier);
  const projectedPoints = getFirstValue(
    projectedStats.projected_points,
    projectedStats.ProjectedPoints,
    projectedStats.projectedPoints,
    data.projectedPoints,
    data.ProjectedPoints
  );

  return {
    id: playerDoc.id,
    ...data,
    Age: data.age ?? data.Age ?? "",
    DatabaseID: playerDoc.id,
    DepthChartOrder: data.depthChartOrder ?? data.depth_chart_order ?? data.DepthChartOrder ?? "",
    DraftStatus: data.DraftStatus ?? "N/A",
    FirstName: data.firstName ?? data.first_name ?? data.FirstName ?? "",
    FullName: data.fullName ?? data.FullName ?? "",
    KeepTradeCutIdentifier:
      data.keepTradeCutIdentifier ??
      data.KeepTradeCutIdentifier ??
      `${data.fullName ?? playerDoc.id}-${data.position ?? ""}`,
    LastName: data.lastName ?? data.last_name ?? data.LastName ?? "",
    NonSuperFlexValue: auctionValue ?? data.NonSuperFlexValue ?? 0,
    Position: data.position ?? data.Position ?? "",
    PositionRank: rank ?? data.positionRank ?? data.PositionRank ?? "",
    ProjectedPoints: projectedPoints ?? 0,
    SearchFullName: data.searchFullName ?? data.search_full_name ?? data.fullName ?? "",
    SleeperID: data.sleeperId ?? data.sleeper_id ?? data.SleeperID ?? playerDoc.id,
    SuperFlexValue: maxBid ?? data.SuperFlexValue ?? auctionValue ?? 0,
    Team: data.nflTeam ?? data.team ?? data.Team ?? "",
    Tier: tier ?? data.Tier ?? data.tier ?? "",
    YearsExperience:
      data.yearsExp ?? data.yearsExperience ?? data.years_exp ?? data.YearsExperience ?? "",
    auctionValue,
    ddScore: data.ddScore ?? data.DDScore ?? 0,
    fullName: data.fullName ?? data.FullName ?? "",
    hardMax,
    headshotUrl: data.headshotUrl ?? data.media?.headshotUrl ?? "",
    media: data.media ?? {},
    maxBid,
    nflTeam: data.nflTeam ?? data.team ?? data.Team ?? "",
    position: data.position ?? data.Position ?? "",
    projectedPoints: projectedPoints ?? 0,
    rank,
    sleeperScore: data.sleeperScore ?? data.SleeperScore ?? 0,
    tier,
  };
};

const CurrentAuctionCard = ({
  currentAuction,
  teams,
  draftTeamId,
  draftAmount,
  hasCurrentPlayer,
  onAddPlayer,
  onClearPlayer,
  onCurrentBidChange,
  onDraftAmountChange,
  onDraftPlayer,
  onDraftTeamChange,
}) => {
  const valueBid = Number(currentAuction?.NonSuperFlexValue || 0);
  const maxValue = Number(currentAuction?.SuperFlexValue || currentAuction?.NonSuperFlexValue || 0);
  const hardMax = Math.ceil(Number(maxValue || 0) * 1.08);
  const currentBid = Number(currentAuction.CurrentBid || 0);
  const safeBid = Math.round(valueBid * 0.78);
  const tier = currentAuction?.Tier ?? currentAuction?.tier ?? "--";
  const getRangeProgress = (value, floor, ceiling) => {
    if (ceiling <= floor) return 0;
    return Math.max(0, Math.min((value - floor) / (ceiling - floor), 1));
  };
  let currentBidPercent = 2;

  if (currentBid > safeBid && currentBid <= valueBid) {
    currentBidPercent = 25 + getRangeProgress(currentBid, safeBid, valueBid) * 25;
  } else if (currentBid > valueBid && currentBid <= maxValue) {
    currentBidPercent = 50 + getRangeProgress(currentBid, valueBid, maxValue) * 25;
  } else if (currentBid > maxValue && currentBid <= hardMax) {
    currentBidPercent = 75 + getRangeProgress(currentBid, maxValue, hardMax) * 25;
  } else if (currentBid > hardMax) {
    currentBidPercent = 99;
  }
  const headshotUrl =
    currentAuction?.headshotUrl ||
    currentAuction?.media?.headshotUrl ||
    (currentAuction?.SleeperID
      ? `https://sleepercdn.com/content/nfl/players/${currentAuction.SleeperID}.jpg`
      : "");

  return (
    <section className="w-full min-h-[520px] p-6 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          Current Auction
        </p>
      </div>

      <div className="pt-7">
        <div className="flex flex-col lg:flex-row lg:items-start gap-7">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-6 min-w-0">
              <div className="w-32 h-32 rounded-md bg-gray-100 dark:bg-[#151c22] border border-gray-200 dark:border-[#2b3640] overflow-hidden shrink-0">
                <img
                  alt={`${currentAuction.FullName} headshot`}
                  className="w-full h-full object-cover"
                  src={headshotUrl || PLACEHOLDER_IMAGE}
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white truncate">
                  {currentAuction.FullName}
                </h2>
                <p className="text-2xl text-gray-600 dark:text-gray-300 mt-3">
                  {currentAuction.Position} • {currentAuction.Team}
                </p>
                <p className="text-xl text-gray-500 dark:text-gray-400 mt-4">
                  Age: {statValue(currentAuction.Age)} · Exp:{" "}
                  {statValue(currentAuction.YearsExperience)}
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <span className="px-4 py-2 rounded bg-purple-500/25 text-purple-200 text-xl font-bold">
                    Rank {statValue(currentAuction.PositionRank)}
                  </span>
                  <span className="px-4 py-2 rounded bg-emerald-500/20 text-emerald-200 text-xl font-bold">
                    Tier {statValue(tier)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <div className="rounded-md border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-4">
                <p className="text-sm uppercase text-gray-500 dark:text-gray-400 font-bold">Current Bid</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    aria-label="Decrease current bid"
                    disabled={!hasCurrentPlayer || currentBid <= 0}
                    onClick={() => onCurrentBidChange(currentBid - 1)}
                    className="h-9 w-9 rounded-md border border-gray-300 dark:border-[#33404a] flex items-center justify-center text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:drop-shadow-xl"
                  >
                    <FiMinus />
                  </button>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currency(currentBid)}
                  </p>
                  <button
                    type="button"
                    aria-label="Increase current bid"
                    disabled={!hasCurrentPlayer}
                    onClick={() => onCurrentBidChange(currentBid + 1)}
                    className="h-9 w-9 rounded-md border border-gray-300 dark:border-[#33404a] flex items-center justify-center text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:drop-shadow-xl"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
              <div className="rounded-md border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-4">
                <p className="text-sm uppercase text-gray-500 dark:text-gray-400 font-bold">Nominated By</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-2 truncate">
                  {currentAuction.NominatedByTeamName || "--"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:w-44 shrink-0">
            <div className="rounded-md border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-4">
              <p className="text-sm uppercase text-gray-500 dark:text-gray-400 font-bold">Value</p>
              <p className="text-3xl font-bold text-green-500 mt-1">
                {currency(valueBid)}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-4">
              <p className="text-sm uppercase text-gray-500 dark:text-gray-400 font-bold">Max</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">
                {currency(maxValue)}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-4">
              <p className="text-sm uppercase text-gray-500 dark:text-gray-400 font-bold">Hard</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {currency(hardMax)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between text-base uppercase text-gray-500 dark:text-gray-400 font-bold mb-2">
            <span>Bid Meter</span>
            <span className="text-gray-400">Current {currency(currentBid)}</span>
          </div>
          <div className="relative pt-5">
            <div
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${currentBidPercent}%` }}
            >
              <div className="mx-auto h-0 w-0 border-l-[9px] border-r-[9px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-100 drop-shadow" />
              <div className="mx-auto h-7 w-1 bg-gray-100 rounded-full" />
            </div>
            <div className="grid grid-cols-4 h-4 gap-1 overflow-hidden rounded-full bg-gray-200 dark:bg-[#232b32]">
              <div className="bg-green-500 rounded-l-full" />
              <div className="bg-blue-400" />
              <div className="bg-amber-400" />
              <div className="bg-red-500 rounded-r-full" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">{currency(safeBid)}</p>
              <p className="text-base uppercase font-bold text-green-500">Safe Bid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{currency(valueBid)}</p>
              <p className="text-base uppercase font-bold text-blue-400">Value Bid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{currency(maxValue)}</p>
              <p className="text-base uppercase font-bold text-amber-400">Max Bid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{currency(hardMax)}</p>
              <p className="text-base uppercase font-bold text-red-400">Hard Stop</p>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-200 dark:border-[#26313a]" />
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded bg-emerald-500/20 text-emerald-300 text-base font-bold">
              {currentAuction.Position || "Player"}
            </span>
            <span className="px-4 py-2 rounded bg-purple-500/20 text-purple-300 text-base font-bold">
              Rank {statValue(currentAuction.PositionRank)}
            </span>
            <span className="px-4 py-2 rounded bg-purple-500/20 text-purple-300 text-base font-bold">
              Tier {statValue(tier)}
            </span>
            {currentBid >= hardMax && hardMax > 0 ? (
              <span className="px-4 py-2 rounded bg-red-500/20 text-red-300 text-base font-bold">
                Do Not Overpay Past {currency(hardMax)}
              </span>
            ) : (
              <span className="px-4 py-2 rounded bg-blue-500/20 text-blue-300 text-base font-bold">
                {currentBid <= safeBid
                  ? "Safe Bid Range"
                  : currentBid <= maxValue
                    ? "Playable Bid Range"
                    : "Approaching Hard Stop"}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#d1d5db" }}>Draft Team</InputLabel>
            <Select
              value={draftTeamId}
              label="Draft Team"
              onChange={(event) => onDraftTeamChange(event.target.value)}
              sx={{
                color: "inherit",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#33404a" },
                ".MuiSvgIcon-root": { color: "inherit" },
              }}
            >
              {teams.map((team) => (
                <MenuItem value={team.id} key={team.id}>
                  {team.TeamName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Draft Amount"
            type="number"
            value={draftAmount}
            onChange={(event) => onDraftAmountChange(event.target.value)}
            InputLabelProps={{ style: { color: "#d1d5db" } }}
            InputProps={{ style: { color: "inherit" } }}
            sx={{
              ".MuiOutlinedInput-notchedOutline": { borderColor: "#33404a" },
            }}
          />
        </div>

        <div className="flex gap-4 mt-7">
          <Button
            variant="contained"
            startIcon={<FaUserCheck />}
            onClick={onDraftPlayer}
            disabled={!hasCurrentPlayer}
            sx={{
              flex: 1,
              backgroundColor: "#22c55e",
              color: "#06110a",
              fontWeight: 800,
              "&:hover": { backgroundColor: "#16a34a" },
            }}
          >
            Draft Player
          </Button>
          <Button
            variant="outlined"
            onClick={onClearPlayer}
            disabled={!hasCurrentPlayer}
            sx={{
              flex: 1,
              borderColor: "#f97316",
              color: "#fdba74",
              fontWeight: 800,
              "&:hover": {
                borderColor: "#fb923c",
                backgroundColor: "rgba(249, 115, 22, 0.12)",
              },
            }}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            startIcon={<FaPlus />}
            onClick={onAddPlayer}
            sx={{
              flex: 1,
              borderColor: "#a855f7",
              color: "#d8b4fe",
              fontWeight: 800,
              "&:hover": {
                borderColor: "#c084fc",
                backgroundColor: "rgba(168, 85, 247, 0.12)",
              },
            }}
          >
            Add Player
          </Button>
        </div>
      </div>
    </section>
  );
};

const buildPivotNote = (player, anchor) => {
  const playerValue = toNumber(player.NonSuperFlexValue || player.auctionValue);
  const anchorValue = toNumber(anchor.NonSuperFlexValue || anchor.auctionValue);
  const playerMax = toNumber(player.SuperFlexValue || player.maxBid, playerValue);
  const anchorMax = toNumber(anchor.SuperFlexValue || anchor.maxBid, anchorValue);
  const playerTier = toNumber(player.Tier ?? player.tier, 99);
  const anchorTier = toNumber(anchor.Tier ?? anchor.tier, 99);
  const playerPoints = toNumber(player.ProjectedPoints ?? player.projectedPoints);
  const anchorPoints = toNumber(anchor.ProjectedPoints ?? anchor.projectedPoints);

  if (playerTier <= anchorTier && playerValue >= anchorValue * 0.9) {
    return "Elite alternative if bidding exceeds Max Value.";
  }

  if (playerValue < anchorValue * 0.85 && playerPoints >= anchorPoints * 0.9) {
    return "Slight discount with similar projection.";
  }

  if (playerMax > anchorMax && playerValue <= anchorValue) {
    return "Higher upside for lower cost.";
  }

  if (playerValue < anchorValue * 0.7) {
    return "Budget fallback if top tier dries up.";
  }

  return "Best value remaining.";
};

const getComparableAvailablePlayers = (currentAuction, players) => {
  const currentPlayerId = currentAuction?.DatabaseID || currentAuction?.id;
  const anchor =
    players.find((player) => player.id === currentPlayerId || player.DatabaseID === currentPlayerId) ||
    currentAuction;
  const anchorPosition = anchor?.Position || anchor?.position;
  const anchorValue = toNumber(anchor?.NonSuperFlexValue || anchor?.auctionValue);
  const anchorMax = toNumber(anchor?.SuperFlexValue || anchor?.maxBid, anchorValue);
  const anchorRank = toNumber(anchor?.PositionRank ?? anchor?.rank, 999);
  const anchorTier = toNumber(anchor?.Tier ?? anchor?.tier, 99);
  const anchorPoints = toNumber(anchor?.ProjectedPoints ?? anchor?.projectedPoints);

  if (!currentPlayerId || !anchorPosition || anchorValue <= 0) return [];

  const baseCandidates = players
    .filter((player) => {
      const playerId = player.DatabaseID || player.id;
      const draftStatus = normalizeStatus(player.DraftStatus);
      const status = normalizeStatus(player.Status);
      const availability = normalizeStatus(player.availability || player.Availability);
      const playerValue = toNumber(player.NonSuperFlexValue || player.auctionValue);

      return (
        (player.Position || player.position) === anchorPosition &&
        playerId !== currentPlayerId &&
        playerValue > 0 &&
        draftStatus !== "drafted" &&
        draftStatus !== "unavailable" &&
        status !== "unavailable" &&
        status !== "inactive" &&
        availability !== "unavailable" &&
        player.available !== false &&
        player.Available !== false
      );
    })
    .map((player) => {
      const playerValue = toNumber(player.NonSuperFlexValue || player.auctionValue);
      const playerMax = toNumber(player.SuperFlexValue || player.maxBid, playerValue);
      const playerRank = toNumber(player.PositionRank ?? player.rank, 999);
      const playerTier = toNumber(player.Tier ?? player.tier, 99);
      const playerPoints = toNumber(player.ProjectedPoints ?? player.projectedPoints);
      const valueSimilarity = Math.max(0, 1 - Math.abs(playerValue - anchorValue) / Math.max(anchorValue, 1));
      const rankSimilarity = Math.max(0, 1 - Math.abs(playerRank - anchorRank) / 40);
      const tierSimilarity = Math.max(0, 1 - Math.abs(playerTier - anchorTier) / 3);
      const pointsSimilarity =
        anchorPoints > 0 ? Math.max(0, 1 - Math.abs(playerPoints - anchorPoints) / anchorPoints) : 0.5;
      const score =
        tierSimilarity * 35 +
        rankSimilarity * 20 +
        valueSimilarity * 20 +
        pointsSimilarity * 15 +
        Math.min(toNumber(player.ddScore), 100) * 0.05 +
        Math.min(toNumber(player.sleeperScore), 100) * 0.05;
      const qualityFloor = Math.max(anchorValue * 0.35, anchorPosition === "QB" || anchorPosition === "TE" ? 1 : 5);
      const isQualityPivot =
        playerValue >= qualityFloor &&
        playerRank <= Math.max(anchorRank + 35, 36) &&
        playerTier <= Math.max(anchorTier + 3, 4);

      return {
        ...player,
        comparisonScore: score,
        isQualityPivot,
        pivotNote: buildPivotNote(
          {
            ...player,
            NonSuperFlexValue: playerValue,
            SuperFlexValue: playerMax,
            PositionRank: playerRank,
            Tier: playerTier,
            ProjectedPoints: playerPoints,
          },
          {
            ...anchor,
            NonSuperFlexValue: anchorValue,
            SuperFlexValue: anchorMax,
            PositionRank: anchorRank,
            Tier: anchorTier,
            ProjectedPoints: anchorPoints,
          }
        ),
      };
    })
    .filter((player) => player.isQualityPivot)
    .sort((firstPlayer, secondPlayer) => secondPlayer.comparisonScore - firstPlayer.comparisonScore);

  const selected = [];
  [0.2, 0.35, 0.5, 0.75, 1].some((tolerance) => {
    baseCandidates
      .filter((player) => {
        const playerValue = toNumber(player.NonSuperFlexValue || player.auctionValue);
        return Math.abs(playerValue - anchorValue) / Math.max(anchorValue, 1) <= tolerance;
      })
      .forEach((player) => {
        if (selected.length < 5 && !selected.some((item) => item.id === player.id)) {
          selected.push(player);
        }
      });

    return selected.length >= 5 || (selected.length >= 3 && tolerance >= 0.5);
  });

  return selected.slice(0, 5);
};

const getPlayerPosition = (player) => player?.Position || player?.position || "";

const getTeamBudget = (team, leagueSettings) =>
  toNumber(team?.TeamAmount, toNumber(leagueSettings?.Budget, 200));

const getStarterSlotsForPosition = (position, leagueSettings) => {
  const slotMap = {
    QB: leagueSettings?.QBPlayers,
    RB: leagueSettings?.RBPlayers,
    WR: leagueSettings?.WRPlayers,
    TE: leagueSettings?.TEPlayers,
    DST: leagueSettings?.DEFPlayers,
    DEF: leagueSettings?.DEFPlayers,
    K: leagueSettings?.KPlayers,
  };

  return Math.max(toNumber(slotMap[position], ["QB", "TE", "DST", "DEF", "K"].includes(position) ? 1 : 2), 1);
};

const getTotalRosterSlots = (leagueSettings) => {
  const total = [
    leagueSettings?.QBPlayers,
    leagueSettings?.RBPlayers,
    leagueSettings?.WRPlayers,
    leagueSettings?.TEPlayers,
    leagueSettings?.FLEXPlayers,
    leagueSettings?.DEFPlayers,
    leagueSettings?.KPlayers,
  ].reduce((sum, slotCount) => sum + toNumber(slotCount), 0);

  return total > 0 ? total : 16;
};

const getTeamNeedsForThreat = (teamPlayers, leagueSettings) => {
  const positionCounts = teamPlayers.reduce((counts, player) => {
    const position = getPlayerPosition(player);
    return {
      ...counts,
      [position]: (counts[position] || 0) + 1,
    };
  }, {});

  return ["QB", "RB", "WR", "TE"].flatMap((position) => {
    const needed = Math.max(getStarterSlotsForPosition(position, leagueSettings) - (positionCounts[position] || 0), 0);
    return Array.from({ length: needed }, (_, index) => (needed > 1 ? `${position}${index + 1}` : position));
  });
};

const getThreatLevel = (score) => {
  if (score >= 75) return { label: "High", color: "text-red-400", badge: "bg-red-500/15 border-red-500/40" };
  if (score >= 50) return { label: "Medium", color: "text-amber-400", badge: "bg-amber-500/15 border-amber-500/40" };
  if (score >= 25) return { label: "Low", color: "text-green-500", badge: "bg-green-500/15 border-green-500/40" };
  return { label: "Very Low", color: "text-gray-400", badge: "bg-gray-500/10 border-gray-500/30" };
};

const getTeamThreatAnalysis = ({
  currentAuction,
  leagueSettings,
  myTeam,
  players,
  teams,
  teamRosters,
}) => {
  const currentPlayerId = currentAuction?.DatabaseID || currentAuction?.id;
  const currentPosition = currentAuction?.Position || currentAuction?.position;
  const currentValue = toNumber(currentAuction?.NonSuperFlexValue || currentAuction?.auctionValue);
  const currentMax = toNumber(currentAuction?.SuperFlexValue || currentAuction?.maxBid, currentValue);
  const currentTier = toNumber(currentAuction?.Tier ?? currentAuction?.tier, 99);

  if (!currentPlayerId || !currentPosition || currentValue <= 0) return [];

  const availableAtPosition = players.filter((player) => {
    const draftStatus = normalizeStatus(player.DraftStatus);
    const status = normalizeStatus(player.Status);
    return (
      getPlayerPosition(player) === currentPosition &&
      toNumber(player.NonSuperFlexValue || player.auctionValue) > 0 &&
      draftStatus !== "drafted" &&
      draftStatus !== "unavailable" &&
      status !== "unavailable" &&
      status !== "inactive" &&
      player.available !== false &&
      player.Available !== false
    );
  }).length;
  const scarcityScore = currentTier <= 2 ? 1 : Math.max(0.2, 1 - availableAtPosition / 18);
  const totalRosterSlots = getTotalRosterSlots(leagueSettings);

  return teams
    .filter((team) => team.id !== myTeam?.id)
    .map((team) => {
      const roster = teamRosters[team.id] || [];
      const totalSpent = roster.reduce((sum, player) => sum + toNumber(player.DraftAmount), 0);
      const budgetLeft = Math.max(getTeamBudget(team, leagueSettings) - totalSpent, 0);
      const remainingSlots = Math.max(totalRosterSlots - roster.length, 0);
      const maxBid = Math.max(budgetLeft - Math.max(remainingSlots - 1, 0), 0);
      const positionPlayers = roster.filter((player) => getPlayerPosition(player) === currentPosition);
      const starterSlots = getStarterSlotsForPosition(currentPosition, leagueSettings);
      const emptyStarterSlots = Math.max(starterSlots - positionPlayers.length, 0);
      const positionNeedScore = emptyStarterSlots > 0 ? 1 : 0;
      const budgetPowerScore = Math.min(Math.max(maxBid / Math.max(currentMax, currentValue, 1), budgetLeft / Math.max(currentValue * 1.25, 1)), 1);
      const emptySlotScore = Math.min(emptyStarterSlots / Math.max(starterSlots, 1), 1);
      const positionSpend = positionPlayers.reduce((sum, player) => sum + toNumber(player.DraftAmount), 0);
      const averagePositionSpend = positionSpend / Math.max(positionPlayers.length, 1);
      const spendingScore = Math.min(Math.max(averagePositionSpend / Math.max(currentValue, 1), positionSpend / Math.max(getTeamBudget(team, leagueSettings) * 0.28, 1)), 1);
      const flexibilityScore = Math.min(remainingSlots / Math.max(totalRosterSlots, 1), 1);
      const threatScore = Math.round(
        positionNeedScore * 30 +
          budgetPowerScore * 25 +
          emptySlotScore * 15 +
          scarcityScore * 15 +
          spendingScore * 10 +
          flexibilityScore * 5
      );
      const needs = getTeamNeedsForThreat(roster, leagueSettings);
      const relevantNeeds = needs
        .filter((need) => need.startsWith(currentPosition) || ["RB", "WR", "TE"].includes(need))
        .slice(0, 2);
      const legitimateThreat =
        positionNeedScore > 0 ||
        maxBid >= currentMax ||
        maxBid >= currentValue ||
        emptyStarterSlots > 0 ||
        spendingScore >= 0.7 ||
        (budgetPowerScore >= 0.65 && remainingSlots >= 3);
      const winChance = Math.min(
        95,
        Math.max(3, Math.round(threatScore * 0.68 + budgetPowerScore * 18 + positionNeedScore * 9))
      );

      return {
        budgetLeft,
        maxBid,
        needs: relevantNeeds.length > 0 ? relevantNeeds : needs.slice(0, 2),
        team,
        threatLevel: getThreatLevel(threatScore),
        threatScore,
        winChance,
        legitimateThreat,
      };
    })
    .filter((analysis) => analysis.legitimateThreat && analysis.threatScore >= 25)
    .sort((firstTeam, secondTeam) => secondTeam.threatScore - firstTeam.threatScore);
};

const getPositionWishlistPlayers = (currentAuction, targetedPlayers, players, teamRosters) => {
  const currentPlayerId = currentAuction?.DatabaseID || currentAuction?.id;
  const currentPosition = currentAuction?.Position || currentAuction?.position;

  if (!currentPlayerId || !currentPosition) return [];

  const masterPlayersById = new Map(
    players.map((player) => [player.DatabaseID || player.id, player])
  );
  const draftedPlayerIds = new Set(
    Object.values(teamRosters || {})
      .flat()
      .map((player) => player.DatabaseID || player.id)
      .filter(Boolean)
  );

  return targetedPlayers
    .map((targetedPlayer) => {
      const playerId = targetedPlayer.playerId || targetedPlayer.DatabaseID || targetedPlayer.id;
      const masterPlayer = masterPlayersById.get(playerId) || {};

      return {
        ...targetedPlayer,
        ...masterPlayer,
        id: playerId,
        DatabaseID: playerId,
        FullName:
          masterPlayer.FullName ||
          masterPlayer.fullName ||
          targetedPlayer.name ||
          targetedPlayer.FullName ||
          targetedPlayer.fullName ||
          "",
        NonSuperFlexValue:
          masterPlayer.NonSuperFlexValue ??
          masterPlayer.auctionValue ??
          targetedPlayer.auctionValue ??
          targetedPlayer.NonSuperFlexValue ??
          0,
        Position:
          masterPlayer.Position ||
          masterPlayer.position ||
          targetedPlayer.position ||
          targetedPlayer.Position ||
          "",
        PositionRank:
          masterPlayer.PositionRank ??
          masterPlayer.rank ??
          targetedPlayer.positionRank ??
          targetedPlayer.rank ??
          "",
        SuperFlexValue:
          masterPlayer.SuperFlexValue ??
          masterPlayer.maxBid ??
          targetedPlayer.maxBid ??
          targetedPlayer.hardMaxBid ??
          targetedPlayer.SuperFlexValue ??
          0,
        Team:
          masterPlayer.Team ||
          masterPlayer.nflTeam ||
          targetedPlayer.team ||
          targetedPlayer.Team ||
          "",
        Tier:
          masterPlayer.Tier ??
          masterPlayer.tier ??
          targetedPlayer.tier ??
          targetedPlayer.Tier ??
          "",
        hardMax:
          masterPlayer.hardMax ??
          targetedPlayer.hardMaxBid ??
          targetedPlayer.hardMax ??
          0,
        maxBid:
          masterPlayer.maxBid ??
          targetedPlayer.maxBid ??
          targetedPlayer.hardMaxBid ??
          0,
        watchlist: targetedPlayer.watchlist,
        leagueTeam: targetedPlayer.leagueTeam,
        leagueTeamNumber: targetedPlayer.leagueTeamNumber,
        purchasePrice: targetedPlayer.purchasePrice,
      };
    })
    .filter((player) => {
      const playerId = player.DatabaseID || player.id;
      const draftStatus = normalizeStatus(player.DraftStatus);
      const status = normalizeStatus(player.Status);
      const availability = normalizeStatus(player.availability || player.Availability);
      const playerPosition = getPlayerPosition(player);

      return (
        Boolean(player.watchlist) &&
        playerPosition.toUpperCase() === `${currentPosition}`.toUpperCase() &&
        playerId !== currentPlayerId &&
        !draftedPlayerIds.has(playerId) &&
        !hasTextValue(player.leagueTeamNumber) &&
        !hasTextValue(player.leagueTeam) &&
        draftStatus !== "drafted" &&
        draftStatus !== "unavailable" &&
        status !== "unavailable" &&
        status !== "inactive" &&
        availability !== "unavailable" &&
        player.available !== false &&
        player.Available !== false
      );
    })
    .sort(
      (firstPlayer, secondPlayer) =>
        toNumber(firstPlayer.PositionRank ?? firstPlayer.rank, 999) -
          toNumber(secondPlayer.PositionRank ?? secondPlayer.rank, 999) ||
        toNumber(secondPlayer.NonSuperFlexValue || secondPlayer.auctionValue) -
          toNumber(firstPlayer.NonSuperFlexValue || firstPlayer.auctionValue)
    );
};

const getPlayerMaxValue = (player) =>
  toNumber(player?.SuperFlexValue || player?.maxBid || player?.NonSuperFlexValue || player?.auctionValue);

const getPlayerHardMaxValue = (player) => {
  const hardMax = toNumber(player?.hardMax || player?.HardMax || player?.HardMaxValue);

  if (hardMax > 0) return hardMax;

  return Math.ceil(getPlayerMaxValue(player) * 1.08);
};

const ComparableAvailablePlayersCard = ({ currentAuction, players }) => {
  const comparablePlayers = useMemo(
    () => getComparableAvailablePlayers(currentAuction, players),
    [currentAuction, players]
  );
  const hasCurrentPlayer = Boolean(currentAuction?.DatabaseID || currentAuction?.id);

  return (
    <section className="w-full h-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          Comparable Available Players
        </p>
      </div>

      {!hasCurrentPlayer ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          Add a current auction player to see realistic pivots.
        </p>
      ) : comparablePlayers.length === 0 ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          No legitimate comparable pivots available.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[36%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#26313a] text-sm uppercase text-gray-500 dark:text-gray-400">
                <th className="py-2.5 pr-3 font-bold">Player</th>
                <th className="py-2.5 px-2 font-bold">Rank</th>
                <th className="py-2.5 px-2 font-bold">Tier</th>
                <th className="py-2.5 px-2 font-bold">Value</th>
                <th className="py-2.5 px-2 font-bold">Max Value</th>
                <th className="py-2.5 pl-2 font-bold">AI Pivot Note</th>
              </tr>
            </thead>
            <tbody>
              {comparablePlayers.map((player) => (
                <tr
                  className="border-b border-gray-100 dark:border-[#202a32] last:border-b-0"
                  key={player.DatabaseID || player.id}
                >
                  <td className="py-3 pr-3">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {player.FullName || player.fullName}
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-500 dark:text-gray-400">
                      {player.Team || player.nflTeam || "FA"} · {player.Position || player.position}
                    </p>
                  </td>
                  <td className="py-3 px-2 text-lg font-bold text-gray-800 dark:text-gray-100">
                    {statValue(player.PositionRank ?? player.rank)}
                  </td>
                  <td className="py-3 px-2 text-lg font-bold text-purple-300">
                    {statValue(player.Tier ?? player.tier)}
                  </td>
                  <td className="py-3 px-2 text-lg font-bold text-green-500">
                    {currency(player.NonSuperFlexValue || player.auctionValue)}
                  </td>
                  <td className="py-3 px-2 text-lg font-bold text-blue-400">
                    {currency(player.SuperFlexValue || player.maxBid || player.NonSuperFlexValue)}
                  </td>
                  <td className="py-3 pl-2 text-base font-semibold text-gray-600 dark:text-gray-300 whitespace-normal break-words">
                    {player.pivotNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const TeamThreatAnalysisCard = ({
  currentAuction,
  leagueSettings,
  myTeam,
  players,
  teamRosters,
  teams,
}) => {
  const threats = useMemo(
    () =>
      getTeamThreatAnalysis({
        currentAuction,
        leagueSettings,
        myTeam,
        players,
        teamRosters,
        teams,
      }),
    [currentAuction, leagueSettings, myTeam, players, teamRosters, teams]
  );
  const hasCurrentPlayer = Boolean(currentAuction?.DatabaseID || currentAuction?.id);

  return (
    <section className="w-full h-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          Team Threat Analysis
        </p>
      </div>

      {!hasCurrentPlayer ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          Add a current auction player to identify the most likely bidders.
        </p>
      ) : threats.length === 0 ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          No major threats detected. Most teams either lack budget, roster need, or incentive to chase this player.
        </p>
      ) : (
        <div className="mt-4 max-h-[455px] overflow-y-auto overscroll-contain pr-1">
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[18%]" />
                <col className="w-[20%]" />
                <col className="w-[22%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-white dark:bg-secondary-dark-bg">
                <tr className="border-b border-gray-200 dark:border-[#26313a] text-sm uppercase text-gray-500 dark:text-gray-400">
                  <th className="py-2.5 pr-3 font-bold">Team</th>
                  <th className="py-2.5 px-2 font-bold">Budget Left</th>
                  <th className="py-2.5 px-2 font-bold">Needs</th>
                  <th className="py-2.5 px-2 font-bold">Threat Level</th>
                  <th className="py-2.5 pl-2 font-bold">Win Chance</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((threat) => (
                  <tr
                    className="border-b border-gray-100 dark:border-[#202a32] last:border-b-0"
                    key={threat.team.id}
                  >
                    <td className="py-3 pr-3">
                      <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {threat.team.TeamName}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-lg font-bold text-green-500">
                      {currency(threat.budgetLeft)}
                    </td>
                    <td className="py-3 px-2 text-base font-bold text-gray-700 dark:text-gray-200">
                      {threat.needs.length > 0 ? threat.needs.join(", ") : "--"}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-base font-bold ${threat.threatLevel.color} ${threat.threatLevel.badge}`}
                      >
                        {threat.threatLevel.label}
                      </span>
                    </td>
                    <td className={`py-3 pl-2 text-lg font-bold ${threat.threatLevel.color}`}>
                      {threat.winChance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </section>
  );
};

const PositionWishlistCard = ({ currentAuction, players, targetedPlayers, teamRosters }) => {
  const wishlistPlayers = useMemo(
    () => getPositionWishlistPlayers(currentAuction, targetedPlayers, players, teamRosters),
    [currentAuction, players, targetedPlayers, teamRosters]
  );
  const hasCurrentPlayer = Boolean(currentAuction?.DatabaseID || currentAuction?.id);
  const currentPosition = currentAuction?.Position || currentAuction?.position || "";

  return (
    <section className="w-full h-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          {currentPosition ? `${currentPosition} Wishlist` : "Position Wishlist"}
        </p>
      </div>

      {!hasCurrentPlayer ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          Add a current auction player to see matching wishlist targets.
        </p>
      ) : wishlistPlayers.length === 0 ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          No available {currentPosition} wishlist players.
        </p>
      ) : (
        <div className="mt-4 h-[455px] overflow-y-auto overscroll-contain pr-1">
          <div className="divide-y divide-gray-100 dark:divide-[#202a32]">
            {wishlistPlayers.map((player) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_64px_64px_64px] items-center gap-3 py-3"
                key={player.DatabaseID || player.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
                    {player.FullName || player.fullName || "Unknown Player"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Rank {statValue(player.PositionRank ?? player.rank)} · Tier{" "}
                    {statValue(player.Tier ?? player.tier)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                    Value
                  </p>
                  <p className="text-lg font-bold text-green-500">
                    {currency(player.NonSuperFlexValue || player.auctionValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                    Max
                  </p>
                  <p className="text-lg font-bold text-blue-400">
                    {currency(getPlayerMaxValue(player))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                    Hard
                  </p>
                  <p className="text-lg font-bold text-red-400">
                    {currency(getPlayerHardMaxValue(player))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const DynastyDestroyerAiCard = () => (
  <section className="w-full min-h-[520px] p-6 md:p-8 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
    <div className="flex items-center gap-3 pb-5 border-b border-gray-200 dark:border-[#202a32]">
      <span className="h-10 w-10 rounded-full border border-purple-400/40 bg-purple-500/15 text-purple-300 flex items-center justify-center">
        <FiCpu />
      </span>
      <h2 className="text-2xl font-bold uppercase tracking-wide text-purple-400">
        Strategy
      </h2>
      <span className="px-3 py-1 rounded-md bg-purple-500/20 text-purple-200 text-xs font-bold">
        BETA
      </span>
    </div>

    <div className="mt-6 rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-5">
      <div className="flex items-center gap-2 text-green-500 uppercase text-sm font-bold tracking-wide">
        <FiPlus />
        <span>Current Recommendation</span>
      </div>

      <div className="mt-5 flex gap-4">
        <div className="h-14 w-14 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
          <FiTarget size={28} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            Bid aggressively to <span className="text-green-500">$63</span>.
            <br />
            Stop at $66 unless Team A is your only competitor.
          </p>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            There are still 4 usable RB2s available, so do not hit Hard Max unless
            you&apos;re locking a top-tier advantage.
          </p>
        </div>
      </div>

      <div className="my-5 border-t border-gray-200 dark:border-[#26313a]" />

      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
          <FiActivity size={24} />
        </div>
        <div>
          <p className="text-purple-400 uppercase text-sm font-bold tracking-wide">
            Nomination Strategy
          </p>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
            Nominate expensive WRs next to drain Team A and Team B before you target
            your next RB.
          </p>
        </div>
      </div>

      <div className="my-5 border-t border-gray-200 dark:border-[#26313a]" />

      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
          <FiTrendingUp size={24} />
        </div>
        <div>
          <p className="text-blue-400 uppercase text-sm font-bold tracking-wide">
            Market Read
          </p>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
            RB prices are currently 12% above expected. WR values are still stable.
            Pivoting to WR may give better total roster value.
          </p>
        </div>
      </div>
    </div>

    <div className="mt-6 flex items-center gap-4">
      <p className="text-sm uppercase font-bold text-gray-600 dark:text-gray-300">
        Confidence Level
      </p>
      <p className="text-green-500 font-bold">High</p>
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <span
            className="h-4 flex-1 rounded bg-green-500"
            key={`confidence-filled-${item}`}
          />
        ))}
        <span className="h-4 flex-1 rounded bg-gray-300 dark:bg-[#303840]" />
      </div>
    </div>
  </section>
);

const MyTeamSnapshotCard = ({ draftedPlayers, leagueSettings, myTeam }) => {
  const [draftedPlayersPage, setDraftedPlayersPage] = useState(1);
  const budget = toNumber(leagueSettings?.Budget, 200);
  const filledSlots = draftedPlayers.length;
  const totalSlots = [
    leagueSettings?.QBPlayers,
    leagueSettings?.RBPlayers,
    leagueSettings?.WRPlayers,
    leagueSettings?.TEPlayers,
    leagueSettings?.FLEXPlayers,
    leagueSettings?.DEFPlayers,
    leagueSettings?.KPlayers,
  ].reduce((total, slotCount) => total + toNumber(slotCount), 0);
  const normalizedTotalSlots = totalSlots > 0 ? totalSlots : 16;
  const totalSpent = draftedPlayers.reduce(
    (total, player) => total + toNumber(player.DraftAmount),
    0
  );
  const budgetLeft = Math.max(budget - totalSpent, 0);
  const filledPercent = Math.min((filledSlots / Math.max(normalizedTotalSlots, 1)) * 100, 100);
  const allocationRules = Array.isArray(leagueSettings?.AllocationRules)
    ? leagueSettings.AllocationRules
    : [];
  const getAllocationTarget = (position, targetType, fallbackPercent) => {
    const rule = allocationRules.find(
      (allocationRule) => allocationRule.position?.toUpperCase() === position
    );
    const percentField = targetType === "min" ? "minPercent" : "maxPercent";
    return Math.round((budget * toNumber(rule?.[percentField], fallbackPercent)) / 100);
  };
  const positionSpendRows = [
    { label: "QB", positions: ["QB"], limit: getAllocationTarget("QB", "min", 5) },
    { label: "RB", positions: ["RB"], limit: getAllocationTarget("RB", "max", 45) },
    { label: "WR", positions: ["WR"], limit: getAllocationTarget("WR", "max", 45) },
    { label: "TE", positions: ["TE"], limit: getAllocationTarget("TE", "min", 5) },
    { label: "DST", positions: ["DST", "DEF"], limit: getAllocationTarget("DST", "max", 5) },
    { label: "K", positions: ["K"], limit: getAllocationTarget("K", "max", 2) },
  ].map((row) => {
    const spent = draftedPlayers
      .filter((player) => row.positions.includes(player.Position))
      .reduce((total, player) => total + toNumber(player.DraftAmount), 0);

    return {
      ...row,
      spent,
      percent: Math.min((spent / Math.max(row.limit, 1)) * 100, 100),
    };
  });
  const positionCounts = draftedPlayers.reduce((counts, player) => {
    const position = player.Position || "UNK";
    return {
      ...counts,
      [position]: (counts[position] || 0) + 1,
    };
  }, {});
  const teamNeeds = [
    { label: "QB", needed: Math.max(toNumber(leagueSettings?.QBPlayers, 1) - (positionCounts.QB || 0), 0) },
    { label: "RB", needed: Math.max(toNumber(leagueSettings?.RBPlayers, 2) - (positionCounts.RB || 0), 0) },
    { label: "WR", needed: Math.max(toNumber(leagueSettings?.WRPlayers, 2) - (positionCounts.WR || 0), 0) },
    { label: "TE", needed: Math.max(toNumber(leagueSettings?.TEPlayers, 1) - (positionCounts.TE || 0), 0) },
  ]
    .filter((need) => need.needed > 0)
    .flatMap((need) =>
      Array.from({ length: need.needed }, (_, index) =>
        need.needed > 1 ? `${need.label}${index + 1}` : need.label
      )
    )
    .slice(0, 4);
  const sortedDraftedPlayers = useMemo(
    () =>
      [...draftedPlayers].sort((firstPlayer, secondPlayer) => {
        const firstPosition = firstPlayer.Position || "";
        const secondPosition = secondPlayer.Position || "";
        if (firstPosition !== secondPosition) return firstPosition.localeCompare(secondPosition);

        return (firstPlayer.FullName || "").localeCompare(secondPlayer.FullName || "");
      }),
    [draftedPlayers]
  );
  const draftedPlayersPageCount = Math.max(
    1,
    Math.ceil(sortedDraftedPlayers.length / DRAFTED_PLAYERS_PAGE_SIZE)
  );
  const draftedPlayersPageItems = useMemo(() => {
    const startIndex = (draftedPlayersPage - 1) * DRAFTED_PLAYERS_PAGE_SIZE;
    return sortedDraftedPlayers.slice(
      startIndex,
      startIndex + DRAFTED_PLAYERS_PAGE_SIZE
    );
  }, [draftedPlayersPage, sortedDraftedPlayers]);
  const draftedPlayersPaginationItems = useMemo(
    () => getPaginationItems(draftedPlayersPageCount, draftedPlayersPage),
    [draftedPlayersPageCount, draftedPlayersPage]
  );

  useEffect(() => {
    setDraftedPlayersPage((currentPage) =>
      Math.min(Math.max(currentPage, 1), draftedPlayersPageCount)
    );
  }, [draftedPlayersPageCount]);

  return (
    <section className="w-full min-h-[520px] p-6 md:p-8 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          My Team Snapshot
        </p>
      </div>

      <div className="py-6 grid grid-cols-1 md:grid-cols-[1.55fr_0.72fr_0.72fr] gap-2 border-b border-gray-200 dark:border-[#202a32]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-16 w-16 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 flex items-center justify-center shrink-0">
            <FiShield size={32} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {myTeam?.TeamName || "My Team"}
          </p>
        </div>
        <div className="md:border-l md:border-gray-200 md:dark:border-[#26313a] md:pl-3 min-w-0">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
            Total Spent
          </p>
          <p className="mt-2 text-2xl font-bold text-green-500">
            {currency(totalSpent)}
          </p>
        </div>
        <div className="md:border-l md:border-gray-200 md:dark:border-[#26313a] md:pl-3 min-w-0">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
            Budget Left
          </p>
          <p className="mt-2 text-2xl font-bold text-red-400">
            {currency(budgetLeft)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-[0.7fr_2.05fr_0.75fr] gap-4">
        <div>
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
            Slots Filled
          </p>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            {filledSlots} / {normalizedTotalSlots}
          </p>
          <div className="mt-5 h-3 rounded-full bg-gray-200 dark:bg-[#232b32] overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${filledPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-4">
            Position Spend
          </p>
          <div className="space-y-3">
            {positionSpendRows.map((row) => (
              <div className="grid grid-cols-[42px_1fr_112px] items-center gap-4" key={row.label}>
                <span className="text-base font-bold text-gray-700 dark:text-gray-200">
                  {row.label}
                </span>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-[#2a3238] overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="text-base font-bold text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">
                  {currency(row.spent)} / {currency(row.limit)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-3">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
              Team Needs
            </p>
            <div className="mt-3 space-y-1.5">
              {(teamNeeds.length > 0 ? teamNeeds : ["Depth"]).map((need, index) => (
                <p
                  className={`text-base font-bold ${
                    index < 2 ? "text-red-400" : "text-amber-400"
                  }`}
                  key={`${need}-${index}`}
                >
                  {index + 1}. {need}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-3">
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
              Risk Level
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-lg font-bold text-amber-400">Balanced</p>
              <svg
                aria-hidden="true"
                className="h-12 w-20 shrink-0"
                viewBox="0 0 80 48"
              >
                <path
                  d="M14 42 A26 26 0 0 1 66 42"
                  fill="none"
                  stroke="#fbbf24"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <path
                  d="M55.6 18.2 A26 26 0 0 1 66 42"
                  fill="none"
                  stroke="#f87171"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <line
                  stroke="#fde047"
                  strokeLinecap="round"
                  strokeWidth="4"
                  x1="40"
                  x2="63"
                  y1="42"
                  y2="20"
                />
                <circle cx="40" cy="42" fill="#fbbf24" r="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="players-page mt-5 rounded-lg border border-gray-200 dark:border-[#26313a] bg-white dark:bg-secondary-dark-bg overflow-hidden">
        {sortedDraftedPlayers.length === 0 ? (
          <div className="players-empty-state target-board-wishlist-empty">
            No drafted players yet.
          </div>
        ) : (
          <>
            <div className="target-board-wishlist-list">
              {draftedPlayersPageItems.map((player, index) => {
                const playerName = player.FullName || player.fullName || "Unknown Player";
                const playerPosition = player.Position || player.position || "--";
                const playerTeam = player.Team || player.nflTeam || "FA";
                const playerValue = getFirstValue(
                  player.DraftAmount,
                  player.NonSuperFlexValue,
                  player.auctionValue,
                  0
                );

                return (
                  <div
                    className="target-board-wishlist-row"
                    key={player.DatabaseID || player.id || `${playerName}-${index}`}
                    style={{
                      cursor: "default",
                      gridTemplateColumns: "minmax(0, 1fr) 104px",
                      minHeight: 74,
                    }}
                  >
                    <span className="target-board-wishlist-player">
                      <span
                        className="target-board-wishlist-name"
                        style={{ fontSize: 20 }}
                      >
                        {playerName}
                      </span>
                      <span
                        className="target-board-meta"
                        style={{ fontSize: 15 }}
                      >
                        {playerPosition} <span>•</span> {playerTeam}
                      </span>
                    </span>
                    <span
                      className="target-board-wishlist-value"
                      style={{ fontSize: 20 }}
                    >
                      {currency(playerValue)}
                    </span>
                  </div>
                );
              })}
            </div>

            {draftedPlayersPageCount > 1 && (
              <div className="target-board-pagination target-board-wishlist-pagination">
                <button
                  aria-label="Previous drafted players page"
                  className="target-board-page-button"
                  disabled={draftedPlayersPage === 1}
                  onClick={() => setDraftedPlayersPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  <FiChevronLeft />
                </button>
                {draftedPlayersPaginationItems.map((pageItem, index) =>
                  pageItem === "ellipsis" ? (
                    <span
                      className="target-board-page-button target-board-page-ellipsis"
                      key={`drafted-ellipsis-${index}`}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      className={`target-board-page-button ${
                        draftedPlayersPage === pageItem ? "active" : ""
                      }`}
                      key={pageItem}
                      onClick={() => setDraftedPlayersPage(pageItem)}
                      type="button"
                    >
                      {pageItem}
                    </button>
                  )
                )}
                <button
                  aria-label="Next drafted players page"
                  className="target-board-page-button"
                  disabled={draftedPlayersPage === draftedPlayersPageCount}
                  onClick={() =>
                    setDraftedPlayersPage((page) =>
                      Math.min(draftedPlayersPageCount, page + 1)
                    )
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
    </section>
  );
};

const BigDawgsDraftCommandCenter = () => {
  const { currentUser } = useAuth();
  const [currentAuction, setCurrentAuction] = useState(emptyAuction);
  const [draftedPlayers, setDraftedPlayers] = useState([]);
  const [teamRosters, setTeamRosters] = useState({});
  const [leagueSettings, setLeagueSettings] = useState({});
  const [players, setPlayers] = useState([]);
  const [targetedPlayers, setTargetedPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [playerSearchInput, setPlayerSearchInput] = useState("");
  const [nominatingTeamId, setNominatingTeamId] = useState("");
  const [nominatingTeamSearchInput, setNominatingTeamSearchInput] = useState("");
  const [openingBid, setOpeningBid] = useState("");
  const [draftTeamId, setDraftTeamId] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftAmountManuallyEdited, setDraftAmountManuallyEdited] = useState(false);
  const previousCurrentAuctionKeyRef = useRef("");

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId),
    [players, selectedPlayerId]
  );

  const selectedDraftTeam = useMemo(
    () => teams.find((team) => team.id === draftTeamId),
    [teams, draftTeamId]
  );

  const nominatingTeam = useMemo(
    () => teams.find((team) => team.id === nominatingTeamId),
    [teams, nominatingTeamId]
  );
  const myTeam = useMemo(
    () => teams.find((team) => team.MyTeam) || teams[0] || null,
    [teams]
  );

  const playerSearchOptions = useMemo(() => {
    const searchTerm = playerSearchInput.trim().toLowerCase();
    if (!searchTerm) return [];

    return players
      .filter((player) =>
        [
          player.FullName,
          player.SearchFullName,
          player.fullName,
          player.Position,
          player.position,
          player.Team,
          player.nflTeam,
        ]
          .filter(Boolean)
          .some((value) => `${value}`.toLowerCase().includes(searchTerm))
      )
      .slice(0, 75);
  }, [playerSearchInput, players]);

  const nominatingTeamOptions = useMemo(() => {
    const searchTerm = nominatingTeamSearchInput.trim().toLowerCase();
    if (!searchTerm) return [];

    return teams
      .filter((team) => `${team.TeamName || ""}`.toLowerCase().includes(searchTerm))
      .slice(0, 25);
  }, [nominatingTeamSearchInput, teams]);

  const hasCurrentPlayer = Boolean(currentAuction?.DatabaseID || currentAuction?.id);
  const currentAuctionKey = currentAuction?.DatabaseID || currentAuction?.id || "";

  useEffect(() => {
    if (!currentUser) return undefined;

    const currentAuctionRef = doc(
      db,
      "userprofile",
      currentUser.uid,
      "bigdawgdraft",
      "currentauction"
    );

    return onSnapshot(currentAuctionRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentAuction({ id: snapshot.id, ...snapshot.data() });
      } else {
        setCurrentAuction(emptyAuction);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (previousCurrentAuctionKeyRef.current === currentAuctionKey) return;

    previousCurrentAuctionKeyRef.current = currentAuctionKey;

    if (!currentAuctionKey) {
      setDraftAmount("");
      setDraftAmountManuallyEdited(false);
      return;
    }

    setDraftAmount(`${Number(currentAuction.CurrentBid || 0)}`);
    setDraftAmountManuallyEdited(false);
  }, [currentAuction.CurrentBid, currentAuctionKey]);

  useEffect(() => {
    if (!currentAuctionKey || draftAmountManuallyEdited) return;

    setDraftAmount(`${Number(currentAuction.CurrentBid || 0)}`);
  }, [currentAuction.CurrentBid, currentAuctionKey, draftAmountManuallyEdited]);

  useEffect(() => {
    if (!currentUser) return undefined;

    const leagueSettingsRef = doc(
      db,
      "userprofile",
      currentUser.uid,
      "leaguesettings",
      "settings"
    );

    return onSnapshot(leagueSettingsRef, (settingsSnapshot) => {
      const settingsData = settingsSnapshot.exists() ? settingsSnapshot.data() : {};
      const leagueTeams = settingsData?.LeagueTeams;

      setLeagueSettings(settingsData || {});

      setTeams(
        Array.isArray(leagueTeams)
          ? leagueTeams
              .filter((team) => `${team.TeamName || ""}`.trim() !== "")
              .map((team, index) => ({
                id: `${team.TeamNumber || index + 1}`,
                TeamName: team.TeamName,
                TeamNumber: team.TeamNumber || index + 1,
                TeamAmount: team.TeamAmount,
                MyTeam: team.MyTeam === true,
              }))
          : []
      );
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !myTeam?.id) {
      setDraftedPlayers([]);
      return undefined;
    }

    const draftedPlayersRef = collection(
      db,
      "userprofile",
      currentUser.uid,
      "bigdawgdraft",
      `${myTeam.id}`,
      "players"
    );

    return onSnapshot(
      draftedPlayersRef,
      (querySnapshot) => {
        setDraftedPlayers(
          querySnapshot.docs.map((playerDoc) => ({
            id: playerDoc.id,
            ...playerDoc.data(),
          }))
        );
      },
      (error) => {
        console.error("Error loading my drafted players:", error);
        setDraftedPlayers([]);
      }
    );
  }, [currentUser, myTeam?.id]);

  useEffect(() => {
    if (!currentUser || teams.length === 0) {
      setTeamRosters({});
      return undefined;
    }

    const unsubscribers = teams.map((team) => {
      const teamPlayersRef = collection(
        db,
        "userprofile",
        currentUser.uid,
        "bigdawgdraft",
        `${team.id}`,
        "players"
      );

      return onSnapshot(
        teamPlayersRef,
        (querySnapshot) => {
          setTeamRosters((currentRosters) => ({
            ...currentRosters,
            [team.id]: querySnapshot.docs.map((playerDoc) => ({
              id: playerDoc.id,
              ...playerDoc.data(),
            })),
          }));
        },
        (error) => {
          console.error(`Error loading drafted players for ${team.TeamName}:`, error);
          setTeamRosters((currentRosters) => ({
            ...currentRosters,
            [team.id]: [],
          }));
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUser, teams]);

  useEffect(() => {
    const playersQuery = query(
      collection(db, "players"),
      where("active", "==", true)
    );

    return onSnapshot(playersQuery, (querySnapshot) => {
      Promise.all(querySnapshot.docs.map(normalizeAuctionPlayer))
        .then((playerList) => setPlayers(playerList))
        .catch((error) => {
          console.error("Error loading command center players:", error);
          setPlayers([]);
        });
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setTargetedPlayers([]);
      return undefined;
    }

    const targetedPlayersRef = collection(
      db,
      "userprofile",
      currentUser.uid,
      "targetedPlayers"
    );

    return onSnapshot(
      targetedPlayersRef,
      (querySnapshot) => {
        setTargetedPlayers(
          querySnapshot.docs.map((targetedPlayerDoc) => ({
            id: targetedPlayerDoc.id,
            ...targetedPlayerDoc.data(),
          }))
        );
      },
      (error) => {
        console.error("Error loading command center wishlist players:", error);
        setTargetedPlayers([]);
      }
    );
  }, [currentUser]);

  const handleAddPlayer = async (event) => {
    event.preventDefault();
    if (!currentUser || !selectedPlayer) return;

    await CreateOrUpdateBigDawgCurrentAuction(currentUser.uid, selectedPlayer, {
      CurrentBid: openingBid,
      NominatedByTeamId: nominatingTeamId,
      NominatedByTeamName: nominatingTeam?.TeamName || "",
    });

    toast(`${selectedPlayer.FullName} added to Current Auction`);
    setShowAddPlayer(false);
    setSelectedPlayerId("");
    setPlayerSearchInput("");
    setNominatingTeamId("");
    setNominatingTeamSearchInput("");
    setOpeningBid("");
  };

  const handleDraftPlayer = async () => {
    if (!currentUser || !hasCurrentPlayer || !selectedDraftTeam || !draftAmount) {
      toast("Choose a team and draft amount first.");
      return;
    }

    await AddBigDawgDraftedPlayerToTeam(
      currentUser.uid,
      selectedDraftTeam.id,
      selectedDraftTeam.TeamName,
      currentAuction,
      draftAmount
    );
    await setPlayerDraftStatus(currentAuction.DatabaseID, "Drafted");
    await ClearBigDawgCurrentAuction(currentUser.uid);

    toast(`${currentAuction.FullName} drafted by ${selectedDraftTeam.TeamName}`);
    setDraftTeamId("");
    setDraftAmount("");
    setDraftAmountManuallyEdited(false);
  };

  const handleClearCurrentAuction = async () => {
    if (!currentUser || !hasCurrentPlayer) return;

    await ClearBigDawgCurrentAuction(currentUser.uid);
    setDraftTeamId("");
    setDraftAmount("");
    setDraftAmountManuallyEdited(false);
    toast("Current auction cleared.");
  };

  const handleCurrentBidChange = async (nextBid) => {
    if (!currentUser || !hasCurrentPlayer) return;

    await UpdateBigDawgCurrentAuctionBid(currentUser.uid, Math.max(0, nextBid));
  };

  return (
    <>
      <ToastContainer />
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Big Dawgs" title="Command Center" />
      </div>

      <div className="m-2 md:m-10 mt-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr_1.45fr] items-stretch gap-6">
          <CurrentAuctionCard
            currentAuction={currentAuction}
            teams={teams}
            draftTeamId={draftTeamId}
            draftAmount={draftAmount}
            hasCurrentPlayer={hasCurrentPlayer}
            onAddPlayer={() => setShowAddPlayer(true)}
            onClearPlayer={handleClearCurrentAuction}
            onCurrentBidChange={handleCurrentBidChange}
            onDraftAmountChange={(nextDraftAmount) => {
              setDraftAmountManuallyEdited(true);
              setDraftAmount(nextDraftAmount);
            }}
            onDraftPlayer={handleDraftPlayer}
            onDraftTeamChange={setDraftTeamId}
          />
          <DynastyDestroyerAiCard />
          <MyTeamSnapshotCard
            draftedPlayers={draftedPlayers}
            leagueSettings={leagueSettings}
            myTeam={myTeam}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.75fr_0.75fr_0.5fr] gap-6 items-stretch">
          <ComparableAvailablePlayersCard
            currentAuction={currentAuction}
            players={players}
          />
          <TeamThreatAnalysisCard
            currentAuction={currentAuction}
            leagueSettings={leagueSettings}
            myTeam={myTeam}
            players={players}
            teamRosters={teamRosters}
            teams={teams}
          />
          <PositionWishlistCard
            currentAuction={currentAuction}
            players={players}
            targetedPlayers={targetedPlayers}
            teamRosters={teamRosters}
          />
        </div>
      </div>

      <Dialog open={showAddPlayer} onClose={() => setShowAddPlayer(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleAddPlayer}>
          <DialogTitle>Add Player</DialogTitle>
          <DialogContent>
            <Autocomplete
              fullWidth
              options={playerSearchOptions}
              value={selectedPlayer || null}
              inputValue={playerSearchInput}
              onChange={(_, player) => setSelectedPlayerId(player?.id || "")}
              onInputChange={(_, value) => setPlayerSearchInput(value)}
              getOptionLabel={(player) =>
                player?.FullName || player?.fullName
                  ? `${player.FullName || player.fullName} (${player.Position || player.position || "--"} - ${player.Team || player.nflTeam || "FA"})`
                  : ""
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={
                playerSearchInput.trim()
                  ? "No matching players"
                  : "Start typing to search players"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Player"
                  margin="dense"
                />
              )}
            />
            <Autocomplete
              fullWidth
              options={nominatingTeamOptions}
              value={nominatingTeam || null}
              inputValue={nominatingTeamSearchInput}
              onChange={(_, team) => setNominatingTeamId(team?.id || "")}
              onInputChange={(_, value) => setNominatingTeamSearchInput(value)}
              getOptionLabel={(team) => team?.TeamName || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={
                nominatingTeamSearchInput.trim()
                  ? "No matching teams"
                  : "Start typing to search teams"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nominated By"
                  margin="dense"
                />
              )}
            />
            <TextField
              label="Opening Bid"
              type="number"
              fullWidth
              margin="dense"
              value={openingBid}
              onChange={(event) => setOpeningBid(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddPlayer(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Player
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default BigDawgsDraftCommandCenter;
