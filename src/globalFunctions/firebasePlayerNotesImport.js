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

const PLAYER_NOTES_SOURCE = "fantasyPros";

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

const normalizePosition = (position) => {
  const positionValue = `${position ?? ""}`.toUpperCase().trim();
  const positionMatch = positionValue.match(/^(QB|RB|WR|TE|K|DEF|DST|D\/ST)/);

  if (!positionMatch) {
    return positionValue;
  }

  return positionMatch[1].replace("D/ST", "DEF").replace("DST", "DEF");
};

const getLastName = (fullName) => {
  const nameParts = normalizePlayerName(fullName).split(" ").filter(Boolean);
  return nameParts[nameParts.length - 1] ?? "";
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

export const getPlayerNotesName = (row) =>
  `${getCsvValue(row, ["Player", "Player Name", "PLAYER NAME", "player_name", "name"])}`.trim();

export const getPlayerNotesText = (row) =>
  `${getCsvValue(row, ["Notes", "NOTES", "note"])}`.trim();

export const hasImportablePlayerNote = (row) => {
  const notes = getPlayerNotesText(row);

  return notes !== "" && notes.toLowerCase() !== "blank";
};

const getNormalizedNotesCsvPlayer = (row) => {
  const playerName = getPlayerNotesName(row);

  return {
    sourceId: "",
    playerName,
    searchName: normalizePlayerName(playerName),
    lastName: getLastName(playerName),
    position: normalizePosition(getCsvValue(row, ["POS", "Position", "position"])),
    team: normalizeTeam(getCsvValue(row, ["Team", "TEAM", "recent_team"])),
    rawRow: row,
  };
};

const buildPlayerNotesDoc = (row, selectedYear) => ({
  notes: getPlayerNotesText(row),
  season: parseNumber(selectedYear),
  source: {
    provider: PLAYER_NOTES_SOURCE,
    rawPlayerName: getPlayerNotesName(row),
    rawTeam: getCsvValue(row, ["Team", "TEAM"]),
    rawPosition: getCsvValue(row, ["POS", "Position"]),
  },
  timestamps: {
    importedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
});

const writePlayerNotes = (match, selectedYear) => (batch) => {
  const playerRef = doc(db, "players", match.player.id);

  batch.set(
    doc(playerRef, "seasonNotes", `${selectedYear}`),
    match.playerNotesDoc,
    { merge: true }
  );
};

const savePlayerNotesImportStatus = async (fileName, results) => {
  await setDoc(
    doc(db, "settings", "importStatus"),
    {
      playerNotes: {
        lastImportedAt: serverTimestamp(),
        fileName,
        season: results.season,
        totalRowsProcessed: results.totalRowsProcessed,
        totalImported: results.totalImported,
        totalSkipped: results.totalSkipped,
        blankNotesSkipped: results.blankNotesSkipped,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
};

export async function getPlayerNotesImportStatus() {
  const importStatusSnap = await getDoc(doc(db, "settings", "importStatus"));

  if (!importStatusSnap.exists()) {
    return null;
  }

  return importStatusSnap.data().playerNotes ?? null;
}

export async function importPlayerNotesCsv(file, selectedYear, onProgress) {
  const importYear = parseNumber(selectedYear);

  onProgress?.("Loading...");
  const csvRows = await parseCsvFile(file);
  const rowsToProcess = csvRows.filter(
    (row) => getPlayerNotesName(row) && hasImportablePlayerNote(row)
  );
  const blankNotesSkipped = csvRows.filter(
    (row) => getPlayerNotesName(row) && !hasImportablePlayerNote(row)
  ).length;

  onProgress?.("Loading existing players...");
  const playersSnapshot = await getDocs(collection(db, "players"));
  const players = playersSnapshot.docs.map((playerDoc) => ({
    id: playerDoc.id,
    ...playerDoc.data(),
  }));

  const matched = [];
  const skipped = [];

  onProgress?.(`Matching ${rowsToProcess.length.toLocaleString()} player notes...`);

  rowsToProcess.forEach((row) => {
    const csvPlayer = getNormalizedNotesCsvPlayer(row);
    const match = findMatchingPlayer(csvPlayer, players);

    if (match.status === "matched") {
      matched.push({
        player: match.player,
        csvPlayer,
        playerNotesDoc: buildPlayerNotesDoc(row, importYear),
      });
      return;
    }

    skipped.push({ csvPlayer, matchType: match.matchType });
    console.log(`Skipped player notes import for unmatched player: ${csvPlayer.playerName}`);
  });

  onProgress?.(`Writing ${matched.length.toLocaleString()} player note docs...`);
  await commitBatchChunks(matched.map((match) => writePlayerNotes(match, importYear)));

  const results = {
    fileName: file.name,
    matched,
    skipped,
    season: importYear,
    totalRowsProcessed: rowsToProcess.length,
    totalImported: matched.length,
    totalSkipped: skipped.length,
    blankNotesSkipped,
  };

  onProgress?.("Saving import status...");
  await savePlayerNotesImportStatus(file.name, results);

  return results;
}
