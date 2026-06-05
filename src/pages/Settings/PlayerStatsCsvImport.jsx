import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

import { Header } from "../../components";
import {
  getPlayerStatsImportStatus,
  processPlayerStatsCsv,
} from "../../globalFunctions/firebasePlayerStatsImport";
import "./PlayerStatsCsvImport.css";

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
            <tr key={`stats-preview-${rowIndex}`}>
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

const UnmatchedPlayersTable = ({ players, manualReview }) => {
  const rows = [
    ...players.map((item) => ({
      ...item,
      reviewStatus: "Unmatched",
      candidates: "",
    })),
    ...manualReview.map((item) => ({
      ...item,
      reviewStatus: "Manual Review",
      candidates: item.candidates
        .map(
          (player) => `${player.fullName} (${player.position}, ${player.nflTeam})`
        )
        .join("; "),
    })),
  ];

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Unmatched Players</h3>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Player</th>
              <th>Pos</th>
              <th>Team</th>
              <th>Season</th>
              <th>Status</th>
              <th>Candidates</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={`stats-unmatched-${index}`}>
                <td>{item.csvPlayer.playerName}</td>
                <td>{item.csvPlayer.position}</td>
                <td>{item.csvPlayer.team}</td>
                <td>{item.csvPlayer.season}</td>
                <td>{item.reviewStatus}</td>
                <td>{item.candidates}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlayerStatsCsvImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvRows, setCsvRows] = useState([]);
  const [importStatus, setImportStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const previewRows = useMemo(() => csvRows.slice(0, 25), [csvRows]);
  const isLoading = status === "loading" || status === "processing";

  const loadStatsImportStatus = async () => {
    const playerStatsStatus = await getPlayerStatsImportStatus();
    setImportStatus(playerStatsStatus);
  };

  useEffect(() => {
    loadStatsImportStatus().catch((error) => {
      setMessage(`Loading import status failed: ${error.message}`);
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
      setMessage("Choose a CSV file before uploading.");
      return;
    }

    setStatus("loading");
    setMessage("Loading...");

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResults) => {
        const rows = parseResults.data ?? [];
        setCsvRows(rows);
        setStatus("idle");
        setMessage(`Loaded ${rows.length.toLocaleString()} CSV rows.`);
      },
      error: (error) => {
        setStatus("failed");
        setMessage(`Import Failed: ${error.message}`);
      },
    });
  };

  const handleProcessCsv = async () => {
    if (csvRows.length === 0 || !selectedFile) {
      setStatus("failed");
      setMessage("Upload a CSV before processing.");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Loading...");
      const importResults = await processPlayerStatsCsv(
        csvRows,
        selectedFile.name,
        setMessage
      );

      setResults(importResults);
      await loadStatsImportStatus();
      setStatus("complete");
      setMessage("Import Complete");
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
      <Header category="Import" title="Import Player Stats CSV" />

      <div className="stats-import-actions">
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
          disabled={isLoading || csvRows.length === 0}
          onClick={handleProcessCsv}
          type="button"
        >
          Process CSV
        </button>
      </div>

      <div className="mt-6">
        <StatusMessage status={status} message={message} />
      </div>

      <div className="card-grid mt-6">
        <StatCard
          label="Last Imported Date"
          value={formatImportDate(displayStatus.lastImportedAt)}
        />
        <StatCard label="File Name" value={displayStatus.fileName ?? "-"} />
        <StatCard
          label="Total Rows Processed"
          value={(displayStatus.totalRowsProcessed ?? 0).toLocaleString()}
        />
        <StatCard
          label="Total Matched Players"
          value={(displayStatus.totalMatched ?? 0).toLocaleString()}
        />
        <StatCard
          label="Total Updated Players"
          value={(displayStatus.totalUpdated ?? 0).toLocaleString()}
        />
        <StatCard
          label="Total Unmatched Players"
          value={(displayStatus.totalUnmatched ?? 0).toLocaleString()}
        />
      </div>

      <PreviewTable rows={previewRows} />

      {results && (
        <UnmatchedPlayersTable
          players={results.unmatched}
          manualReview={results.manualReview}
        />
      )}
    </div>
  );
};

export default PlayerStatsCsvImport;
