import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";

const SLEEPER_IMPORT_FILTER_DESCRIPTION =
  "Refresh existing active team players only: QB1, RB1-2, WR1-5, TE1, plus rookies";
const ALLOW_NEW_SLEEPER_PLAYER_IMPORTS = false;
const SLEEPER_IMPORT_POSITIONS = ["QB", "RB", "WR", "TE"];
const SLEEPER_DEPTH_CHART_LIMITS = {
  QB: { min: 1, max: 1 },
  RB: { min: 1, max: 2 },
  WR: { min: 1, max: 5 },
  TE: { min: 1, max: 1 },
};

const isSleeperRookie = (player) => {
  const currentYear = new Date().getFullYear();
  const rookieYear = Number(player.metadata?.rookie_year ?? player.rookie_year);
  const draftYear = Number(player.metadata?.draft_year ?? player.draft_year);

  return (
    player.years_exp === 0 ||
    rookieYear === currentYear ||
    draftYear === currentYear
  );
};

const SOURCE_ID_FIELDS = {
  sleeper: ["sleeperId", "sleeper_id", "player_id", "sleeper player id"],
  yahoo: ["yahooId", "yahoo_id", "yahoo player id"],
  fantasyPros: [
    "fantasyProsId",
    "fantasyprosId",
    "fantasy_pros_id",
    "fantasypros player id",
  ],
  espn: ["espnId", "espn_id", "espn player id"],
};

const RANKING_FIELDS = {
  auctionValue: ["auctionValue", "auction_value", "auction", "value", "avg"],
  projectedPoints: [
    "projectedPoints",
    "projected_points",
    "points",
    "fpts",
    "proj pts",
  ],
  rank: ["rank", "overall", "ecr"],
  tier: ["tier"],
};

const normalizeHeader = (header) =>
  `${header ?? ""}`.toLowerCase().replace(/[^a-z0-9]/g, "");

const findRowValue = (row, fieldNames) => {
  const lookup = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});

  const fieldName = fieldNames.find((name) => lookup[normalizeHeader(name)] != null);
  return fieldName ? lookup[normalizeHeader(fieldName)] : "";
};

const toNumberOrNull = (value) => {
  const parsed = Number(`${value ?? ""}`.replace(/[$,%]/g, "").trim());
  return Number.isNaN(parsed) ? null : parsed;
};

const getCsvPlayerName = (row) =>
  findRowValue(row, [
    "player",
    "player name",
    "name",
    "full name",
    "fullName",
    "PlayerName",
  ]);

const getCsvPosition = (row) =>
  `${findRowValue(row, ["position", "pos", "fantasy position"])}`
    .toUpperCase()
    .replace("D/ST", "DEF")
    .replace("DST", "DEF");

const getCsvTeam = (row) =>
  `${findRowValue(row, ["team", "tm", "nfl team", "nflTeam"])}`.toUpperCase();

const getCsvSourceId = (row, source) =>
  findRowValue(row, SOURCE_ID_FIELDS[source] ?? []);

const getRankingValue = (row, rankingField) =>
  toNumberOrNull(findRowValue(row, RANKING_FIELDS[rankingField] ?? []));

export const normalizePlayerName = (name) =>
  `${name ?? ""}`
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compactName = (name) => normalizePlayerName(name).replace(/\s/g, "");

const underscoreName = (name) => normalizePlayerName(name).replace(/\s/g, "_");

const sanitizeMappingKey = (key) =>
  `${key ?? ""}`.toLowerCase().replace(/[^a-z0-9_]/g, "");

export const generatePlayerMappingKeys = (player) => {
  const fullName = player.fullName ?? player.FullName ?? "";
  const firstName = player.firstName ?? player.FirstName ?? "";
  const lastName = player.lastName ?? player.LastName ?? "";
  const position = `${player.position ?? player.Position ?? ""}`.toLowerCase();
  const nflTeam = `${player.nflTeam ?? player.Team ?? ""}`.toLowerCase();
  const firstInitial = normalizePlayerName(firstName).charAt(0);

  return [
    `${compactName(fullName)}_${position}_${nflTeam}`,
    `${underscoreName(fullName)}_${position}_${nflTeam}`,
    `${compactName(lastName)}_${position}_${nflTeam}`,
    `${firstInitial}_${compactName(lastName)}_${position}_${nflTeam}`,
  ]
    .map(sanitizeMappingKey)
    .filter(Boolean);
};

const getSleeperPlayerIdentity = (sleeperPlayer) => {
  const firstName = sleeperPlayer.first_name ?? "";
  const lastName = sleeperPlayer.last_name ?? "";
  const fullName =
    sleeperPlayer.full_name ??
    `${firstName} ${lastName}`.trim() ??
    sleeperPlayer.search_full_name ??
    "";
  const position = sleeperPlayer.position ?? "";
  const nflTeam = sleeperPlayer.team ?? "";
  const searchName = normalizePlayerName(fullName);
  const mappingKeys = generatePlayerMappingKeys({
    fullName,
    firstName,
    lastName,
    position,
    nflTeam,
  });

  return {
    fullName,
    firstName,
    lastName,
    searchName,
    position,
    nflTeam,
    mappingKeys,
  };
};

const getSleeperRefreshFields = (sleeperPlayer) => ({
  nflTeam: sleeperPlayer.team ?? "",
  age: sleeperPlayer.age ?? null,
  yearsExp: sleeperPlayer.years_exp ?? null,
  status: sleeperPlayer.status ?? "",
  injuryStatus: sleeperPlayer.injury_status ?? "",
  active: sleeperPlayer.active === true,
  depthChartOrder: sleeperPlayer.depth_chart_order ?? null,
  depthChartPosition: sleeperPlayer.depth_chart_position ?? "",
  fantasyPositions: sleeperPlayer.fantasy_positions ?? [],
  sleeper: {
    rawData: sleeperPlayer,
    lastSyncedAt: serverTimestamp(),
  },
  timestamps: {
    sleeperUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
});

export const buildNewPlayerDoc = (sleeperPlayer, sleeperId) => {
  const {
    fullName,
    firstName,
    lastName,
    searchName,
    position,
    mappingKeys,
  } = getSleeperPlayerIdentity(sleeperPlayer);

  return {
    sleeperId,
    fullName,
    firstName,
    lastName,
    searchName,
    position,
    ...getSleeperRefreshFields(sleeperPlayer),
    sourceIds: {
      sleeper: sleeperId,
    },
    mapping: {
      keys: mappingKeys,
      aliases: [searchName],
    },
  };
};

export const buildExistingPlayerUpdate = (
  sleeperPlayer,
  existingData,
  sleeperId
) => {
  const {
    fullName,
    firstName,
    lastName,
    searchName,
    mappingKeys,
  } = getSleeperPlayerIdentity(sleeperPlayer);
  const updatePayload = getSleeperRefreshFields(sleeperPlayer);

  if (!existingData.sleeperId) {
    updatePayload.sleeperId = sleeperId;
  }

  if (!existingData.fullName) {
    updatePayload.fullName = fullName;
  }

  if (!existingData.firstName) {
    updatePayload.firstName = firstName;
  }

  if (!existingData.lastName) {
    updatePayload.lastName = lastName;
  }

  if (!existingData.searchName) {
    updatePayload.searchName = searchName;
  }

  if (!existingData.sourceIds?.sleeper) {
    updatePayload.sourceIds = {
      sleeper: sleeperId,
    };
  }

  if (!existingData.mapping?.keys?.length) {
    updatePayload.mapping = {
      ...(updatePayload.mapping ?? {}),
      keys: mappingKeys,
    };
  }

  if (!existingData.mapping?.aliases?.length) {
    updatePayload.mapping = {
      ...(updatePayload.mapping ?? {}),
      aliases: [searchName],
    };
  }

  return updatePayload;
};

export const shouldImportSleeperPlayer = (player) => {
  const position = player.position ?? "";
  const nflTeam = player.team ?? "";
  const depthChartOrder = player.depth_chart_order;
  const depthChartLimit = SLEEPER_DEPTH_CHART_LIMITS[position];

  if (player.active !== true) {
    return false;
  }

  if (!nflTeam || nflTeam === "FA" || nflTeam === "RET") {
    return false;
  }

  if (!SLEEPER_IMPORT_POSITIONS.includes(position) || !depthChartLimit) {
    return false;
  }

  if (isSleeperRookie(player)) {
    return true;
  }

  if (typeof depthChartOrder !== "number") {
    return false;
  }

  return (
    depthChartOrder >= depthChartLimit.min &&
    depthChartOrder <= depthChartLimit.max
  );
};

const commitBatchChunks = async (writes) => {
  for (let index = 0; index < writes.length; index += 450) {
    const batch = writeBatch(db);
    writes.slice(index, index + 450).forEach((write) => write(batch));
    await batch.commit();
  }
};

export async function importOrRefreshSleeperPlayers() {
  const response = await fetch("https://api.sleeper.app/v1/players/nfl");

  if (!response.ok) {
    throw new Error("Sleeper player import failed.");
  }

  const players = await response.json();
  const playerEntries = Object.entries(players);
  const importablePlayers = playerEntries.filter(([, sleeperPlayer]) =>
    shouldImportSleeperPlayer(sleeperPlayer)
  );
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalSkippedNewPlayers = 0;

  for (const [sleeperId, sleeperPlayer] of importablePlayers) {
    const playerRef = doc(db, "players", sleeperId);
    const existingSnap = await getDoc(playerRef);

    if (!existingSnap.exists() && !ALLOW_NEW_SLEEPER_PLAYER_IMPORTS) {
      totalSkippedNewPlayers += 1;
      continue;
    }

    const payload = existingSnap.exists()
      ? buildExistingPlayerUpdate(sleeperPlayer, existingSnap.data(), sleeperId)
      : buildNewPlayerDoc(sleeperPlayer, sleeperId);

    await setDoc(playerRef, payload, { merge: true });

    if (existingSnap.exists()) {
      totalUpdated += 1;
    } else {
      totalAdded += 1;
    }
  }

  const totalSkipped =
    playerEntries.length - importablePlayers.length + totalSkippedNewPlayers;

  await setDoc(
    doc(db, "settings", "importStatus"),
    {
      sleeper: {
        lastImportedAt: serverTimestamp(),
        totalImported: importablePlayers.length,
        totalAdded,
        totalUpdated,
        totalSkipped,
        totalSkippedNewPlayers,
        skippedCount: totalSkipped,
        filterDescription: SLEEPER_IMPORT_FILTER_DESCRIPTION,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );

  return {
    totalImported: importablePlayers.length,
    totalAdded,
    totalUpdated,
    totalSkipped,
    totalSkippedNewPlayers,
    skippedCount: totalSkipped,
    filterDescription: SLEEPER_IMPORT_FILTER_DESCRIPTION,
  };
}

export const importSleeperPlayers = importOrRefreshSleeperPlayers;

export async function getImportStatus() {
  const importStatusSnap = await getDoc(doc(db, "settings", "importStatus"));

  if (!importStatusSnap.exists()) {
    return null;
  }

  return importStatusSnap.data();
}

export async function getAllSleeperPlayers() {
  const playersSnapshot = await getDocs(collection(db, "players"));

  return playersSnapshot.docs.map((playerDoc) => ({
    id: playerDoc.id,
    ...playerDoc.data(),
  }));
}

export async function getPlayerMappings() {
  const mappingsSnapshot = await getDocs(collection(db, "playerMappings"));

  return mappingsSnapshot.docs.map((mappingDoc) => ({
    id: mappingDoc.id,
    ...mappingDoc.data(),
  }));
}

export const normalizeCsvPlayer = (row, source) => {
  const fullName = `${getCsvPlayerName(row)}`.trim();
  const position = getCsvPosition(row);
  const nflTeam = getCsvTeam(row);
  const sourceId = getCsvSourceId(row, source);

  return {
    row,
    source,
    sourceId,
    fullName,
    searchName: normalizePlayerName(fullName),
    position,
    nflTeam,
    mappingKeys: generatePlayerMappingKeys({
      fullName,
      position,
      nflTeam,
    }),
    rankings: {
      auctionValue: getRankingValue(row, "auctionValue"),
      projectedPoints: getRankingValue(row, "projectedPoints"),
      rank: getRankingValue(row, "rank"),
      tier: getRankingValue(row, "tier"),
    },
  };
};

export const getLastName = (fullName) => {
  const nameParts = normalizePlayerName(fullName).split(" ").filter(Boolean);
  return nameParts[nameParts.length - 1] ?? "";
};

export function findMatchingSleeperPlayer(csvPlayer, allPlayers, mappings = []) {
  if (csvPlayer.sourceId) {
    const sourceIdMatch = allPlayers.find(
      (player) => `${player.sourceIds?.[csvPlayer.source] ?? ""}` === `${csvPlayer.sourceId}`
    );

    if (sourceIdMatch) {
      return { player: sourceIdMatch, confidence: 100, matchType: "sourceId" };
    }
  }

  const mappingKeyMatch = mappings.find(
    (mapping) =>
      mapping.source === csvPlayer.source &&
      csvPlayer.mappingKeys.includes(mapping.id)
  );

  if (mappingKeyMatch) {
    const mappedPlayer = allPlayers.find(
      (player) => player.id === mappingKeyMatch.sleeperId
    );

    if (mappedPlayer) {
      return { player: mappedPlayer, confidence: 95, matchType: "mappingKey" };
    }
  }

  const playerMappingKeyMatch = allPlayers.find((player) =>
    (player.mapping?.keys ?? []).some((key) => csvPlayer.mappingKeys.includes(key))
  );

  if (playerMappingKeyMatch) {
    return {
      player: playerMappingKeyMatch,
      confidence: 92,
      matchType: "playerMappingKey",
    };
  }

  const exactMatch = allPlayers.find(
    (player) =>
      player.searchName === csvPlayer.searchName &&
      player.position === csvPlayer.position &&
      `${player.nflTeam ?? ""}`.toUpperCase() === csvPlayer.nflTeam
  );

  if (exactMatch) {
    return { player: exactMatch, confidence: 90, matchType: "namePositionTeam" };
  }

  const lastName = getLastName(csvPlayer.fullName);
  const lastNameMatch = allPlayers.find(
    (player) =>
      getLastName(player.fullName) === lastName &&
      player.position === csvPlayer.position &&
      `${player.nflTeam ?? ""}`.toUpperCase() === csvPlayer.nflTeam
  );

  if (lastNameMatch) {
    return { player: lastNameMatch, confidence: 75, matchType: "lastName" };
  }

  return null;
}

export function matchCsvPlayers(csvRows, source, allPlayers, mappings = []) {
  return csvRows
    .filter((row) => getCsvPlayerName(row))
    .reduce(
      (results, row) => {
        const csvPlayer = normalizeCsvPlayer(row, source);
        const match = findMatchingSleeperPlayer(csvPlayer, allPlayers, mappings);

        if (match) {
          results.matched.push({
            csvPlayer,
            sleeperPlayer: match.player,
            confidence: match.confidence,
            matchType: match.matchType,
          });
        } else {
          results.unmatched.push({
            csvPlayer,
            selectedSleeperId: "",
          });
        }

        return results;
      },
      { matched: [], unmatched: [] }
    );
}

const removeEmptyRankingValues = (rankings) =>
  Object.entries(rankings).reduce((cleanRankings, [key, value]) => {
    if (value !== null && value !== "") {
      cleanRankings[key] = value;
    }

    return cleanRankings;
  }, {});

export async function saveMatchedPlayerRankings(matches, source) {
  const writes = matches.map((match) => (batch) => {
    const rankings = removeEmptyRankingValues(match.csvPlayer.rankings);

    batch.set(
      doc(db, "players", match.sleeperPlayer.id),
      {
        ...(match.csvPlayer.sourceId
          ? { sourceIds: { [source]: `${match.csvPlayer.sourceId}` } }
          : {}),
        rankings,
        timestamps: {
          updatedAt: serverTimestamp(),
        },
      },
      { merge: true }
    );
  });

  await commitBatchChunks(writes);
}

export async function saveManualPlayerMapping(unmatchedPlayer, sleeperPlayer, source) {
  const mappingKey =
    unmatchedPlayer.csvPlayer.mappingKeys[0] ??
    sanitizeMappingKey(
      `${unmatchedPlayer.csvPlayer.searchName}_${unmatchedPlayer.csvPlayer.position}_${unmatchedPlayer.csvPlayer.nflTeam}`
    );

  await setDoc(
    doc(db, "playerMappings", mappingKey),
    {
      sleeperId: sleeperPlayer.id,
      fullName: unmatchedPlayer.csvPlayer.fullName,
      position: unmatchedPlayer.csvPlayer.position,
      nflTeam: unmatchedPlayer.csvPlayer.nflTeam,
      source,
      createdAt: serverTimestamp(),
      confidence: 100,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "players", sleeperPlayer.id),
    {
      sourceIds: unmatchedPlayer.csvPlayer.sourceId
        ? { [source]: `${unmatchedPlayer.csvPlayer.sourceId}` }
        : {},
      mapping: {
        keys: Array.from(
          new Set([
            ...(sleeperPlayer.mapping?.keys ?? []),
            ...unmatchedPlayer.csvPlayer.mappingKeys,
          ])
        ),
        aliases: Array.from(
          new Set([
            ...(sleeperPlayer.mapping?.aliases ?? []),
            unmatchedPlayer.csvPlayer.searchName,
          ])
        ),
      },
      timestamps: {
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
}
