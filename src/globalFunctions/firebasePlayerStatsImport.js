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

const STATS_SOURCE = "nflverse";

const normalizeHeader = (header) =>
  `${header ?? ""}`.toLowerCase().replace(/[^a-z0-9]/g, "");

const findRowValue = (row, fieldNames) => {
  const lookup = Object.entries(row).reduce((values, [key, value]) => {
    values[normalizeHeader(key)] = value;
    return values;
  }, {});

  const fieldName = fieldNames.find((name) => lookup[normalizeHeader(name)] != null);
  return fieldName ? lookup[normalizeHeader(fieldName)] : "";
};

const toNumberOrNull = (value) => {
  const parsed = Number(`${value ?? ""}`.replace(/[$,%]/g, "").trim());
  return Number.isNaN(parsed) || `${value ?? ""}`.trim() === "" ? null : parsed;
};

const cleanPosition = (value) =>
  `${value ?? ""}`.toUpperCase().replace("D/ST", "DEF").replace("DST", "DEF");

const normalizeTeam = (team) => {
  const value = `${team ?? ""}`.toUpperCase().trim();
  const aliases = {
    ARI: "ARI",
    ARZ: "ARI",
    JAC: "JAX",
    JAX: "JAX",
    LA: "LAR",
    LAR: "LAR",
    LV: "LV",
    OAK: "LV",
    SD: "LAC",
    LAC: "LAC",
    STL: "LAR",
    WAS: "WAS",
    WSH: "WAS",
  };

  return aliases[value] ?? value;
};

export const normalizePlayerName = (name) =>
  `${name ?? ""}`
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getLastName = (fullName) => {
  const nameParts = normalizePlayerName(fullName).split(" ").filter(Boolean);
  return nameParts[nameParts.length - 1] ?? "";
};

const uniquePlayers = (players) => {
  const playerMap = new Map();
  players.forEach((player) => {
    playerMap.set(player.id, player);
  });
  return Array.from(playerMap.values());
};

const getCsvPlayerName = (row) =>
  findRowValue(row, [
    "player_name",
    "player display name",
    "player_display_name",
    "player",
    "player name",
    "name",
    "full name",
    "fullName",
  ]);

export const getHeadshotUrl = (row) => {
  return `${row.headshot_url || row.headshotUrl || row.headshot || ""}`.trim();
};

const normalizeStatsRow = (row, fallbackSeason = null) => {
  const playerName = `${getCsvPlayerName(row)}`.trim();
  const position = cleanPosition(
    findRowValue(row, ["position", "pos", "fantasy position"])
  );
  const team = normalizeTeam(
    findRowValue(row, ["recent_team", "team", "tm", "nfl team", "nflTeam"])
  );
  const season = toNumberOrNull(findRowValue(row, ["season", "year"])) ?? fallbackSeason;

  return {
    source: STATS_SOURCE,
    sourceId: `${findRowValue(row, [
      "player_id",
      "nflverse_id",
      "gsis_id",
      "id",
    ])}`.trim(),
    playerName,
    searchName: normalizePlayerName(playerName),
    lastName: getLastName(playerName),
    position,
    team,
    season,
    stats: {
      season,
      games: toNumberOrNull(findRowValue(row, ["games", "g", "gp"])),
      passingYards: toNumberOrNull(
        findRowValue(row, ["passing_yards", "passing yards", "pass_yds", "pass yds"])
      ),
      passingTDs: toNumberOrNull(
        findRowValue(row, ["passing_tds", "passing touchdowns", "pass_tds", "pass td"])
      ),
      interceptions: toNumberOrNull(
        findRowValue(row, ["interceptions", "passing_ints", "ints", "int"])
      ),
      rushingAttempts: toNumberOrNull(
        findRowValue(row, ["rushing_attempts", "carries", "rush_att", "rush att"])
      ),
      rushingYards: toNumberOrNull(
        findRowValue(row, ["rushing_yards", "rush_yds", "rush yds"])
      ),
      rushingTDs: toNumberOrNull(
        findRowValue(row, ["rushing_tds", "rush_tds", "rush td"])
      ),
      targets: toNumberOrNull(findRowValue(row, ["targets", "tgt", "tgts"])),
      receptions: toNumberOrNull(
        findRowValue(row, ["receptions", "rec", "receiving_receptions"])
      ),
      receivingYards: toNumberOrNull(
        findRowValue(row, ["receiving_yards", "rec_yds", "rec yds"])
      ),
      receivingTDs: toNumberOrNull(
        findRowValue(row, ["receiving_tds", "rec_tds", "rec td"])
      ),
      fantasyPoints: toNumberOrNull(
        findRowValue(row, ["fantasy_points", "fantasy points", "fantasy_points_std"])
      ),
      fantasyPointsPpr: toNumberOrNull(
        findRowValue(row, ["fantasy_points_ppr", "fantasy points ppr", "ppr"])
      ),
    },
    rawRow: row,
  };
};

export const updatePlayerHeadshotIfPresent = (playerRef, row) => (batch) => {
  const headshotUrl = getHeadshotUrl(row);

  if (!headshotUrl) {
    return;
  }

  batch.update(playerRef, {
    "media.headshotUrl": headshotUrl,
  });
};

const getPlayerSearchName = (player) =>
  player.searchName || normalizePlayerName(player.fullName);

const getPlayerTeam = (player) => normalizeTeam(player.nflTeam);

const getMatchResult = (candidates, matchType) => {
  const players = uniquePlayers(candidates);

  if (players.length === 1) {
    return {
      status: "matched",
      player: players[0],
      matchType,
      candidates: [],
    };
  }

  if (players.length > 1) {
    return {
      status: "manualReview",
      player: null,
      matchType,
      candidates: players,
    };
  }

  return null;
};

export function findMatchingPlayer(csvPlayer, allPlayers) {
  if (csvPlayer.sourceId) {
    const sourceIdResult = getMatchResult(
      allPlayers.filter(
        (player) => `${player.sourceIds?.[STATS_SOURCE] ?? ""}` === csvPlayer.sourceId
      ),
      "sourceIds.nflverse"
    );

    if (sourceIdResult) {
      return sourceIdResult;
    }
  }

  const namePositionTeamResult = getMatchResult(
    allPlayers.filter(
      (player) =>
        getPlayerSearchName(player) === csvPlayer.searchName &&
        player.position === csvPlayer.position &&
        getPlayerTeam(player) === csvPlayer.team
    ),
    "namePositionTeam"
  );

  if (namePositionTeamResult) {
    return namePositionTeamResult;
  }

  const lastNamePositionTeamResult = getMatchResult(
    allPlayers.filter(
      (player) =>
        getLastName(player.fullName) === csvPlayer.lastName &&
        player.position === csvPlayer.position &&
        getPlayerTeam(player) === csvPlayer.team
    ),
    "lastNamePositionTeam"
  );

  if (lastNamePositionTeamResult) {
    return lastNamePositionTeamResult;
  }

  const fullNameOnlyResult = getMatchResult(
    allPlayers.filter((player) => getPlayerSearchName(player) === csvPlayer.searchName),
    "fullNameOnly"
  );

  if (fullNameOnlyResult) {
    return fullNameOnlyResult;
  }

  return {
    status: "unmatched",
    player: null,
    matchType: "unmatched",
    candidates: [],
  };
}

const commitBatchChunks = async (writes) => {
  for (let index = 0; index < writes.length; index += 225) {
    const batch = writeBatch(db);
    writes.slice(index, index + 225).forEach((write) => write(batch));
    await batch.commit();
  }
};

export const updatePlayerStats = (match) => (batch) => {
  const playerRef = doc(db, "players", match.player.id);

  batch.set(
    doc(playerRef, "seasonStats", `${match.csvPlayer.season}`),
    {
      season: match.csvPlayer.season,
      stats: {
        ...match.csvPlayer.stats,
        updatedAt: serverTimestamp(),
      },
      source: match.csvPlayer.source,
      sourceId: match.csvPlayer.sourceId,
      rawRow: match.csvPlayer.rawRow,
    },
    { merge: true }
  );

  updatePlayerHeadshotIfPresent(playerRef, match.csvPlayer.rawRow)(batch);
};

const saveUnmatchedStatsImport = (csvPlayer, reason) => (batch) => {
  batch.set(doc(collection(db, "unmatchedStatsImports")), {
    source: csvPlayer.source,
    playerName: csvPlayer.playerName,
    position: csvPlayer.position,
    team: csvPlayer.team,
    season: csvPlayer.season,
    rawRow: csvPlayer.rawRow,
    reason,
    createdAt: serverTimestamp(),
  });
};

export async function saveImportStatus(fileName, results) {
  await setDoc(
    doc(db, "settings", "importStatus"),
    {
      playerStats: {
        lastImportedAt: serverTimestamp(),
        fileName,
        season: results.season,
        totalRowsProcessed: results.totalRowsProcessed,
        totalMatched: results.totalMatched,
        totalUpdated: results.totalUpdated,
        totalUnmatched: results.totalUnmatched,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
}

export async function getPlayerStatsImportStatus() {
  const importStatusSnap = await getDoc(doc(db, "settings", "importStatus"));

  if (!importStatusSnap.exists()) {
    return null;
  }

  return importStatusSnap.data().playerStats ?? null;
}

export async function processPlayerStatsCsv(
  csvRows,
  fileName,
  onProgress,
  selectedYear = null
) {
  const importYear = toNumberOrNull(selectedYear);

  onProgress?.("Loading players...");
  const playersSnapshot = await getDocs(collection(db, "players"));
  const allPlayers = playersSnapshot.docs.map((playerDoc) => ({
    id: playerDoc.id,
    ...playerDoc.data(),
  }));

  const rowsToProcess = csvRows.filter((row) => {
    const rowSeason = toNumberOrNull(findRowValue(row, ["season", "year"]));

    return (
      getCsvPlayerName(row) &&
      (importYear == null || rowSeason == null || rowSeason === importYear)
    );
  });
  const matched = [];
  const unmatched = [];
  const manualReview = [];

  onProgress?.(`Matching ${rowsToProcess.length} rows...`);

  rowsToProcess.forEach((row) => {
    const csvPlayer = normalizeStatsRow(row, importYear);
    const match = findMatchingPlayer(csvPlayer, allPlayers);

    if (match.status === "matched") {
      matched.push({
        csvPlayer,
        player: match.player,
        matchType: match.matchType,
      });
    } else if (match.status === "manualReview") {
      manualReview.push({
        csvPlayer,
        candidates: match.candidates,
        matchType: match.matchType,
      });
    } else {
      unmatched.push({ csvPlayer });
    }
  });

  onProgress?.(`Updating ${matched.length} matched players...`);

  const writes = [
    ...matched.map(updatePlayerStats),
    ...unmatched.map((item) =>
      saveUnmatchedStatsImport(item.csvPlayer, "unmatched")
    ),
    ...manualReview.map((item) =>
      saveUnmatchedStatsImport(item.csvPlayer, "manualReview")
    ),
  ];

  await commitBatchChunks(writes);

  const results = {
    fileName,
    matched,
    unmatched,
    manualReview,
    season: importYear,
    totalRowsProcessed: rowsToProcess.length,
    totalMatched: matched.length,
    totalUpdated: matched.length,
    totalUnmatched: unmatched.length + manualReview.length,
  };

  onProgress?.("Saving import status...");
  await saveImportStatus(fileName, results);

  return results;
}
