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
import {
  findMatchingPlayer,
  normalizePlayerName,
} from "./firebasePlayerStatsImport";
import { getCsvValue, parseNumber } from "./firebaseWeeklyStatsImport";

const PROJECTED_STATS_SOURCE = "fantasyPros";

const getLastName = (fullName) => {
  const nameParts = normalizePlayerName(fullName).split(" ").filter(Boolean);
  return nameParts[nameParts.length - 1] ?? "";
};

const getProjectedStatsPlayerName = (row) =>
  `${getCsvValue(row, ["Player Name", "player_name", "player", "name"])}`.trim();

const getAuctionValuesPlayerName = (row) =>
  `${getCsvValue(row, ["Player", "Player Name", "player_name", "name"])}`
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .trim();

const getAuctionValue = (row) => {
  const namedValue = getCsvValue(row, ["Value", "Auction Value"]);

  if (namedValue !== "") {
    return parseNumber(namedValue);
  }

  const values = Object.values(row);
  return parseNumber(values[values.length - 1]);
};

const parseStarsValue = (value) => {
  const starsMatch = `${value ?? ""}`.match(/\d+(\.\d+)?/);
  return starsMatch ? Number(starsMatch[0]) : null;
};

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
  for (let index = 0; index < writes.length; index += 225) {
    const batch = writeBatch(db);
    writes.slice(index, index + 225).forEach((write) => write(batch));
    await batch.commit();
  }
};

const getNormalizedProjectedCsvPlayer = (row) => {
  const playerName = getProjectedStatsPlayerName(row);

  return {
    sourceId: "",
    playerName,
    searchName: normalizePlayerName(playerName),
    lastName: getLastName(playerName),
    position: "",
    team: "",
    rawRow: row,
  };
};

const getNormalizedAuctionValuesCsvPlayer = (row) => {
  const playerName = getAuctionValuesPlayerName(row);

  return {
    sourceId: "",
    playerName,
    searchName: normalizePlayerName(playerName),
    lastName: getLastName(playerName),
    position: "",
    team: "",
    rawRow: row,
  };
};

const buildProjectedStatsDoc = (row, selectedYear) => ({
  rank: parseNumber(getCsvValue(row, ["Rank", "RK"])),
  player_name: getProjectedStatsPlayerName(row),
  tier: parseNumber(getCsvValue(row, ["Tier", "Tiers"])),
  adp: parseNumber(getCsvValue(row, ["ADP"])),
  projected_points: parseNumber(getCsvValue(row, ["Projected Points"])),
  auction_value: parseNumber(getCsvValue(row, ["Auction Value"])),
  bye_week: parseNumber(getCsvValue(row, ["Bye Week"])),
  strength_of_schedule: parseStarsValue(getCsvValue(row, ["SOS Season"])),
  source: {
    provider: PROJECTED_STATS_SOURCE,
    rawPlayerName: getProjectedStatsPlayerName(row),
  },
  season: parseNumber(selectedYear),
  timestamps: {
    importedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
});

const writeProjectedStats = (match, selectedYear) => (batch) => {
  const playerRef = doc(db, "players", match.player.id);

  batch.set(
    doc(playerRef, "projectedStats", `${selectedYear}`),
    match.projectedStatsDoc,
    { merge: true }
  );
};

const buildAuctionValuesDoc = (row, selectedYear) => {
  const auctionValue = getAuctionValue(row);
  const maxBid = auctionValue == null ? null : Math.round(auctionValue * 1.125);
  const hardMaxBid = auctionValue == null ? null : Math.round(auctionValue * 1.2);

  return {
    auction_value: auctionValue,
    "Auction Value": auctionValue,
    max_bid: maxBid,
    "Max Bid": maxBid,
    hard_max_bid: hardMaxBid,
    "Hard Max Bid": hardMaxBid,
    source: {
      provider: PROJECTED_STATS_SOURCE,
      rawPlayerName: getAuctionValuesPlayerName(row),
    },
    season: parseNumber(selectedYear),
    timestamps: {
      importedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  };
};

const writeAuctionValues = (match, selectedYear) => (batch) => {
  const playerRef = doc(db, "players", match.player.id);

  batch.set(
    doc(playerRef, "projectedStats", `${selectedYear}`),
    match.auctionValuesDoc,
    { merge: true }
  );
};

const saveProjectedStatsImportStatus = async (fileName, results) => {
  await setDoc(
    doc(db, "settings", "importStatus"),
    {
      projectedStats: {
        lastImportedAt: serverTimestamp(),
        fileName,
        season: results.season,
        totalRowsProcessed: results.totalRowsProcessed,
        totalImported: results.totalImported,
        totalSkipped: results.totalSkipped,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
};

const saveAuctionValuesImportStatus = async (fileName, results) => {
  await setDoc(
    doc(db, "settings", "importStatus"),
    {
      playerAuctionValues: {
        lastImportedAt: serverTimestamp(),
        fileName,
        season: results.season,
        totalRowsProcessed: results.totalRowsProcessed,
        totalImported: results.totalImported,
        totalSkipped: results.totalSkipped,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
};

export async function getProjectedStatsImportStatus() {
  const importStatusSnap = await getDoc(doc(db, "settings", "importStatus"));

  if (!importStatusSnap.exists()) {
    return null;
  }

  return importStatusSnap.data().projectedStats ?? null;
}

export async function getAuctionValuesImportStatus() {
  const importStatusSnap = await getDoc(doc(db, "settings", "importStatus"));

  if (!importStatusSnap.exists()) {
    return null;
  }

  return importStatusSnap.data().playerAuctionValues ?? null;
}

export async function importProjectedStatsCsv(file, selectedYear, onProgress) {
  const importYear = parseNumber(selectedYear);

  onProgress?.("Loading...");
  const csvRows = await parseCsvFile(file);
  const rowsToProcess = csvRows.filter((row) => getProjectedStatsPlayerName(row));

  onProgress?.("Loading existing players...");
  const playersSnapshot = await getDocs(collection(db, "players"));
  const players = playersSnapshot.docs.map((playerDoc) => ({
    id: playerDoc.id,
    ...playerDoc.data(),
  }));

  const matched = [];
  const skipped = [];

  onProgress?.(`Matching ${rowsToProcess.length.toLocaleString()} projected stat rows...`);

  rowsToProcess.forEach((row) => {
    const csvPlayer = getNormalizedProjectedCsvPlayer(row);
    const match = findMatchingPlayer(csvPlayer, players);

    if (match.status === "matched") {
      matched.push({
        player: match.player,
        csvPlayer,
        projectedStatsDoc: buildProjectedStatsDoc(row, importYear),
      });
      return;
    }

    skipped.push({ csvPlayer, matchType: match.matchType });
    console.log(
      `Skipped projected stats import for unmatched player: ${csvPlayer.playerName}`
    );
  });

  onProgress?.(`Writing ${matched.length.toLocaleString()} projected stat docs...`);
  await commitBatchChunks(
    matched.map((match) => writeProjectedStats(match, importYear))
  );

  const results = {
    fileName: file.name,
    matched,
    skipped,
    season: importYear,
    totalRowsProcessed: rowsToProcess.length,
    totalImported: matched.length,
    totalSkipped: skipped.length,
  };

  onProgress?.("Saving import status...");
  await saveProjectedStatsImportStatus(file.name, results);

  return results;
}

export async function importPlayerAuctionValuesCsv(file, selectedYear, onProgress) {
  const importYear = parseNumber(selectedYear);

  onProgress?.("Loading...");
  const csvRows = await parseCsvFile(file);
  const rowsToProcess = csvRows.filter((row) => getAuctionValuesPlayerName(row));

  onProgress?.("Loading existing players...");
  const playersSnapshot = await getDocs(collection(db, "players"));
  const players = playersSnapshot.docs.map((playerDoc) => ({
    id: playerDoc.id,
    ...playerDoc.data(),
  }));

  const matched = [];
  const skipped = [];

  onProgress?.(`Matching ${rowsToProcess.length.toLocaleString()} auction rows...`);

  rowsToProcess.forEach((row) => {
    const csvPlayer = getNormalizedAuctionValuesCsvPlayer(row);
    const match = findMatchingPlayer(csvPlayer, players);

    if (match.status === "matched") {
      matched.push({
        player: match.player,
        csvPlayer,
        auctionValuesDoc: buildAuctionValuesDoc(row, importYear),
      });
      return;
    }

    skipped.push({ csvPlayer, matchType: match.matchType });
    console.log(
      `Skipped auction values import for unmatched player: ${csvPlayer.playerName}`
    );
  });

  onProgress?.(`Writing ${matched.length.toLocaleString()} auction value docs...`);
  await commitBatchChunks(
    matched.map((match) => writeAuctionValues(match, importYear))
  );

  const results = {
    fileName: file.name,
    matched,
    skipped,
    season: importYear,
    totalRowsProcessed: rowsToProcess.length,
    totalImported: matched.length,
    totalSkipped: skipped.length,
  };

  onProgress?.("Saving import status...");
  await saveAuctionValuesImportStatus(file.name, results);

  return results;
}
