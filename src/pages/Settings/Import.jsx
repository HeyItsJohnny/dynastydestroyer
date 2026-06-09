import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

// UI
import { Button, MenuItem, TextField } from "@mui/material";
import { Header } from "../../components";
import PlayerAuctionValuesImport from "./PlayerAuctionValuesImport";
import PlayerStatsCsvImport from "./PlayerStatsCsvImport";
import ProjectedStatsCsvImport from "./ProjectedStatsCsvImport";
import WeeklyStatsCsvImport from "./WeeklyStatsCsvImport";

// Firebase
import {
  getAllSleeperPlayers,
  getImportStatus,
  getPlayerMappings,
  importSleeperPlayers,
  matchCsvPlayers,
  saveManualPlayerMapping,
  saveMatchedPlayerRankings,
} from "../../globalFunctions/firebasePlayerImport";

const formatImportDate = (timestamp) => {
  if (!timestamp) {
    return "Never";
  }

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleString();
  }

  return new Date(timestamp).toLocaleString();
};

const Import = () => {
  const [source, setSource] = useState("fantasyPros");
  const [csvRows, setCsvRows] = useState([]);
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const [unmatchedPlayers, setUnmatchedPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const previewRows = useMemo(() => csvRows.slice(0, 10), [csvRows]);

  const filteredPlayers = useMemo(() => {
    const search = playerSearch.toLowerCase().trim();

    return allPlayers
      .filter((player) => {
        if (!search) {
          return true;
        }

        return `${player.fullName ?? ""} ${player.position ?? ""} ${
          player.nflTeam ?? ""
        }`
          .toLowerCase()
          .includes(search);
      })
      .slice(0, 100);
  }, [allPlayers, playerSearch]);

  const loadPlayersAndMappings = async () => {
    const [playersData, mappingsData] = await Promise.all([
      getAllSleeperPlayers(),
      getPlayerMappings(),
    ]);

    setAllPlayers(playersData);
    setMappings(mappingsData);
  };

  const loadImportStatus = async () => {
    const importStatusData = await getImportStatus();
    setImportStatus(importStatusData?.sleeper ?? null);
  };

  const handleSleeperImport = async () => {
    try {
      setIsWorking(true);
      setStatusMessage("Importing Sleeper players...");
      const results = await importSleeperPlayers();
      await Promise.all([loadPlayersAndMappings(), loadImportStatus()]);
      setStatusMessage(
        `Refreshed ${results.totalUpdated} Sleeper players. Added ${results.totalAdded}. Skipped new players ${results.totalSkippedNewPlayers}. Skipped total ${results.totalSkipped}.`
      );
    } catch (error) {
      setStatusMessage(`Sleeper import failed: ${error.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvRows(results.data);
        setMatchedPlayers([]);
        setUnmatchedPlayers([]);
        setStatusMessage(`Loaded ${results.data.length} CSV rows.`);
      },
      error: (error) => {
        setStatusMessage(`CSV parse failed: ${error.message}`);
      },
    });
  };

  const handleAutoMatch = async () => {
    try {
      setIsWorking(true);
      setStatusMessage("Matching CSV players...");

      if (allPlayers.length === 0 || mappings.length === 0) {
        await loadPlayersAndMappings();
      }

      const playersToUse =
        allPlayers.length > 0 ? allPlayers : await getAllSleeperPlayers();
      const mappingsToUse =
        mappings.length > 0 ? mappings : await getPlayerMappings();
      const results = matchCsvPlayers(csvRows, source, playersToUse, mappingsToUse);

      setMatchedPlayers(results.matched);
      setUnmatchedPlayers(results.unmatched);
      setStatusMessage(
        `Matched ${results.matched.length}. Unmatched ${results.unmatched.length}.`
      );
    } catch (error) {
      setStatusMessage(`Auto-match failed: ${error.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  const handleUnmatchedSelection = (index, sleeperId) => {
    setUnmatchedPlayers((currentPlayers) =>
      currentPlayers.map((player, playerIndex) =>
        playerIndex === index
          ? { ...player, selectedSleeperId: sleeperId }
          : player
      )
    );
  };

  const handleSaveManualMapping = async (index) => {
    const unmatchedPlayer = unmatchedPlayers[index];
    const sleeperPlayer = allPlayers.find(
      (player) => player.id === unmatchedPlayer.selectedSleeperId
    );

    if (!sleeperPlayer) {
      setStatusMessage("Select a Sleeper player before saving the mapping.");
      return;
    }

    try {
      setIsWorking(true);
      await saveManualPlayerMapping(unmatchedPlayer, sleeperPlayer, source);
      await loadPlayersAndMappings();

      setMatchedPlayers((currentMatches) => [
        ...currentMatches,
        {
          csvPlayer: unmatchedPlayer.csvPlayer,
          sleeperPlayer,
          confidence: 100,
          matchType: "manual",
        },
      ]);
      setUnmatchedPlayers((currentPlayers) =>
        currentPlayers.filter((_, playerIndex) => playerIndex !== index)
      );
      setStatusMessage(`Saved mapping for ${unmatchedPlayer.csvPlayer.fullName}.`);
    } catch (error) {
      setStatusMessage(`Manual mapping failed: ${error.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  const handleSaveResults = async () => {
    try {
      setIsWorking(true);
      setStatusMessage("Saving matched rankings...");
      await saveMatchedPlayerRankings(matchedPlayers, source);
      setStatusMessage(`Saved rankings for ${matchedPlayers.length} players.`);
    } catch (error) {
      setStatusMessage(`Save failed: ${error.message}`);
    } finally {
      setIsWorking(false);
    }
  };

  useEffect(() => {
    Promise.all([loadPlayersAndMappings(), loadImportStatus()]).catch((error) => {
      setStatusMessage(`Player load failed: ${error.message}`);
    });
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Import" title="Sleeper Players" />

        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="contained"
            color="primary"
            disabled={isWorking}
            onClick={handleSleeperImport}
          >
            {isWorking ? "Refreshing..." : "Refresh Sleeper Players"}
          </Button>

          <p className="text-sm">
            Loaded Sleeper players: {allPlayers.length.toLocaleString()}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 text-sm">
          <div>
            <p className="font-semibold">Last Imported Date</p>
            <p>{formatImportDate(importStatus?.lastImportedAt)}</p>
          </div>

          <div>
            <p className="font-semibold">Total Imported</p>
            <p>{(importStatus?.totalImported ?? 0).toLocaleString()}</p>
          </div>

          <div>
            <p className="font-semibold">Total Added</p>
            <p>{(importStatus?.totalAdded ?? 0).toLocaleString()}</p>
          </div>

          <div>
            <p className="font-semibold">Total Updated</p>
            <p>{(importStatus?.totalUpdated ?? 0).toLocaleString()}</p>
          </div>

          <div>
            <p className="font-semibold">New Players Skipped</p>
            <p>{(importStatus?.totalSkippedNewPlayers ?? 0).toLocaleString()}</p>
          </div>

          <div>
            <p className="font-semibold">Total Skipped</p>
            <p>
              {(importStatus?.totalSkipped ?? importStatus?.skippedCount ?? 0)
                .toLocaleString()}
            </p>
          </div>

          <div>
            <p className="font-semibold">Active Filter</p>
            <p>
              {importStatus?.filterDescription ??
                "Refresh existing active team players only: QB1, RB1-2, WR1-5, TE1, plus rookies"}
            </p>
          </div>
        </div>

        {statusMessage && <p className="mt-6 text-sm">{statusMessage}</p>}
      </div>

      <PlayerStatsCsvImport />

      <WeeklyStatsCsvImport />

      <ProjectedStatsCsvImport />

      <PlayerAuctionValuesImport />

      <div className="m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Import" title="CSV Upload" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <TextField
            label="Source"
            select
            variant="standard"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <MenuItem value="fantasyPros">FantasyPros</MenuItem>
            <MenuItem value="yahoo">Yahoo</MenuItem>
            <MenuItem value="espn">ESPN</MenuItem>
          </TextField>

          <input type="file" accept=".csv" onChange={handleCsvUpload} />

          <Button
            variant="contained"
            color="primary"
            disabled={isWorking || csvRows.length === 0}
            onClick={handleAutoMatch}
          >
            Auto-Match Players
          </Button>
        </div>

        {previewRows.length > 0 && (
          <div className="mt-8 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(previewRows[0]).map((header) => (
                    <th key={header} className="text-left p-2 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIndex) => (
                  <tr key={`preview-${rowIndex}`}>
                    {Object.keys(previewRows[0]).map((header) => (
                      <td key={header} className="p-2 border-b">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Import" title="Matched Players" />

        <div className="flex flex-wrap gap-6 text-sm">
          <p>Matched: {matchedPlayers.length}</p>
          <p>Unmatched: {unmatchedPlayers.length}</p>
        </div>

        {matchedPlayers.length > 0 && (
          <div className="mt-6 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">CSV Player</th>
                  <th className="text-left p-2 border-b">Sleeper Player</th>
                  <th className="text-left p-2 border-b">Match</th>
                  <th className="text-left p-2 border-b">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {matchedPlayers.slice(0, 50).map((match, index) => (
                  <tr key={`match-${index}`}>
                    <td className="p-2 border-b">{match.csvPlayer.fullName}</td>
                    <td className="p-2 border-b">
                      {match.sleeperPlayer.fullName} ({match.sleeperPlayer.position}
                      , {match.sleeperPlayer.nflTeam})
                    </td>
                    <td className="p-2 border-b">{match.matchType}</td>
                    <td className="p-2 border-b">{match.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Import" title="Unmatched Players" />

        <TextField
          label="Search Sleeper Players"
          variant="standard"
          fullWidth
          value={playerSearch}
          onChange={(e) => setPlayerSearch(e.target.value)}
        />

        <div className="mt-6 grid grid-cols-1 gap-6">
          {unmatchedPlayers.map((unmatchedPlayer, index) => (
            <div
              key={`unmatched-${index}`}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            >
              <div>
                <p className="font-semibold">{unmatchedPlayer.csvPlayer.fullName}</p>
                <p className="text-sm">
                  {unmatchedPlayer.csvPlayer.position}{" "}
                  {unmatchedPlayer.csvPlayer.nflTeam}
                </p>
              </div>

              <TextField
                label="Sleeper Player"
                select
                variant="standard"
                value={unmatchedPlayer.selectedSleeperId}
                onChange={(e) => handleUnmatchedSelection(index, e.target.value)}
              >
                {filteredPlayers.map((player) => (
                  <MenuItem key={player.id} value={player.id}>
                    {player.fullName} ({player.position}, {player.nflTeam})
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                color="primary"
                disabled={isWorking || !unmatchedPlayer.selectedSleeperId}
                onClick={() => handleSaveManualMapping(index)}
              >
                Save Mapping
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Import" title="Save Results" />

        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="contained"
            color="primary"
            disabled={isWorking || matchedPlayers.length === 0}
            onClick={handleSaveResults}
          >
            Save Matched Rankings
          </Button>

          {statusMessage && <p className="text-sm">{statusMessage}</p>}
        </div>
      </div>
    </>
  );
};

export default Import;
