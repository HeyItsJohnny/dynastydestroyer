import Papa from "papaparse";
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

const WEEKLY_STATS_SOURCE = "nflverse";

const normalizeHeader = (header) =>
  `${header ?? ""}`.toLowerCase().replace(/[^a-z0-9]/g, "");

export const normalizePlayerName = (name) =>
  `${name ?? ""}`
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getCsvValue = (row, possibleColumnNames) => {
  const lookup = Object.entries(row).reduce((values, [key, value]) => {
    values[normalizeHeader(key)] = value;
    return values;
  }, {});

  const matchingColumn = possibleColumnNames.find(
    (columnName) => lookup[normalizeHeader(columnName)] != null
  );

  return matchingColumn ? lookup[normalizeHeader(matchingColumn)] : "";
};

export const parseNumber = (value) => {
  const parsed = Number(`${value ?? ""}`.replace(/[$,%]/g, "").trim());
  return Number.isNaN(parsed) || `${value ?? ""}`.trim() === "" ? null : parsed;
};

const normalizePosition = (position) =>
  `${position ?? ""}`.toUpperCase().replace("D/ST", "DEF").replace("DST", "DEF");

const normalizeTeam = (team) => {
  const value = `${team ?? ""}`.toUpperCase().trim();
  const aliases = {
    ARZ: "ARI",
    JAC: "JAX",
    LA: "LAR",
    OAK: "LV",
    SD: "LAC",
    STL: "LAR",
    WSH: "WAS",
  };

  return aliases[value] ?? value;
};

const getLastName = (fullName) => {
  const nameParts = normalizePlayerName(fullName).split(" ").filter(Boolean);
  return nameParts[nameParts.length - 1] ?? "";
};

const getPlayerName = (row) =>
  `${getCsvValue(row, [
    "player_display_name",
    "player display name",
    "player_name",
    "player name",
    "player",
    "name",
  ])}`.trim();

const getPlayerId = (row) =>
  `${getCsvValue(row, ["player_id", "gsis_id", "nflverse_id", "id"])}`.trim();

const getSeason = (row) => parseNumber(getCsvValue(row, ["season", "year"]));

const getWeek = (row) => parseNumber(getCsvValue(row, ["week", "game_week"]));

const getYearId = (season) => `${season}`;

const getWeekId = (week) => String(week).padStart(2, "0");

const getPlayerSearchName = (player) =>
  player.searchName || normalizePlayerName(player.fullName);

const getPlayerTeam = (player) => normalizeTeam(player.nflTeam);

const uniquePlayers = (players) => {
  const playerMap = new Map();
  players.forEach((player) => {
    playerMap.set(player.id, player);
  });
  return Array.from(playerMap.values());
};

const getSingleMatch = (candidates) => {
  const players = uniquePlayers(candidates);
  return players.length === 1 ? players[0] : null;
};

export const buildWeeklyStatsDoc = (row) => {
  const playerName = getPlayerName(row);
  const playerId = getPlayerId(row);
  const position = normalizePosition(getCsvValue(row, ["position", "pos"]));
  const team = normalizeTeam(
    getCsvValue(row, ["recent_team", "team", "tm", "nfl team"])
  );
  const opponent = normalizeTeam(
    getCsvValue(row, ["opponent_team", "opponent", "opp"])
  );
  const season = getSeason(row);
  const week = getWeek(row);

  return {
    season,
    week,
    team,
    opponent,
    position,
    passing: {
      completions: parseNumber(getCsvValue(row, ["completions", "cmp"])),
      attempts: parseNumber(getCsvValue(row, ["attempts", "passing_attempts", "att"])),
      yards: parseNumber(getCsvValue(row, ["passing_yards", "pass_yards"])),
      touchdowns: parseNumber(getCsvValue(row, ["passing_tds", "pass_tds"])),
      interceptions: parseNumber(
        getCsvValue(row, ["interceptions", "passing_interceptions", "passing_ints"])
      ),
    },
    rushing: {
      attempts: parseNumber(
        getCsvValue(row, ["carries", "rushing_attempts", "rush_attempts"])
      ),
      yards: parseNumber(getCsvValue(row, ["rushing_yards", "rush_yards"])),
      touchdowns: parseNumber(getCsvValue(row, ["rushing_tds", "rush_tds"])),
    },
    receiving: {
      targets: parseNumber(getCsvValue(row, ["targets", "receiving_targets"])),
      receptions: parseNumber(getCsvValue(row, ["receptions", "receiving_receptions"])),
      yards: parseNumber(getCsvValue(row, ["receiving_yards", "rec_yards"])),
      touchdowns: parseNumber(getCsvValue(row, ["receiving_tds", "rec_tds"])),
    },
    fantasy: {
      points: parseNumber(getCsvValue(row, ["fantasy_points", "fantasy points"])),
      pointsPpr: parseNumber(
        getCsvValue(row, ["fantasy_points_ppr", "fantasy points ppr"])
      ),
    },
    source: {
      provider: WEEKLY_STATS_SOURCE,
      playerId,
      rawPlayerName: playerName,
    },
    timestamps: {
      importedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  };
};

const getNormalizedWeeklyCsvPlayer = (row) => {
  const playerName = getPlayerName(row);

  return {
    playerId: getPlayerId(row),
    playerName,
    normalizedName: normalizePlayerName(playerName),
    lastName: getLastName(playerName),
    position: normalizePosition(getCsvValue(row, ["position", "pos"])),
    team: normalizeTeam(getCsvValue(row, ["recent_team", "team", "tm", "nfl team"])),
    season: getSeason(row),
    week: getWeek(row),
    rawRow: row,
  };
};

export function findMatchingExistingPlayer(row, players) {
  const csvPlayer = getNormalizedWeeklyCsvPlayer(row);

  if (csvPlayer.playerId) {
    const nflverseMatch = getSingleMatch(
      players.filter(
        (player) => `${player.sourceIds?.nflverse ?? ""}` === csvPlayer.playerId
      )
    );

    if (nflverseMatch) {
      return nflverseMatch;
    }

    const gsisMatch = getSingleMatch(
      players.filter((player) => `${player.sourceIds?.gsis ?? ""}` === csvPlayer.playerId)
    );

    if (gsisMatch) {
      return gsisMatch;
    }
  }

  const namePositionTeamMatch = getSingleMatch(
    players.filter(
      (player) =>
        getPlayerSearchName(player) === csvPlayer.normalizedName &&
        player.position === csvPlayer.position &&
        getPlayerTeam(player) === csvPlayer.team
    )
  );

  if (namePositionTeamMatch) {
    return namePositionTeamMatch;
  }

  const namePositionMatch = getSingleMatch(
    players.filter(
      (player) =>
        getPlayerSearchName(player) === csvPlayer.normalizedName &&
        player.position === csvPlayer.position
    )
  );

  if (namePositionMatch) {
    return namePositionMatch;
  }

  return getSingleMatch(
    players.filter(
      (player) =>
        getLastName(player.fullName) === csvPlayer.lastName &&
        player.position === csvPlayer.position &&
        getPlayerTeam(player) === csvPlayer.team
    )
  );
}

const parseCsvFile = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data ?? []),
      error: reject,
    });
  });

const commitBatchChunks = async (writes) => {
  for (let index = 0; index < writes.length; index += 450) {
    const batch = writeBatch(db);
    writes.slice(index, index + 450).forEach((write) => write(batch));
    await batch.commit();
  }
};

const writeWeeklyStats = (player, statsDoc) => (batch) => {
  batch.set(
    doc(
      db,
      "players",
      player.id,
      getYearId(statsDoc.season),
      "weeklyStats",
      getWeekId(statsDoc.week)
    ),
    statsDoc,
    { merge: true }
  );
};

const writeUnmatchedWeeklyStats = (csvPlayer) => (batch) => {
  batch.set(doc(collection(db, "unmatchedWeeklyStatsImports")), {
    source: WEEKLY_STATS_SOURCE,
    playerId: csvPlayer.playerId,
    playerName: csvPlayer.playerName,
    position: csvPlayer.position,
    team: csvPlayer.team,
    season: csvPlayer.season,
    week: csvPlayer.week,
    rawRow: csvPlayer.rawRow,
    createdAt: serverTimestamp(),
  });
};

const saveWeeklyImportStatus = async (fileName, results) => {
  await setDoc(
    doc(db, "settings", "importStatus"),
    {
      weeklyStats: {
        lastImportedAt: serverTimestamp(),
        fileName,
        season: results.season,
        minWeek: results.minWeek,
        maxWeek: results.maxWeek,
        totalRowsProcessed: results.totalRowsProcessed,
        totalMatched: results.totalMatched,
        totalUpdated: results.totalUpdated,
        totalUnmatched: results.totalUnmatched,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
};

export async function getWeeklyStatsImportStatus() {
  const importStatusSnap = await getDoc(doc(db, "settings", "importStatus"));

  if (!importStatusSnap.exists()) {
    return null;
  }

  return importStatusSnap.data().weeklyStats ?? null;
}

export async function importWeeklyStatsCsv(file, selectedYear, onProgress) {
  onProgress?.("Loading...");
  const csvRows = await parseCsvFile(file);
  const importYear = parseNumber(selectedYear);
  const rowsToProcess = csvRows.filter(
    (row) => getPlayerName(row) && getSeason(row) === importYear
  );

  onProgress?.("Loading existing players...");
  const playersSnapshot = await getDocs(collection(db, "players"));
  const players = playersSnapshot.docs.map((playerDoc) => ({
    id: playerDoc.id,
    ...playerDoc.data(),
  }));

  const matched = [];
  const unmatched = [];
  const seasons = [];
  const weeks = [];

  onProgress?.(`Matching ${rowsToProcess.length.toLocaleString()} weekly rows...`);

  rowsToProcess.forEach((row) => {
    const csvPlayer = getNormalizedWeeklyCsvPlayer(row);
    const matchedPlayer = findMatchingExistingPlayer(row, players);

    if (csvPlayer.season != null) {
      seasons.push(csvPlayer.season);
    }

    if (csvPlayer.week != null) {
      weeks.push(csvPlayer.week);
    }

    if (matchedPlayer) {
      matched.push({
        player: matchedPlayer,
        csvPlayer,
        statsDoc: buildWeeklyStatsDoc(row),
      });
    } else {
      unmatched.push({ csvPlayer });
    }
  });

  onProgress?.(`Writing ${matched.length.toLocaleString()} weekly stat docs...`);

  const writes = [
    ...matched.map((match) => writeWeeklyStats(match.player, match.statsDoc)),
    ...unmatched.map((item) => writeUnmatchedWeeklyStats(item.csvPlayer)),
  ];

  await commitBatchChunks(writes);

  const results = {
    fileName: file.name,
    matched,
    unmatched,
    season: importYear,
    minWeek: weeks.length ? Math.min(...weeks) : null,
    maxWeek: weeks.length ? Math.max(...weeks) : null,
    totalRowsProcessed: rowsToProcess.length,
    totalMatched: matched.length,
    totalUpdated: matched.length,
    totalUnmatched: unmatched.length,
  };

  onProgress?.("Saving import status...");
  await saveWeeklyImportStatus(file.name, results);

  return results;
}
