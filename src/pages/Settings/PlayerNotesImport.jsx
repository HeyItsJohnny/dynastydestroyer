import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

import { Header } from "../../components";
import {
  getPlayerNotesImportStatus,
  getPlayerNotesName,
  hasImportablePlayerNote,
  importPlayerNotesCsv,
} from "../../globalFunctions/firebasePlayerNotesImport";
import "./PlayerStatsCsvImport.css";

const YEARS = [
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
];

const formatImportDate = (timestamp) => {
  if (!timestamp) {
    return "Never";
  }

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleString();
  }

  return new Date(timestamp).toLocaleString();
};

const StatusMessage = ({ status, message }) => {
  if (!message) {
    return null;
  }

  const className =
    status === "failed"
      ? "alert alert-danger"
      : status === "complete"
      ? "alert alert-success"
      : "alert alert-info";

  return <div className={className}>{message}</div>;
};

const StatCard = ({ label, value }) => (
  <div className="card">
    <div className="card-title">{label}</div>
    <div className="card-value">{value}</div>
  </div>
);

const PreviewTable = ({ rows }) => {
  if (rows.length === 0) {
    return null;
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="table-responsive mt-6">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`player-notes-preview-${rowIndex}`}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SkippedPlayersTable = ({ skipped }) => {
  if (skipped.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Skipped Players</h3>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Player</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {skipped.map((item, index) => (
              <tr key={`player-notes-skipped-${index}`}>
                <td>{item.csvPlayer.playerName}</td>
                <td>{item.matchType ?? "unmatched"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlayerNotesImport = () => {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvRows, setCsvRows] = useState([]);
  const [importStatus, setImportStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const previewRows = useMemo(
    () =>
      csvRows
        .filter((row) => getPlayerNotesName(row) && hasImportablePlayerNote(row))
        .slice(0, 25),
    [csvRows]
  );
  const isLoading = status === "loading" || status === "processing";

  const loadPlayerNotesImportStatus = async () => {
    const playerNotesStatus = await getPlayerNotesImportStatus();
    setImportStatus(playerNotesStatus);
  };

  useEffect(() => {
    loadPlayerNotesImportStatus().catch((error) => {
      setMessage(`Loading player notes import status failed: ${error.message}`);
      setStatus("failed");
    });
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setCsvRows([]);
    setResults(null);
    setMessage(file ? `Selected ${file.name}.` : "");
    setStatus("idle");
  };

  const handleUploadCsv = () => {
    if (!selectedFile) {
      setStatus("failed");
      setMessage("Choose a player notes CSV file first.");
      return;
    }

    setStatus("loading");
    setMessage("Loading...");

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResults) => {
        const rows = parseResults.data ?? [];
        const importableRows = rows.filter(
          (row) => getPlayerNotesName(row) && hasImportablePlayerNote(row)
        );

        setCsvRows(rows);
        setStatus("idle");
        setMessage(
          `Loaded ${importableRows.length.toLocaleString()} player note rows. Blank notes are ignored.`
        );
      },
      error: (error) => {
        setStatus("failed");
        setMessage(`Import Failed: ${error.message}`);
      },
    });
  };

  const handleProcessCsv = async () => {
    if (!selectedFile) {
      setStatus("failed");
      setMessage("Choose a player notes CSV file first.");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Loading...");
      const importResults = await importPlayerNotesCsv(
        selectedFile,
        selectedYear,
        setMessage
      );

      setResults(importResults);
      await loadPlayerNotesImportStatus();
      setStatus("complete");
      setMessage(
        `Import Complete. Imported: ${importResults.totalImported.toLocaleString()} players. Skipped: ${importResults.totalSkipped.toLocaleString()} players. Blank notes ignored: ${importResults.blankNotesSkipped.toLocaleString()}.`
      );
    } catch (error) {
      setStatus("failed");
      setMessage(`Import Failed: ${error.message}`);
    }
  };

  const displayStatus = {
    ...(importStatus ?? {}),
    ...(results ?? {}),
  };

  return (
    <div className="stats-import m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Import" title="Import Player Notes" />

      <div className="stats-import-actions">
        <select
          className="form-control stats-year-select"
          disabled={isLoading}
          onChange={(event) => setSelectedYear(event.target.value)}
          value={selectedYear}
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <input
          accept=".csv"
          className="form-control"
          disabled={isLoading}
          onChange={handleFileChange}
          type="file"
        />

        <button
          className="btn btn-secondary"
          disabled={isLoading || !selectedFile}
          onClick={handleUploadCsv}
          type="button"
        >
          Upload CSV
        </button>

        <button
          className="btn btn-primary"
          disabled={isLoading || !selectedFile}
          onClick={handleProcessCsv}
          type="button"
        >
          Process Player Notes
        </button>
      </div>

      <div className="mt-6">
        <StatusMessage status={status} message={message} />
      </div>

      <div className="card-grid mt-6">
        <StatCard label="File Name" value={displayStatus.fileName ?? "-"} />
        <StatCard label="Season" value={displayStatus.season ?? selectedYear} />
        <StatCard
          label="Total Rows Processed"
          value={(displayStatus.totalRowsProcessed ?? 0).toLocaleString()}
        />
        <StatCard
          label="Imported"
          value={(displayStatus.totalImported ?? 0).toLocaleString()}
        />
        <StatCard
          label="Skipped"
          value={(displayStatus.totalSkipped ?? 0).toLocaleString()}
        />
        <StatCard
          label="Blank Notes Ignored"
          value={(displayStatus.blankNotesSkipped ?? 0).toLocaleString()}
        />
        <StatCard
          label="Last Imported Date"
          value={formatImportDate(displayStatus.lastImportedAt)}
        />
      </div>

      <PreviewTable rows={previewRows} />

      {results && <SkippedPlayersTable skipped={results.skipped} />}
    </div>
  );
};

export default PlayerNotesImport;
