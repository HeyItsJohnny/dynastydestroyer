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
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
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
  ResetMockDraftData,
  UpdateBigDawgCurrentAuctionBid,
} from "../../globalFunctions/firebaseAuctionDraft";
import { getOpenAIDraftCommandCenterInsights } from "../../services/openAIKeeperService";

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
const MOCK_DRAFT_COLLECTION = "mockdraft";
const EXTENSION_SYNC_DOC_ID = "extensionsync";

const defaultExtensionSyncSettings = {
  syncEnabled: false,
  syncMode: "manual",
  extensionLastEventAt: null,
  extensionStatus: "waiting",
  extensionApiKey: "",
  connectionToken: "",
  currentDetectedPlayer: "",
  lastSoldPlayer: "",
  reviewQueueCount: 0,
};

const currency = (value) => `$${Number(value || 0).toLocaleString()}`;
const normalizeStatus = (value) => `${value ?? ""}`.trim().toLowerCase();

const statValue = (value) => {
  if (value === undefined || value === null || value === "") return "--";
  return value;
};

const getTimestampDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatSyncTimestamp = (value) => {
  const date = getTimestampDate(value);
  if (!date) return "--";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getSyncDisplayStatus = (syncSettings) => {
  const rawStatus = normalizeStatus(syncSettings.extensionStatus);

  if (!syncSettings.syncEnabled || syncSettings.syncMode === "manual") {
    return {
      label: "Chrome Extension Paused",
      color: "text-amber-400",
      badge: "bg-amber-500/15 border-amber-500/40",
    };
  }

  if (rawStatus === "error" || rawStatus === "failed") {
    return {
      label: "Chrome Extension Error",
      color: "text-red-400",
      badge: "bg-red-500/15 border-red-500/40",
    };
  }

  if (rawStatus === "connected" || rawStatus === "active" || rawStatus === "online") {
    return {
      label: "Chrome Extension Connected",
      color: "text-green-400",
      badge: "bg-green-500/15 border-green-500/40",
    };
  }

  return {
    label: "Chrome Extension Waiting",
    color: "text-blue-400",
    badge: "bg-blue-500/15 border-blue-500/40",
  };
};

const getSyncPlayerName = (value) => {
  if (!value) return "--";
  if (typeof value === "string") return value || "--";
  return value.FullName || value.fullName || value.name || value.playerName || "--";
};

const createConnectionToken = () =>
  `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

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

const MockDraftHeaderCard = ({
  connectionToken,
  onSyncEnabledChange,
  onSyncModeChange,
  syncSettings,
  syncStatus,
}) => {
  const currentDetectedPlayer = getSyncPlayerName(
    syncSettings.currentDetectedPlayer ||
      syncSettings.currentDetectedPlayerName ||
      syncSettings.detectedPlayer ||
      syncSettings.detectedPlayerName
  );
  const lastSoldPlayer = getSyncPlayerName(
    syncSettings.lastSoldPlayer ||
      syncSettings.lastSoldPlayerName ||
      syncSettings.soldPlayer ||
      syncSettings.soldPlayerName
  );

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <Header category="Big Dawgs" title="Mock Draft" />

        <div className="rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] px-4 py-3 w-full xl:max-w-[1440px] min-h-[112px] flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(150px,0.8fr)_minmax(132px,0.8fr)_minmax(220px,1.35fr)_auto] items-center gap-2">
            <div className="min-w-0">
              <p className="text-sm uppercase font-bold text-gray-500 dark:text-gray-400">
                Extension Sync
              </p>
              <p className={`mt-0.5 truncate text-lg font-bold ${syncStatus.color}`}>
                {syncStatus.label}
              </p>
            </div>
            <FormControl size="small" fullWidth>
              <InputLabel
                id="mock-sync-mode-label"
                sx={{
                  color: "#e5e7eb",
                  fontSize: "1rem",
                  "&.Mui-focused": { color: "#ffffff" },
                }}
              >
                Mode
              </InputLabel>
              <Select
                labelId="mock-sync-mode-label"
                label="Mode"
                value={syncSettings.syncMode || "manual"}
                onChange={(event) => onSyncModeChange(event.target.value)}
                sx={{
                  color: "#ffffff",
                  fontSize: "1rem",
                  ".MuiSelect-icon": { color: "#ffffff" },
                  ".MuiInputLabel-root": { fontSize: "1rem" },
                  ".MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9ca3af" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffff" },
                }}
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="chrome_extension">Chrome Extension</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Connection Token"
              margin="none"
              size="small"
              value={connectionToken || ""}
              InputProps={{ readOnly: true }}
              InputLabelProps={{
                sx: {
                  color: "#e5e7eb",
                  fontSize: "1rem",
                  "&.Mui-focused": { color: "#ffffff" },
                },
              }}
              sx={{
                input: { color: "#ffffff", fontSize: "1rem" },
                label: { fontSize: "1rem" },
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9ca3af" },
                ".Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffff" },
              }}
            />
            <label className="inline-flex items-center gap-2 text-base font-bold text-gray-700 dark:text-gray-200">
              <input
                checked={Boolean(syncSettings.syncEnabled)}
                className="h-4 w-4 accent-red-600"
                onChange={(event) => onSyncEnabledChange(event.target.checked)}
                type="checkbox"
              />
              Sync
            </label>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-72 gap-y-[4.5rem] text-sm font-bold">
            <span className="text-gray-500 dark:text-gray-400">
              Last Event:{" "}
              <span className="text-gray-900 dark:text-white">
                {formatSyncTimestamp(syncSettings.extensionLastEventAt)}
              </span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Detected: <span className="text-blue-400">{currentDetectedPlayer}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Sold: <span className="text-green-500">{lastSoldPlayer}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Queue:{" "}
              <span className="text-purple-300">
                {toNumber(syncSettings.reviewQueueCount).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
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
  onResetDraft,
  resetButtonLabel,
  resettingDraft,
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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          Current Auction
        </p>
        <button
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={resettingDraft}
          onClick={onResetDraft}
          type="button"
        >
          {resettingDraft ? "Resetting..." : resetButtonLabel}
        </button>
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
    leagueSettings?.BenchPlayers,
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

const getDraftedPlayerAmount = (player) =>
  toNumber(
    getFirstValue(
      player?.DraftAmount,
      player?.draftAmount,
      player?.PurchasePrice,
      player?.purchasePrice,
      player?.AuctionAmount,
      player?.auctionAmount
    )
  );

const getLeagueBudgetRows = ({ leagueSettings, teams, teamRosters }) => {
  const totalRosterSlots = getTotalRosterSlots(leagueSettings);

  return teams
    .map((team) => {
      const roster = teamRosters[team.id] || [];
      const spent = roster.reduce(
        (sum, player) => sum + getDraftedPlayerAmount(player),
        0
      );
      const budget = getTeamBudget(team, leagueSettings);
      const budgetLeft = Math.max(budget - spent, 0);
      const topSpentPlayer = [...roster].sort(
        (firstPlayer, secondPlayer) =>
          getDraftedPlayerAmount(secondPlayer) - getDraftedPlayerAmount(firstPlayer)
      )[0];

      return {
        budgetLeft,
        needs: getTeamNeedsForThreat(roster, leagueSettings),
        slotsFilled: roster.length,
        spent,
        team,
        topSpentAmount: getDraftedPlayerAmount(topSpentPlayer),
        topSpentPlayer,
        totalRosterSlots,
      };
    })
    .sort((firstTeam, secondTeam) => secondTeam.budgetLeft - firstTeam.budgetLeft);
};

const getTeamShortName = (team) => {
  const name = `${team?.TeamName || ""}`.trim();
  if (!name) return `Team ${team?.TeamNumber || team?.id || ""}`.trim();

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 8);

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getAvailableDraftPlayers = (players, teamRosters) => {
  const draftedPlayerIds = new Set(
    Object.values(teamRosters || {})
      .flat()
      .map((player) => player.DatabaseID || player.id)
      .filter(Boolean)
  );

  return players.filter((player) => {
    const playerId = player.DatabaseID || player.id;
    const draftStatus = normalizeStatus(player.DraftStatus);
    const status = normalizeStatus(player.Status);
    const availability = normalizeStatus(player.availability || player.Availability);
    const playerValue = toNumber(player.NonSuperFlexValue || player.auctionValue);

    return (
      playerId &&
      !draftedPlayerIds.has(playerId) &&
      playerValue > 0 &&
      draftStatus !== "drafted" &&
      draftStatus !== "unavailable" &&
      status !== "unavailable" &&
      status !== "inactive" &&
      availability !== "unavailable" &&
      player.available !== false &&
      player.Available !== false
    );
  });
};

const getRosterPositionNeeds = (roster, leagueSettings) => {
  const positionCounts = roster.reduce((counts, player) => {
    const position = getPlayerPosition(player);
    return {
      ...counts,
      [position]: (counts[position] || 0) + 1,
    };
  }, {});

  return ["QB", "RB", "WR", "TE"].flatMap((position) => {
    const needed = Math.max(
      getStarterSlotsForPosition(position, leagueSettings) - (positionCounts[position] || 0),
      0
    );

    return Array.from({ length: needed }, () => position);
  });
};

const getPlayerPathScore = (player, strategy, positionIndex) => {
  const value = toNumber(player.NonSuperFlexValue || player.auctionValue);
  const maxValue = toNumber(player.SuperFlexValue || player.maxBid, value);
  const tier = toNumber(player.Tier ?? player.tier, 9);
  const ddScore = toNumber(player.ddScore, 55);
  const sleeperScore = toNumber(player.sleeperScore, 50);
  const valueScore = value > 0 ? Math.max(0, (maxValue - value) / value) * 18 : 0;
  const tierScore = Math.max(0, 10 - tier) * 7;
  const affordabilityPenalty = value > strategy.maxTargetSpend ? 30 : 0;
  const positionBoost = strategy.priorityPositions.includes(getPlayerPosition(player))
    ? 18 - positionIndex * 2
    : 0;

  return (
    ddScore * strategy.ddWeight +
    sleeperScore * strategy.sleeperWeight +
    tierScore * strategy.tierWeight +
    valueScore * strategy.valueWeight +
    positionBoost -
    affordabilityPenalty
  );
};

const buildRosterPath = ({
  availablePlayers,
  budgetLeft,
  leagueSettings,
  roster,
  strategy,
}) => {
  const requiredNeeds = getRosterPositionNeeds(roster, leagueSettings);
  const fallbackNeeds = ["QB", "RB", "RB", "WR", "WR", "TE"];
  const targetPositions = [
    ...requiredNeeds,
    ...strategy.priorityPositions,
    ...fallbackNeeds,
  ].filter((position, index, positions) => positions.indexOf(position) === index || requiredNeeds.includes(position));
  const selected = [];
  let spend = 0;

  targetPositions.some((position, positionIndex) => {
    const remainingBudget = budgetLeft - spend;
    const samePositionTargets = availablePlayers
      .filter(
        (player) =>
          getPlayerPosition(player) === position &&
          !selected.some((target) => (target.DatabaseID || target.id) === (player.DatabaseID || player.id)) &&
          toNumber(player.NonSuperFlexValue || player.auctionValue) <= remainingBudget
      )
      .sort(
        (firstPlayer, secondPlayer) =>
          getPlayerPathScore(secondPlayer, strategy, positionIndex) -
          getPlayerPathScore(firstPlayer, strategy, positionIndex)
      );
    const nextTarget = samePositionTargets[0];

    if (nextTarget) {
      selected.push(nextTarget);
      spend += toNumber(nextTarget.NonSuperFlexValue || nextTarget.auctionValue);
    }

    return selected.length >= strategy.targetCount;
  });

  if (selected.length < Math.min(3, strategy.targetCount) || spend > budgetLeft) return null;

  const averageTier =
    selected.reduce((sum, player) => sum + toNumber(player.Tier ?? player.tier, 5), 0) /
    Math.max(selected.length, 1);
  const ddAverage =
    selected.reduce((sum, player) => sum + toNumber(player.ddScore, 55), 0) /
    Math.max(selected.length, 1);
  const sleeperAverage =
    selected.reduce((sum, player) => sum + toNumber(player.sleeperScore, 50), 0) /
    Math.max(selected.length, 1);
  const valueEdge = selected.reduce(
    (sum, player) =>
      sum +
      Math.max(
        0,
        toNumber(player.SuperFlexValue || player.maxBid, player.NonSuperFlexValue) -
          toNumber(player.NonSuperFlexValue || player.auctionValue)
      ),
    0
  );
  const balanceScore = new Set(selected.map(getPlayerPosition)).size * 7;
  const teamStrength = Math.max(
    55,
    Math.min(
      99,
      Math.round(
        ddAverage * 0.32 +
          sleeperAverage * 0.18 +
          Math.max(0, 10 - averageTier) * 4.5 +
          valueEdge * 1.4 +
          balanceScore +
          strategy.strengthBoost
      )
    )
  );
  const confidence = Math.max(
    50,
    Math.min(
      96,
      Math.round(
        teamStrength * 0.62 +
          Math.min((budgetLeft - spend) / Math.max(budgetLeft, 1), 1) * 20 +
          selected.length * 4 -
          strategy.riskPenalty
      )
    )
  );
  const valueRating =
    valueEdge >= 25 || ddAverage >= 85
      ? "A+"
      : valueEdge >= 15 || ddAverage >= 76
        ? "A"
        : valueEdge >= 8 || ddAverage >= 68
          ? "B+"
          : "B";

  return {
    ...strategy,
    confidence,
    expectedSpend: spend,
    remainingBudget: Math.max(budgetLeft - spend, 0),
    targets: selected,
    teamStrength,
    valueRating,
  };
};

const getOptimalRosterPaths = ({ draftedPlayers, leagueSettings, players, teamRosters }) => {
  const budget = toNumber(leagueSettings?.Budget, 200);
  const spent = draftedPlayers.reduce((sum, player) => sum + getDraftedPlayerAmount(player), 0);
  const budgetLeft = Math.max(budget - spent, 0);
  const availablePlayers = getAvailableDraftPlayers(players, teamRosters);

  if (budgetLeft <= 0 || availablePlayers.length === 0) return [];

  const strategies = [
    {
      name: "Hero RB",
      accent: "text-green-400",
      confidenceLabel: "High ceiling",
      ddWeight: 0.28,
      explanation:
        "This path preserves elite positional advantage while filling the rest of the lineup with efficient value.",
      priorityPositions: ["WR", "WR", "TE", "QB", "RB"],
      risk: "Medium",
      riskColor: "text-amber-300 bg-amber-500/15 border-amber-500/40",
      riskPenalty: 8,
      sleeperWeight: 0.12,
      strengthBoost: 8,
      targetCount: 5,
      tierWeight: 1.2,
      maxTargetSpend: budgetLeft * 0.45,
      valueWeight: 0.85,
    },
    {
      name: "Balanced",
      accent: "text-purple-300",
      confidenceLabel: "Most stable",
      ddWeight: 0.24,
      explanation:
        "This path spreads budget across remaining starters and avoids getting trapped by one expensive bidding war.",
      priorityPositions: ["QB", "RB", "WR", "TE", "WR"],
      risk: "Low",
      riskColor: "text-green-400 bg-green-500/15 border-green-500/40",
      riskPenalty: 2,
      sleeperWeight: 0.12,
      strengthBoost: 5,
      targetCount: 5,
      tierWeight: 0.9,
      maxTargetSpend: budgetLeft * 0.34,
      valueWeight: 0.75,
    },
    {
      name: "Value Hunting",
      accent: "text-blue-300",
      confidenceLabel: "Best surplus",
      ddWeight: 0.34,
      explanation:
        "This path avoids inflated rooms and maximizes projected value per auction dollar from the remaining pool.",
      priorityPositions: ["WR", "RB", "TE", "QB", "WR"],
      risk: "Medium",
      riskColor: "text-amber-300 bg-amber-500/15 border-amber-500/40",
      riskPenalty: 6,
      sleeperWeight: 0.22,
      strengthBoost: 3,
      targetCount: 5,
      tierWeight: 0.7,
      maxTargetSpend: budgetLeft * 0.24,
      valueWeight: 1.35,
    },
  ];

  return strategies
    .map((strategy) =>
      buildRosterPath({
        availablePlayers,
        budgetLeft,
        leagueSettings,
        roster: draftedPlayers,
        strategy,
      })
    )
    .filter(Boolean)
    .sort(
      (firstPath, secondPath) =>
        secondPath.teamStrength * 0.5 +
        secondPath.confidence * 0.3 +
        secondPath.remainingBudget * 0.2 -
        (firstPath.teamStrength * 0.5 +
          firstPath.confidence * 0.3 +
          firstPath.remainingBudget * 0.2)
    )
    .slice(0, 3);
};

const summarizePlayerForAI = (player) => ({
  name: player?.FullName || player?.fullName || player?.name || "",
  position: getPlayerPosition(player),
  tier: player?.Tier ?? player?.tier ?? "",
  rank: player?.PositionRank ?? player?.rank ?? "",
  projectedPoints: player?.ProjectedPoints ?? player?.projectedPoints ?? "",
  auctionValue: toNumber(player?.NonSuperFlexValue || player?.auctionValue),
  maxValue: getPlayerMaxValue(player),
  hardMaxValue: getPlayerHardMaxValue(player),
  currentBid: toNumber(player?.CurrentBid),
});

const getAllocationTargetsSummary = (leagueSettings) =>
  (Array.isArray(leagueSettings?.AllocationRules) ? leagueSettings.AllocationRules : []).map(
    (rule) => ({
      position: rule.position,
      minPercent: rule.minPercent,
      maxPercent: rule.maxPercent,
    })
  );

const buildCommandCenterAiPayload = ({
  currentAuction,
  draftedPlayers,
  leagueSettings,
  myTeam,
  players,
  teamRosters,
  teams,
}) => {
  const comparablePlayers = getComparableAvailablePlayers(currentAuction, players).map(summarizePlayerForAI);
  const availablePlayers = getAvailableDraftPlayers(players, teamRosters);
  const budget = toNumber(leagueSettings?.Budget, 200);
  const totalSpent = draftedPlayers.reduce((sum, player) => sum + getDraftedPlayerAmount(player), 0);
  const budgetLeft = Math.max(budget - totalSpent, 0);

  return {
    currentAuctionPlayer: summarizePlayerForAI(currentAuction),
    comparableAvailablePlayers: comparablePlayers,
    myRoster: draftedPlayers.map(summarizePlayerForAI),
    myBudget: {
      budget,
      budgetLeft,
      totalSpent,
      remainingRosterSpots: Math.max(getTotalRosterSlots(leagueSettings) - draftedPlayers.length, 0),
      team: myTeam?.TeamName || "",
    },
    allocationTargets: getAllocationTargetsSummary(leagueSettings),
    currentTeamNeeds: getTeamNeedsForThreat(draftedPlayers, leagueSettings),
    remainingAvailablePlayers: availablePlayers.slice(0, 80).map(summarizePlayerForAI),
    remainingElitePlayers: availablePlayers
      .filter((player) => toNumber(player.Tier ?? player.tier, 99) <= 2)
      .slice(0, 30)
      .map(summarizePlayerForAI),
    leagueBudgetBoard: getLeagueBudgetRows({ leagueSettings, teams, teamRosters }).map((row) => ({
      team: row.team.TeamName,
      budgetLeft: row.budgetLeft,
      spent: row.spent,
      slotsFilled: row.slotsFilled,
      needs: row.needs,
    })),
    teamThreats: getTeamThreatAnalysis({
      currentAuction,
      leagueSettings,
      myTeam,
      players,
      teamRosters,
      teams,
    }).map((threat) => ({
      team: threat.team.TeamName,
      budgetLeft: threat.budgetLeft,
      needs: threat.needs,
      threatLevel: threat.threatLevel.label,
      winChance: threat.winChance,
    })),
    draftHistory: Object.values(teamRosters || {})
      .flat()
      .map((player) => ({
        name: player.FullName || player.fullName || player.name,
        position: getPlayerPosition(player),
        amount: getDraftedPlayerAmount(player),
        value: toNumber(player.NonSuperFlexValue || player.auctionValue),
      })),
  };
};

const buildFallbackCommandCenterInsights = (payload) => {
  const player = payload.currentAuctionPlayer;
  const currentBid = toNumber(player.currentBid);
  const maxValue = toNumber(player.maxValue || player.auctionValue);
  const hardMax = toNumber(player.hardMaxValue, Math.ceil(maxValue * 1.08));
  const budgetLeft = toNumber(payload.myBudget?.budgetLeft);
  const comparableCount = payload.comparableAvailablePlayers?.length || 0;
  const eliteAtPosition = (payload.remainingElitePlayers || []).filter(
    (item) => item.position === player.position
  ).length;
  const recommendation =
    !player.name || player.position === "--"
      ? "Wait"
      : currentBid > hardMax || budgetLeft < currentBid
        ? "Pass"
        : currentBid >= maxValue
          ? "Wait"
          : "Bid";
  const recommendedMax = Math.min(
    hardMax || maxValue || 0,
    Math.max(0, budgetLeft - Math.max(toNumber(payload.myBudget?.remainingRosterSpots) - 1, 0))
  );
  const needs = payload.currentTeamNeeds || [];
  const needsPosition = needs.some((need) => `${need}`.startsWith(player.position));
  const confidence = Math.max(
    58,
    Math.min(94, Math.round((needsPosition ? 82 : 68) + (eliteAtPosition <= 3 ? 7 : 0) - (currentBid >= maxValue ? 8 : 0)))
  );
  const valuePositions = ["WR", "RB", "TE", "QB"].map((position) => {
    const positionPlayers = (payload.remainingAvailablePlayers || []).filter((item) => item.position === position);
    const avgValue =
      positionPlayers.reduce((sum, item) => sum + toNumber(item.auctionValue), 0) /
      Math.max(positionPlayers.length, 1);
    return { position, avgValue, count: positionPlayers.length };
  });
  const bestValuePosition = [...valuePositions].sort((a, b) => b.count - a.count || b.avgValue - a.avgValue)[0];
  const spendyTeams = [...(payload.leagueBudgetBoard || [])].slice(0, 2).map((team) => team.team).filter(Boolean);

  return {
    currentAuctionDecision: {
      recommendation,
      maximumBid: recommendedMax,
      confidence,
      reason: player.name
        ? `${player.name} is a ${player.position}${player.rank ? player.rank : ""} option near ${currency(player.auctionValue)} value. ${comparableCount > 0 ? `${comparableCount} viable pivots remain, so keep the bid disciplined.` : "Comparable pivots are thin, so scarcity supports a stronger bid."}`
        : "Add a current auction player to unlock a live bid recommendation.",
    },
    draftStrategy: {
      title: bestValuePosition?.position ? `Prioritize ${bestValuePosition.position} Value` : "Stay Flexible",
      recommendations: [
        `Preserve at least ${currency(Math.max(10, Math.round(budgetLeft * 0.12)))} for late value.`,
        needs.length > 0 ? `Fill ${needs.slice(0, 2).join(" and ")} before chasing depth.` : "Use budget on upside instead of redundant depth.",
        "Avoid spending past hard max unless it completes a premium starter slot.",
      ],
    },
    marketIntelligence: {
      observations: [
        spendyTeams.length > 0
          ? `${spendyTeams.join(" and ")} still have the most budget pressure in the room.`
          : "League budgets are clustered, so nominations should target roster needs.",
        `${eliteAtPosition} elite ${player.position || "premium"} options remain in the available pool.`,
        "Nominate expensive players at positions your biggest threats still need to drain budgets.",
      ],
    },
  };
};

const formatInsightTimestamp = (date) =>
  date
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "--";

const simpleHash = (value) => {
  const serialized = JSON.stringify(value ?? "");
  let hash = 0;

  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash << 5) - hash + serialized.charCodeAt(index);
    hash |= 0;
  }

  return `${Math.abs(hash)}`;
};

const getBidThresholdBucket = (currentAuction, recommendedMax) => {
  const currentBid = toNumber(currentAuction?.CurrentBid);
  const auctionValue = toNumber(currentAuction?.NonSuperFlexValue || currentAuction?.auctionValue);
  const maxValue = getPlayerMaxValue(currentAuction);
  const hardMaxValue = getPlayerHardMaxValue(currentAuction);
  const recommendedThreshold = Math.round(toNumber(recommendedMax) * 0.9);

  if (hardMaxValue > 0 && currentBid >= hardMaxValue) return "hard-max-crossed";
  if (maxValue > 0 && currentBid >= maxValue) return "max-crossed";
  if (recommendedThreshold > 0 && currentBid >= recommendedThreshold) return "recommended-90-crossed";
  if (auctionValue > 0 && currentBid >= auctionValue) return "value-crossed";
  return "below-value";
};

const buildCommandCenterAiCacheKey = ({
  currentAuction,
  draftRoomId,
  draftedPlayers,
  leagueSettings,
  players,
  recommendedMax,
  teamRosters,
  teams,
}) => {
  const currentPlayerId = currentAuction?.DatabaseID || currentAuction?.id || "none";
  const teamBudgetHash = simpleHash(
    getLeagueBudgetRows({ leagueSettings, teams, teamRosters }).map((row) => ({
      id: row.team.id,
      budgetLeft: row.budgetLeft,
      needs: row.needs,
      slotsFilled: row.slotsFilled,
      spent: row.spent,
    }))
  );
  const myRosterHash = simpleHash(
    draftedPlayers.map((player) => ({
      id: player.DatabaseID || player.id,
      amount: getDraftedPlayerAmount(player),
    }))
  );
  const availablePlayerPoolHash = simpleHash(
    getAvailableDraftPlayers(players, teamRosters).map((player) => ({
      id: player.DatabaseID || player.id,
      value: toNumber(player.NonSuperFlexValue || player.auctionValue),
      tier: player.Tier ?? player.tier,
    }))
  );
  const bidThresholdBucket = getBidThresholdBucket(currentAuction, recommendedMax);

  return [
    draftRoomId || "default-room",
    currentPlayerId,
    myRosterHash,
    teamBudgetHash,
    availablePlayerPoolHash,
    bidThresholdBucket,
  ].join("|");
};

const getLocalInstantDecision = ({ currentAuction, budgetLeft, recommendedMax }) => {
  const hasPlayer = Boolean(currentAuction?.DatabaseID || currentAuction?.id);
  const currentBid = toNumber(currentAuction?.CurrentBid);
  const auctionValue = toNumber(currentAuction?.NonSuperFlexValue || currentAuction?.auctionValue);
  const maxValue = getPlayerMaxValue(currentAuction);
  const hardMaxValue = getPlayerHardMaxValue(currentAuction);
  const leftIfWin = Math.max(budgetLeft - currentBid, 0);
  const recommendedMaxValue = toNumber(recommendedMax, maxValue || auctionValue);
  let status = "Wait";
  let color = "text-gray-300";
  let recommendation = "Wait";
  let note = "Add a player to get live bid guidance.";

  if (hasPlayer) {
    if (currentBid > budgetLeft || (hardMaxValue > 0 && currentBid >= hardMaxValue)) {
      status = "Hard Stop";
      color = "text-red-400";
      recommendation = "Pass";
      note = "Stop bidding. The current price has reached the hard stop or exceeds your available budget.";
    } else if (currentBid >= recommendedMaxValue && recommendedMaxValue > 0) {
      status = "Pass";
      color = "text-red-400";
      recommendation = "Pass";
      note = "The bid has reached your recommended max. Let the room take the risk from here.";
    } else if (maxValue > 0 && currentBid >= maxValue) {
      status = "Danger Zone";
      color = "text-red-300";
      recommendation = "Wait";
      note = "The bid is past max value. Only continue if this fills a premium roster need.";
    } else if (auctionValue > 0 && currentBid >= auctionValue) {
      status = "Approaching Max";
      color = "text-amber-300";
      recommendation = "Wait";
      note = "The bid is no longer a clear discount. Stay disciplined and watch the next threshold.";
    } else if (auctionValue > 0 && currentBid >= auctionValue * 0.78) {
      status = "Still Safe";
      color = "text-green-400";
      recommendation = "Bid";
      note = "The current bid is still inside a playable range with room before value.";
    } else {
      status = "Value Bid";
      color = "text-green-500";
      recommendation = "Bid";
      note = "The current price is below auction value and still offers budget flexibility.";
    }
  }

  return {
    color,
    currentBid,
    leftIfWin,
    note,
    recommendation,
    status,
  };
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

const getTargetedPlayerIds = (targetedPlayers) =>
  new Set(
    (targetedPlayers || [])
      .filter((player) => player.watchlist || player.priority || player.isTarget)
      .map((player) => player.playerId || player.DatabaseID || player.id)
      .filter(Boolean)
  );

const getPositionMarketContext = ({ players, teamRosters }) => {
  const draftHistory = Object.values(teamRosters || {}).flat();
  const positionContext = ["QB", "RB", "WR", "TE"].reduce(
    (context, position) => ({
      ...context,
      [position]: {
        draftedCount: 0,
        inflation: 0,
        remainingCount: 0,
        topTierCount: 0,
      },
    }),
    {}
  );

  draftHistory.forEach((player) => {
    const position = getPlayerPosition(player);
    if (!positionContext[position]) return;

    const amount = getDraftedPlayerAmount(player);
    const value = toNumber(player.NonSuperFlexValue || player.auctionValue);
    positionContext[position].draftedCount += 1;
    positionContext[position].inflation += value > 0 ? (amount - value) / value : 0;
  });

  getAvailableDraftPlayers(players, teamRosters).forEach((player) => {
    const position = getPlayerPosition(player);
    if (!positionContext[position]) return;

    positionContext[position].remainingCount += 1;
    if (toNumber(player.Tier ?? player.tier, 99) <= 2) {
      positionContext[position].topTierCount += 1;
    }
  });

  return Object.entries(positionContext).reduce((context, [position, data]) => ({
    ...context,
    [position]: {
      ...data,
      averageInflation:
        data.draftedCount > 0 ? data.inflation / Math.max(data.draftedCount, 1) : 0,
      scarcityScore:
        data.topTierCount <= 2
          ? 1
          : Math.max(0.15, 1 - data.remainingCount / Math.max(data.remainingCount + data.draftedCount, 1)),
    },
  }), {});
};

const getNominationType = ({
  biddingWarScore,
  isMyTarget,
  marketInflationScore,
  myNeedsPosition,
  playerValue,
  scarcityScore,
  teamNeedScore,
}) => {
  if (!isMyTarget && teamNeedScore >= 0.72 && biddingWarScore >= 0.55) return "Force Need";
  if (!isMyTarget && playerValue >= 25 && biddingWarScore >= 0.45) return "Drain Wallets";
  if (!isMyTarget && scarcityScore >= 0.76 && teamNeedScore >= 0.45) return "Scarcity Pressure";
  if (!isMyTarget && myNeedsPosition && teamNeedScore >= 0.35) return "Smoke Screen";
  if (marketInflationScore >= 0.55) return "Market Test";
  return "Value Target";
};

const getNominationReason = ({ interestedTeams, position, type }) => {
  const teamText =
    interestedTeams.length >= 2
      ? `${interestedTeams.slice(0, 2).join(" and ")} both`
      : interestedTeams.length === 1
        ? `${interestedTeams[0]}`
        : "The room";

  if (type === "Force Need") {
    return `${teamText} need ${position} and can still bid.`;
  }
  if (type === "Drain Wallets") {
    return `${teamText} can spend; make them pay for ${position}.`;
  }
  if (type === "Smoke Screen") {
    return `Good ${position} decoy while preserving your targets.`;
  }
  if (type === "Market Test") {
    return `Tests whether ${position} prices are cooling.`;
  }
  if (type === "Scarcity Pressure") {
    return `${position} tier is thinning; pressure needy teams.`;
  }

  return "Safe to win if bidding stays below value.";
};

const getNominationCandidates = ({
  draftedPlayers,
  leagueSettings,
  myTeam,
  players,
  targetedPlayers,
  teamRosters,
  teams,
}) => {
  const availablePlayers = getAvailableDraftPlayers(players, teamRosters);
  const budget = toNumber(leagueSettings?.Budget, 200);
  const totalRosterSlots = getTotalRosterSlots(leagueSettings);
  const myRoster = draftedPlayers || [];
  const mySpent = myRoster.reduce((sum, player) => sum + getDraftedPlayerAmount(player), 0);
  const myBudgetLeft = Math.max(budget - mySpent, 0);
  const myRemainingSlots = Math.max(totalRosterSlots - myRoster.length, 0);
  const myMaxBid = Math.max(myBudgetLeft - Math.max(myRemainingSlots - 1, 0), 0);
  const myNeeds = getRosterPositionNeeds(myRoster, leagueSettings);
  const myNeedPositions = new Set(myNeeds);
  const targetedPlayerIds = getTargetedPlayerIds(targetedPlayers);
  const marketContext = getPositionMarketContext({ players, teamRosters });
  const teamRows = getLeagueBudgetRows({ leagueSettings, teams, teamRosters }).filter(
    (row) => row.team.id !== myTeam?.id
  );

  return availablePlayers
    .map((player) => {
      const playerId = player.DatabaseID || player.id;
      const position = getPlayerPosition(player);
      const value = toNumber(player.NonSuperFlexValue || player.auctionValue);
      const maxValue = getPlayerMaxValue(player);
      const tier = toNumber(player.Tier ?? player.tier, 99);
      const rank = toNumber(player.PositionRank ?? player.rank, 999);
      const context = marketContext[position] || {};
      const interestedRows = teamRows
        .map((row) => {
          const relevantNeeds = row.needs.filter((need) => need.startsWith(position));
          const remainingSlots = Math.max(totalRosterSlots - row.slotsFilled, 0);
          const teamMaxBid = Math.max(row.budgetLeft - Math.max(remainingSlots - 1, 0), 0);
          const needScore = Math.min(relevantNeeds.length / Math.max(getStarterSlotsForPosition(position, leagueSettings), 1), 1);
          const budgetScore = Math.min(teamMaxBid / Math.max(maxValue || value, 1), 1);
          const interestScore = needScore * 0.68 + budgetScore * 0.32;

          return {
            ...row,
            interestScore,
            relevantNeeds,
            teamMaxBid,
          };
        })
        .filter((row) => row.relevantNeeds.length > 0 && row.teamMaxBid >= Math.max(value * 0.55, 1))
        .sort((firstRow, secondRow) => secondRow.interestScore - firstRow.interestScore);
      const interestedTeams = interestedRows.slice(0, 3).map((row) => getTeamShortName(row.team));
      const teamNeedScore = Math.min(
        interestedRows.reduce((sum, row) => sum + row.interestScore, 0) / 2.2,
        1
      );
      const budgetPowerScore = Math.min(
        interestedRows.reduce((sum, row) => sum + Math.min(row.teamMaxBid / Math.max(value, 1), 1), 0) / 2.5,
        1
      );
      const biddingWarScore = Math.min(interestedRows.length / 3, 1) * 0.65 + budgetPowerScore * 0.35;
      const scarcityScore = Math.max(
        context.scarcityScore || 0,
        tier <= 2 ? 0.9 : tier <= 4 ? 0.58 : 0.28
      );
      const isMyTarget = targetedPlayerIds.has(playerId);
      const notMyTopTargetScore = isMyTarget ? 0.15 : 1;
      const marketInflationScore = Math.max(0, Math.min((context.averageInflation || 0) + 0.25, 1));
      const myNeedsPosition = myNeedPositions.has(position);
      const strategicFitScore =
        myNeedsPosition && !isMyTarget
          ? 0.72
          : myNeedsPosition
            ? 0.45
            : 0.85;
      const type = getNominationType({
        biddingWarScore,
        isMyTarget,
        marketInflationScore,
        myNeedsPosition,
        playerValue: value,
        scarcityScore,
        teamNeedScore,
      });
      const nominationScore = Math.round(
        teamNeedScore * 25 +
          budgetPowerScore * 20 +
          biddingWarScore * 15 +
          scarcityScore * 15 +
          notMyTopTargetScore * 10 +
          marketInflationScore * 10 +
          strategicFitScore * 5
      );
      const canAfford = value <= myMaxBid || maxValue <= myMaxBid;
      const isStrategicUnaffordableType = ["Drain Wallets", "Smoke Screen", "Force Need"].includes(type);
      const isRelevantPlayer =
        value >= 5 ||
        tier <= 5 ||
        rank <= 36 ||
        (["QB", "TE"].includes(position) && rank <= 18) ||
        nominationScore >= 68;

      return {
        player,
        position,
        value,
        tier,
        type,
        interestedTeams,
        reason: getNominationReason({ interestedTeams, position, type }),
        score: nominationScore,
        canAfford,
        isRelevantPlayer,
        isStrategicUnaffordableType,
        teamNeedScore,
      };
    })
    .filter(
      (candidate) =>
        candidate.position &&
        candidate.interestedTeams.length > 0 &&
        candidate.teamNeedScore >= 0.2 &&
        candidate.isRelevantPlayer &&
        (candidate.canAfford || candidate.isStrategicUnaffordableType)
    )
    .sort(
      (firstCandidate, secondCandidate) =>
        secondCandidate.score - firstCandidate.score ||
        secondCandidate.value - firstCandidate.value
    )
    .slice(0, 5);
};

const ComparableAvailablePlayersCard = ({ currentAuction, players }) => {
  const comparablePlayers = useMemo(
    () => getComparableAvailablePlayers(currentAuction, players),
    [currentAuction, players]
  );
  const hasCurrentPlayer = Boolean(currentAuction?.DatabaseID || currentAuction?.id);

  return (
    <section className="w-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
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
    <section className="w-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
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

const LeagueBudgetBoardCard = ({ leagueSettings, teams, teamRosters }) => {
  const budgetRows = useMemo(
    () => getLeagueBudgetRows({ leagueSettings, teams, teamRosters }),
    [leagueSettings, teams, teamRosters]
  );

  return (
    <section className="w-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          League Budget Board
        </p>
      </div>

      {budgetRows.length === 0 ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          Add league teams to see the budget board.
        </p>
      ) : (
        <div className="mt-4 max-h-[455px] overflow-y-auto overscroll-contain pr-1">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[23%]" />
              <col className="w-[19%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-white dark:bg-secondary-dark-bg">
              <tr className="border-b border-gray-200 dark:border-[#26313a] text-sm uppercase text-gray-500 dark:text-gray-400">
                <th className="py-2.5 pr-3 font-bold">Team</th>
                <th className="py-2.5 px-2 font-bold">Budget Left</th>
                <th className="py-2.5 px-2 font-bold">Spent</th>
                <th className="py-2.5 px-2 font-bold">Slots</th>
                <th className="py-2.5 px-2 font-bold">Top Spent Player</th>
                <th className="py-2.5 pl-2 font-bold">Needs</th>
              </tr>
            </thead>
            <tbody>
              {budgetRows.map((row) => (
                <tr
                  className="border-b border-gray-100 dark:border-[#202a32] last:border-b-0"
                  key={row.team.id}
                >
                  <td className="py-3 pr-3">
                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {row.team.TeamName}
                    </p>
                  </td>
                  <td className="py-3 px-2 text-lg font-bold text-green-500">
                    {currency(row.budgetLeft)}
                  </td>
                  <td className="py-3 px-2 text-lg font-bold text-blue-400">
                    {currency(row.spent)}
                  </td>
                  <td className="py-3 px-2 text-base font-bold text-gray-700 dark:text-gray-200">
                    {row.slotsFilled} / {row.totalRosterSlots}
                  </td>
                  <td className="py-3 px-2">
                    {row.topSpentPlayer ? (
                      <>
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                          {row.topSpentPlayer.FullName ||
                            row.topSpentPlayer.fullName ||
                            row.topSpentPlayer.name}
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-500 dark:text-gray-400">
                          {currency(row.topSpentAmount)}
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-bold text-gray-500 dark:text-gray-400">
                        --
                      </p>
                    )}
                  </td>
                  <td className="py-3 pl-2 text-base font-bold text-gray-700 dark:text-gray-200">
                    {row.needs.length > 0 ? row.needs.slice(0, 3).join(", ") : "--"}
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

const OptimalRosterPathsCard = ({ draftedPlayers, leagueSettings, players, teamRosters }) => {
  const [activePathIndex, setActivePathIndex] = useState(0);
  const rosterPaths = useMemo(
    () =>
      getOptimalRosterPaths({
        draftedPlayers,
        leagueSettings,
        players,
        teamRosters,
      }),
    [draftedPlayers, leagueSettings, players, teamRosters]
  );
  const activePath = rosterPaths[Math.min(activePathIndex, rosterPaths.length - 1)] || null;

  useEffect(() => {
    setActivePathIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(rosterPaths.length - 1, 0))
    );
  }, [rosterPaths.length]);

  return (
    <section className="w-full min-h-[360px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          Optimal Roster Paths
        </p>
        {rosterPaths.length > 1 && (
          <div className="target-board-pagination target-board-wishlist-pagination mt-0">
            <button
              aria-label="Previous roster path"
              className="target-board-page-button"
              disabled={activePathIndex === 0}
              onClick={() => setActivePathIndex((index) => Math.max(0, index - 1))}
              type="button"
            >
              <FiChevronLeft />
            </button>
            <span className="target-board-page-button target-board-page-ellipsis">
              {activePathIndex + 1} / {rosterPaths.length}
            </span>
            <button
              aria-label="Next roster path"
              className="target-board-page-button"
              disabled={activePathIndex === rosterPaths.length - 1}
              onClick={() =>
                setActivePathIndex((index) =>
                  Math.min(rosterPaths.length - 1, index + 1)
                )
              }
              type="button"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {!activePath ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          No viable roster paths found with the current budget and available player pool.
        </p>
      ) : (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[#26313a]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={`text-sm uppercase font-bold ${activePath.accent}`}>
                  Build Path {String.fromCharCode(65 + activePathIndex)}
                </p>
                <h3 className={`mt-1 text-2xl font-bold ${activePath.accent}`}>
                  {activePath.name}
                </h3>
              </div>
              <span className={`rounded-md border px-2 py-1 text-xs font-bold ${activePath.riskColor}`}>
                Risk: {activePath.risk}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                <span>Team Strength</span>
                <span>{activePath.teamStrength}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-[#26313a] overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${activePath.teamStrength}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                  Spend
                </p>
                <p className="text-xl font-bold text-green-500">
                  {currency(activePath.expectedSpend)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                  Left
                </p>
                <p className="text-xl font-bold text-blue-400">
                  {currency(activePath.remainingBudget)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                  Value
                </p>
                <p className="text-xl font-bold text-purple-300">
                  {activePath.valueRating}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                  Confidence
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {activePath.confidence}%
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 dark:border-[#26313a] pt-3">
              <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                Remaining Targets
              </p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
                {activePath.targets.map((player) => (
                  <div
                    className="flex items-start justify-between gap-3"
                    key={player.DatabaseID || player.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-gray-900 dark:text-white">
                        {player.FullName || player.fullName}
                      </p>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {getPlayerPosition(player)} · Tier {statValue(player.Tier ?? player.tier)}
                      </p>
                    </div>
                    <p className="text-base font-bold text-green-500 shrink-0">
                      {currency(player.NonSuperFlexValue || player.auctionValue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 border-t border-gray-200 dark:border-[#26313a] pt-3 text-sm font-semibold leading-relaxed text-gray-600 dark:text-gray-300">
              {activePath.explanation}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

const NominationOptimizerCard = ({
  draftedPlayers,
  leagueSettings,
  myTeam,
  players,
  targetedPlayers,
  teamRosters,
  teams,
}) => {
  const nominationCandidates = useMemo(
    () =>
      getNominationCandidates({
        draftedPlayers,
        leagueSettings,
        myTeam,
        players,
        targetedPlayers,
        teamRosters,
        teams,
      }),
    [draftedPlayers, leagueSettings, myTeam, players, targetedPlayers, teamRosters, teams]
  );
  const bestNomination = nominationCandidates[0];

  return (
    <section className="w-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="pb-4 border-b border-gray-200 dark:border-[#202a32]">
        <p className="text-purple-500 uppercase text-xl font-bold tracking-wide">
          Nomination Optimizer
        </p>
      </div>

      {nominationCandidates.length === 0 ? (
        <p className="mt-5 text-base font-semibold text-gray-500 dark:text-gray-400">
          No strong nomination angles yet. Add teams, budgets, and available player data to unlock recommendations.
        </p>
      ) : (
        <>
          <div className="mt-4 max-h-[382px] overflow-y-auto overscroll-contain pr-1">
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[23%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-white dark:bg-secondary-dark-bg">
                <tr className="border-b border-gray-200 dark:border-[#26313a] text-[10px] uppercase text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-2 font-bold">Player</th>
                  <th className="py-2 px-1 font-bold">Pos</th>
                  <th className="py-2 px-1 font-bold">Value</th>
                  <th className="py-2 px-1 font-bold">Tier</th>
                  <th className="py-2 px-1 font-bold">Type</th>
                  <th className="py-2 px-1 font-bold">Teams</th>
                  <th className="py-2 pl-1 font-bold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {nominationCandidates.map((candidate) => {
                  const playerName =
                    candidate.player.FullName ||
                    candidate.player.fullName ||
                    candidate.player.name ||
                    "Unknown";

                  return (
                    <tr
                      className="border-b border-gray-100 dark:border-[#202a32] last:border-b-0 align-top"
                      key={candidate.player.DatabaseID || candidate.player.id}
                    >
                      <td className="py-2.5 pr-2">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                          {playerName}
                        </p>
                        <p className="mt-0.5 text-[11px] font-bold text-purple-300">
                          {candidate.score}/100
                        </p>
                      </td>
                      <td className="py-2.5 px-1 text-sm font-bold text-gray-700 dark:text-gray-200">
                        {candidate.position}
                      </td>
                      <td className="py-2.5 px-1 text-sm font-bold text-green-500">
                        {currency(candidate.value)}
                      </td>
                      <td className="py-2.5 px-1 text-sm font-bold text-purple-300">
                        {statValue(candidate.tier)}
                      </td>
                      <td className="py-2.5 px-1">
                        <span className="inline-flex rounded-md border border-purple-400/30 bg-purple-500/15 px-1.5 py-1 text-[10px] font-bold leading-tight text-purple-200">
                          {candidate.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-xs font-bold text-gray-700 dark:text-gray-200">
                        {candidate.interestedTeams.join(", ")}
                      </td>
                      <td className="py-2.5 pl-1 text-[11px] font-semibold leading-snug text-gray-600 dark:text-gray-300">
                        {candidate.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-3">
            <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
              AI Summary
            </p>
            <p className="mt-1 text-sm font-bold leading-relaxed text-gray-900 dark:text-white">
              Best nomination:{" "}
              {bestNomination.player.FullName ||
                bestNomination.player.fullName ||
                bestNomination.player.name}
              . {bestNomination.reason}
            </p>
          </div>
        </>
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
    <section className="w-full min-h-[520px] p-5 md:p-6 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
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

const DynastyDestroyerAiCard = ({
  currentAuction,
  draftedPlayers,
  draftRoomId,
  leagueSettings,
  myTeam,
  players,
  teamRosters,
  teams,
}) => {
  const payload = useMemo(
    () =>
      buildCommandCenterAiPayload({
        currentAuction,
        draftedPlayers,
        leagueSettings,
        myTeam,
        players,
        teamRosters,
        teams,
      }),
    [currentAuction, draftedPlayers, leagueSettings, myTeam, players, teamRosters, teams]
  );
  const fallbackInsights = useMemo(
    () => buildFallbackCommandCenterInsights(payload),
    [payload]
  );
  const aiCacheKey = useMemo(
    () =>
      buildCommandCenterAiCacheKey({
        currentAuction,
        draftRoomId,
        draftedPlayers,
        leagueSettings,
        players,
        recommendedMax: fallbackInsights.currentAuctionDecision?.maximumBid,
        teamRosters,
        teams,
      }),
    [
      currentAuction,
      draftRoomId,
      draftedPlayers,
      fallbackInsights.currentAuctionDecision?.maximumBid,
      leagueSettings,
      players,
      teamRosters,
      teams,
    ]
  );
  const [insights, setInsights] = useState(fallbackInsights);
  const [lastUpdated, setLastUpdated] = useState({
    currentAuctionDecision: new Date(),
    draftStrategy: new Date(),
    marketIntelligence: new Date(),
  });
  const [loadingSections, setLoadingSections] = useState({
    currentAuctionDecision: false,
    draftStrategy: false,
    marketIntelligence: false,
  });
  const [liveUnavailable, setLiveUnavailable] = useState(false);
  const aiCacheRef = useRef(new Map());
  const cooldownTimerRef = useRef(null);
  const lastAiRequestAtRef = useRef(0);
  const latestQueuedRequestRef = useRef(null);
  const mountedRef = useRef(true);
  const payloadRef = useRef(payload);
  const fallbackInsightsRef = useRef(fallbackInsights);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    payloadRef.current = payload;
    fallbackInsightsRef.current = fallbackInsights;
    setInsights((currentInsights) => currentInsights || fallbackInsights);
  }, [fallbackInsights, payload]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const executeRequest = (requestKey) => {
        if (!mountedRef.current) return;

        const cached = aiCacheRef.current.get(requestKey);

        if (cached) {
          setInsights(cached.insights);
          setLastUpdated(cached.lastUpdated);
          setLiveUnavailable(false);
          setLoadingSections({
            currentAuctionDecision: false,
            draftStrategy: false,
            marketIntelligence: false,
          });
          return;
        }

        const now = Date.now();
        const cooldownRemaining = Math.max(0, 9000 - (now - lastAiRequestAtRef.current));

        if (cooldownRemaining > 0) {
          latestQueuedRequestRef.current = requestKey;
          setLoadingSections({
            currentAuctionDecision: true,
            draftStrategy: true,
            marketIntelligence: true,
          });

          if (!cooldownTimerRef.current) {
            cooldownTimerRef.current = setTimeout(() => {
              cooldownTimerRef.current = null;
              const latestRequestKey = latestQueuedRequestRef.current;
              latestQueuedRequestRef.current = null;

              if (latestRequestKey) {
                executeRequest(latestRequestKey);
              }
            }, cooldownRemaining);
          }

          return;
        }

        const startedAt = new Date();
        lastAiRequestAtRef.current = now;
        setLoadingSections({
          currentAuctionDecision: true,
          draftStrategy: true,
          marketIntelligence: true,
        });

        getOpenAIDraftCommandCenterInsights(payloadRef.current)
          .then((nextInsights) => {
            if (!mountedRef.current) return;

            const normalizedInsights = {
              currentAuctionDecision:
                nextInsights.currentAuctionDecision ||
                fallbackInsightsRef.current.currentAuctionDecision,
              draftStrategy:
                nextInsights.draftStrategy || fallbackInsightsRef.current.draftStrategy,
              marketIntelligence:
                nextInsights.marketIntelligence ||
                fallbackInsightsRef.current.marketIntelligence,
            };
            const nextLastUpdated = {
              currentAuctionDecision: startedAt,
              draftStrategy: startedAt,
              marketIntelligence: startedAt,
            };

            aiCacheRef.current.set(requestKey, {
              insights: normalizedInsights,
              lastUpdated: nextLastUpdated,
            });
            setInsights(normalizedInsights);
            setLastUpdated(nextLastUpdated);
            setLiveUnavailable(false);
          })
          .catch((error) => {
            if (!mountedRef.current) return;
            console.warn("Live command center AI unavailable:", error);
            setInsights((currentInsights) => currentInsights || fallbackInsightsRef.current);
            setLiveUnavailable(true);
          })
          .finally(() => {
            if (!mountedRef.current) return;
            setLoadingSections({
              currentAuctionDecision: false,
              draftStrategy: false,
              marketIntelligence: false,
            });
          });
      };

      executeRequest(aiCacheKey);
    }, 3000);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [aiCacheKey]);

  const aiDecision = insights.currentAuctionDecision || fallbackInsights.currentAuctionDecision;
  const strategy = insights.draftStrategy || fallbackInsights.draftStrategy;
  const market = insights.marketIntelligence || fallbackInsights.marketIntelligence;
  const localDecision = useMemo(
    () =>
      getLocalInstantDecision({
        budgetLeft: payload.myBudget?.budgetLeft,
        currentAuction,
        recommendedMax: aiDecision.maximumBid,
      }),
    [aiDecision.maximumBid, currentAuction, payload.myBudget?.budgetLeft]
  );

  const insightSections = [
    {
      id: "currentAuctionDecision",
      icon: <FiTarget size={22} />,
      color: "text-green-500",
      iconClass: "bg-green-500/20 text-green-400",
      title: "Current Auction Decision",
      body: (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                Live Status
              </p>
              <p className={`text-lg font-bold ${localDecision.color}`}>
                {localDecision.status}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                AI Max
              </p>
              <p className="text-lg font-bold text-blue-400">
                {currency(aiDecision.maximumBid)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                Left If Win
              </p>
              <p className="text-lg font-bold text-green-500">
                {currency(localDecision.leftIfWin)}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                Recommendation
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {localDecision.recommendation}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                AI Confidence
              </p>
              <p className="text-base font-bold text-green-500">
                {aiDecision.confidence}%
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-600 dark:text-gray-300">
            {localDecision.note}
          </p>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-gray-500 dark:text-gray-400">
            AI read: {aiDecision.reason}
          </p>
        </>
      ),
    },
    {
      id: "draftStrategy",
      icon: <FiActivity size={22} />,
      color: "text-purple-400",
      iconClass: "bg-purple-500/20 text-purple-300",
      title: "Draft Strategy",
      body: (
        <>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {strategy.title}
          </p>
          <ul className="mt-2 space-y-2 text-sm font-semibold leading-relaxed text-gray-600 dark:text-gray-300">
            {(strategy.recommendations || []).slice(0, 3).map((recommendation) => (
              <li key={recommendation}>• {recommendation}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "marketIntelligence",
      icon: <FiTrendingUp size={22} />,
      color: "text-blue-400",
      iconClass: "bg-blue-500/20 text-blue-300",
      title: "Market Intelligence",
      body: (
        <ul className="space-y-2 text-sm font-semibold leading-relaxed text-gray-600 dark:text-gray-300">
          {(market.observations || []).slice(0, 4).map((observation) => (
            <li key={observation}>• {observation}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
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

      {liveUnavailable && (
        <p className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300">
          Live AI temporarily paused. Using local draft logic.
        </p>
      )}

      <div className="mt-5 space-y-4">
        {insightSections.map((section) => (
          <div
            className="rounded-lg border border-gray-200 dark:border-[#26313a] bg-gray-50 dark:bg-[#13191e] p-4"
            key={section.id}
          >
            <div className="flex items-start gap-3">
              <span className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${section.iconClass}`}>
                {section.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`uppercase text-sm font-bold tracking-wide ${section.color}`}>
                    {section.title}
                  </p>
                  <p className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                    {loadingSections[section.id]
                      ? "Updating..."
                      : `Updated ${formatInsightTimestamp(lastUpdated[section.id])}`}
                  </p>
                </div>
                <div className={loadingSections[section.id] ? "mt-3 opacity-60" : "mt-3"}>
                  {section.body}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

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
    leagueSettings?.BenchPlayers,
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

const MockDraft = () => {
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
  const [resettingDraft, setResettingDraft] = useState(false);
  const [syncSettings, setSyncSettings] = useState(defaultExtensionSyncSettings);
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
  const syncStatus = useMemo(
    () => getSyncDisplayStatus(syncSettings),
    [syncSettings]
  );
  const syncSettingsRef = useMemo(() => {
    if (!currentUser) return null;

    return doc(
      db,
      "userprofile",
      currentUser.uid,
      MOCK_DRAFT_COLLECTION,
      EXTENSION_SYNC_DOC_ID
    );
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return undefined;

    const currentAuctionRef = doc(
      db,
      "userprofile",
      currentUser.uid,
      MOCK_DRAFT_COLLECTION,
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
    if (!syncSettingsRef) {
      setSyncSettings(defaultExtensionSyncSettings);
      return undefined;
    }

    return onSnapshot(
      syncSettingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSyncSettings({
            ...defaultExtensionSyncSettings,
            ...snapshot.data(),
          });
          return;
        }

        const nextSettings = {
          ...defaultExtensionSyncSettings,
          connectionToken: createConnectionToken(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        setDoc(syncSettingsRef, nextSettings, { merge: true }).catch((error) => {
          console.error("Error creating mock draft sync settings:", error);
        });
        setSyncSettings(nextSettings);
      },
      (error) => {
        console.error("Error loading mock draft sync settings:", error);
        setSyncSettings({
          ...defaultExtensionSyncSettings,
          extensionStatus: "error",
        });
      }
    );
  }, [syncSettingsRef]);

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
      MOCK_DRAFT_COLLECTION,
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
        MOCK_DRAFT_COLLECTION,
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

    await CreateOrUpdateBigDawgCurrentAuction(
      currentUser.uid,
      selectedPlayer,
      {
        CurrentBid: openingBid,
        NominatedByTeamId: nominatingTeamId,
        NominatedByTeamName: nominatingTeam?.TeamName || "",
      },
      MOCK_DRAFT_COLLECTION
    );

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
      draftAmount,
      MOCK_DRAFT_COLLECTION
    );
    await ClearBigDawgCurrentAuction(currentUser.uid, MOCK_DRAFT_COLLECTION);

    toast(`${currentAuction.FullName} drafted by ${selectedDraftTeam.TeamName}`);
    setDraftTeamId("");
    setDraftAmount("");
    setDraftAmountManuallyEdited(false);
  };

  const handleClearCurrentAuction = async () => {
    if (!currentUser || !hasCurrentPlayer) return;

    await ClearBigDawgCurrentAuction(currentUser.uid, MOCK_DRAFT_COLLECTION);
    setDraftTeamId("");
    setDraftAmount("");
    setDraftAmountManuallyEdited(false);
    toast("Current auction cleared.");
  };

  const handleCurrentBidChange = async (nextBid) => {
    if (!currentUser || !hasCurrentPlayer) return;

    await UpdateBigDawgCurrentAuctionBid(
      currentUser.uid,
      Math.max(0, nextBid),
      MOCK_DRAFT_COLLECTION
    );
  };

  const updateSyncSettings = async (updates) => {
    if (!syncSettingsRef) return;

    const nextUpdates = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    setSyncSettings((currentSettings) => ({
      ...currentSettings,
      ...updates,
    }));

    try {
      await setDoc(syncSettingsRef, nextUpdates, { merge: true });
    } catch (error) {
      console.error("Error updating mock draft sync settings:", error);
      toast("Unable to update mock draft sync settings.");
    }
  };

  const handleSyncEnabledChange = async (syncEnabled) => {
    await updateSyncSettings({
      syncEnabled,
      extensionStatus: syncEnabled ? "waiting" : "paused",
      syncMode: syncEnabled ? "chrome_extension" : "manual",
    });
  };

  const handleSyncModeChange = async (syncMode) => {
    await updateSyncSettings({
      syncMode,
      syncEnabled: syncMode === "chrome_extension" ? syncSettings.syncEnabled : false,
      extensionStatus:
        syncMode === "chrome_extension" && syncSettings.syncEnabled ? "waiting" : "paused",
    });
  };

  const handleResetDraft = async () => {
    if (!currentUser || resettingDraft) return;

    const confirmed = window.confirm(
      "Reset the Mock Draft? This clears current auction, mock team drafted players, and mock draft values on targeted players."
    );
    if (!confirmed) return;

    setResettingDraft(true);
    try {
      await ResetMockDraftData(currentUser.uid, teams);
      setDraftTeamId("");
      setDraftAmount("");
      setDraftAmountManuallyEdited(false);
      toast("Mock Draft reset.");
    } catch (error) {
      console.error("Error resetting Mock Draft:", error);
      toast("Unable to reset Mock Draft.");
    } finally {
      setResettingDraft(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <MockDraftHeaderCard
        connectionToken={syncSettings.connectionToken}
        onSyncEnabledChange={handleSyncEnabledChange}
        onSyncModeChange={handleSyncModeChange}
        syncSettings={syncSettings}
        syncStatus={syncStatus}
      />

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
            onResetDraft={handleResetDraft}
            resetButtonLabel="Reset Mock"
            resettingDraft={resettingDraft}
          />
          <DynastyDestroyerAiCard
            currentAuction={currentAuction}
            draftedPlayers={draftedPlayers}
            draftRoomId={currentUser?.uid}
            leagueSettings={leagueSettings}
            myTeam={myTeam}
            players={players}
            teamRosters={teamRosters}
            teams={teams}
          />
          <MyTeamSnapshotCard
            draftedPlayers={draftedPlayers}
            leagueSettings={leagueSettings}
            myTeam={myTeam}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_0.7fr_0.45fr] gap-6 items-start">
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

        <div className="grid grid-cols-1 xl:grid-cols-[0.5fr_1fr_0.5fr] gap-6 items-start">
          <OptimalRosterPathsCard
            draftedPlayers={draftedPlayers}
            leagueSettings={leagueSettings}
            players={players}
            teamRosters={teamRosters}
          />
          <LeagueBudgetBoardCard
            leagueSettings={leagueSettings}
            teamRosters={teamRosters}
            teams={teams}
          />
          <NominationOptimizerCard
            draftedPlayers={draftedPlayers}
            leagueSettings={leagueSettings}
            myTeam={myTeam}
            players={players}
            targetedPlayers={targetedPlayers}
            teamRosters={teamRosters}
            teams={teams}
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

export default MockDraft;
