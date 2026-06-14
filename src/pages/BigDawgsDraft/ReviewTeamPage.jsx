import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Header } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";
import { getLeagueSettings } from "../../globalFunctions/firebaseLeagueSettings";
import {
  getTopKeeperRecommendations,
  normalizeKeeperPlayer,
} from "../../utils/keeperRecommendationEngine";
import {
  buildFallbackKeeperNotes,
  getOpenAIKeeperNotes,
} from "../../services/openAIKeeperService";
import placeholderAvatar from "../../data/avatar.jpg";
import "../Players/PlayersPage.css";

const ReviewCard = ({ action, children, className = "", title }) => (
  <div
    className={`bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl shadow-sm ${className}`}
  >
    <div className="flex justify-between items-center gap-3 mb-4">
      <p className="text-xl font-semibold mb-0">{title}</p>
      {action}
    </div>
    {children}
  </div>
);

const POSITIONS = ["QB", "RB", "WR", "TE"];

const formatValue = (value) =>
  value === undefined || value === null || value === "" ? "-" : value;

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return `$${Math.round(Number(value) || 0)}`;
};

const formatSignedCurrency = (value) => {
  const parsed = Number(value) || 0;
  const sign = parsed > 0 ? "+" : parsed < 0 ? "-" : "";

  return `${sign}$${Math.abs(Math.round(parsed))}`;
};

const parseCurrencyValue = (value) => Number(`${value ?? ""}`.replace(/[$,]/g, "")) || 0;

const normalizeText = (value) => `${value ?? ""}`.toLowerCase().trim();

const getFirstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getProjectedSeasonYear = (date = new Date()) => date.getFullYear();

const normalizePlayer = (playerDoc) => {
  const data = playerDoc.data();

  return {
    id: playerDoc.id,
    fullName: data.fullName ?? data.FullName ?? "",
    nflTeam: data.nflTeam ?? data.Team ?? "",
    position: data.position ?? data.Position ?? "",
    sleeperId: data.sleeperId ?? data.SleeperID ?? "",
    keepTradeCutIdentifier:
      data.keepTradeCutIdentifier ?? data.KeepTradeCutIdentifier ?? "",
    age: data.age ?? "",
    headshotUrl: getFirstValue(data.headshotUrl, data.media?.headshotUrl, ""),
  };
};

const addProjectedStatsToPlayer = async (player) => {
  const projectedStatsSnap = await getDoc(
    doc(db, "players", player.id, "projectedStats", `${getProjectedSeasonYear()}`)
  );
  const projectedStats = projectedStatsSnap.exists() ? projectedStatsSnap.data() : {};

  return {
    ...player,
    rank: getFirstValue(projectedStats.position_rank, projectedStats.rank, ""),
    positionRank: getFirstValue(projectedStats.position_rank, projectedStats.rank, ""),
    tier: projectedStats.tier ?? "",
    auctionValue: getFirstValue(
      projectedStats.auction_value,
      projectedStats["Auction Value"]
    ),
    maxAuctionValue: getFirstValue(projectedStats.max_bid, projectedStats["Max Bid"]),
    hardMaxAuctionValue: getFirstValue(
      projectedStats.hard_max_bid,
      projectedStats["Hard Max Bid"]
    ),
    projectedPoints: getFirstValue(
      projectedStats.projected_points,
      projectedStats.projectedPoints
    ),
  };
};

const buildReviewPlayerDoc = (player, auctionValue) => ({
  playerId: player.id,
  fullName: player.fullName,
  position: player.position,
  nflTeam: player.nflTeam,
  team: player.nflTeam,
  sleeperId: player.sleeperId,
  keepTradeCutIdentifier: player.keepTradeCutIdentifier,
  age: player.age ?? "",
  headshotUrl: player.headshotUrl ?? "",
  keeperCost: parseCurrencyValue(auctionValue),
  auctionValue: parseCurrencyValue(player.auctionValue) || parseCurrencyValue(auctionValue),
  maxAuctionValue:
    parseCurrencyValue(player.maxAuctionValue) || parseCurrencyValue(player.auctionValue),
  hardMaxAuctionValue:
    parseCurrencyValue(player.hardMaxAuctionValue) ||
    parseCurrencyValue(player.maxAuctionValue),
  projectedPoints: parseCurrencyValue(player.projectedPoints),
  rank: player.rank ?? "",
  positionRank: player.positionRank ?? player.rank ?? "",
  tier: player.tier ?? "",
  updatedAt: serverTimestamp(),
});

const AddReviewPlayerModal = ({
  availablePlayers,
  onClose,
  onSave,
  open,
  position,
  savingPosition,
}) => {
  const [auctionValue, setAuctionValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const filteredPlayers = useMemo(() => {
    const search = normalizeText(searchTerm);

    if (search === "" || selectedPlayerId) {
      return [];
    }

    return availablePlayers
      .filter((player) => player.position === position)
      .filter(
        (player) =>
          normalizeText(player.fullName).includes(search) ||
          normalizeText(player.nflTeam).includes(search)
      )
      .sort((firstPlayer, secondPlayer) =>
        firstPlayer.fullName.localeCompare(secondPlayer.fullName)
      )
      .slice(0, 8);
  }, [availablePlayers, position, searchTerm, selectedPlayerId]);

  const selectedPlayer = availablePlayers.find(
    (player) => player.id === selectedPlayerId
  );
  const canSave =
    Boolean(selectedPlayer) && auctionValue !== "" && Number(auctionValue) >= 0;

  const resetAndClose = () => {
    setAuctionValue("");
    setSearchTerm("");
    setSelectedPlayerId("");
    onClose();
  };

  const savePlayer = async (event) => {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    const saved = await onSave(position, selectedPlayer, auctionValue);

    if (saved) {
      resetAndClose();
    }
  };

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm">
      <form onSubmit={savePlayer}>
        <DialogTitle>Add {position}</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Player"
            margin="dense"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setSelectedPlayerId("");
            }}
            placeholder={`Search ${position}`}
            type="search"
            value={searchTerm}
            variant="standard"
          />

          {!selectedPlayerId && searchTerm !== "" && (
            <div
              className="mt-2 border border-color rounded"
              style={{ maxHeight: 220, overflowY: "auto" }}
            >
              {filteredPlayers.length === 0 ? (
                <p className="text-sm text-gray-400 mb-0 p-3">
                  No matching players found.
                </p>
              ) : (
                filteredPlayers.map((player) => (
                  <button
                    className="w-full text-left py-2 px-3 border-b border-color hover:bg-light-gray"
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayerId(player.id);
                      setSearchTerm(player.fullName);
                    }}
                    type="button"
                  >
                    <span className="font-semibold">{player.fullName}</span>
                    {player.nflTeam && (
                      <span className="text-sm text-gray-400">
                        {" "}
                        ({player.nflTeam})
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {selectedPlayer && (
            <p className="text-sm text-gray-500 mt-2 mb-0">
              Selected: {selectedPlayer.fullName}
              {selectedPlayer.nflTeam ? ` (${selectedPlayer.nflTeam})` : ""}
            </p>
          )}

          <TextField
            fullWidth
            label="Auction Value"
            margin="normal"
            onChange={(event) => setAuctionValue(event.target.value)}
            placeholder="$"
            type="number"
            value={auctionValue}
            variant="standard"
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={resetAndClose}>Cancel</Button>
          <Button
            disabled={!canSave || savingPosition === position}
            type="submit"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const DeleteReviewPlayerModal = ({
  deletingPlayerId,
  onClose,
  onDelete,
  open,
  player,
}) => {
  const isDeleting = deletingPlayerId === player?.id;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete Player?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Do you want to delete {player?.fullName || "this player"} from Keepers?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="error"
          disabled={isDeleting}
          onClick={() => onDelete(player)}
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PositionReviewCard = ({
  availablePlayers,
  deletingPlayerId,
  onAddPlayer,
  onDeletePlayer,
  position,
  reviewPlayers,
  savingPosition,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  return (
    <>
      <ReviewCard
        action={
          <button
            aria-label={`Add ${position}`}
            className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
            onClick={() => setShowAddModal(true)}
            style={{ height: 34, width: 34 }}
            type="button"
          >
            +
          </button>
        }
        className="w-72 md:w-60"
        title={position}
      >
        <ul className="list-unstyled mb-0">
          {reviewPlayers.length === 0 ? (
            <li className="text-sm text-gray-400 py-2">No players added.</li>
          ) : (
            reviewPlayers.map((player) => (
              <li className="border-b border-color" key={player.id}>
                <button
                  className="flex justify-between gap-3 w-full py-2 text-left hover:bg-light-gray"
                  onClick={() => setPlayerToDelete(player)}
                  type="button"
                >
                  <span className="text-gray-500">{player.fullName}</span>
                  <span className="font-semibold text-right">
                    ${getFirstValue(player.keeperCost, player.auctionValue, 0)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </ReviewCard>
      <AddReviewPlayerModal
        availablePlayers={availablePlayers}
        onClose={() => setShowAddModal(false)}
        onSave={onAddPlayer}
        open={showAddModal}
        position={position}
        savingPosition={savingPosition}
      />
      <DeleteReviewPlayerModal
        deletingPlayerId={deletingPlayerId}
        onClose={() => setPlayerToDelete(null)}
        onDelete={async (player) => {
          const deleted = await onDeletePlayer(player);

          if (deleted) {
            setPlayerToDelete(null);
          }
        }}
        open={Boolean(playerToDelete)}
        player={playerToDelete}
      />
    </>
  );
};

const getNoteForRecommendation = (recommendation, notesByPlayerId) =>
  notesByPlayerId[recommendation.player.id] ||
  notesByPlayerId[recommendation.player.playerId] ||
  "";

const mapNotesByPlayerId = (notes = []) =>
  notes.reduce(
    (mappedNotes, note) => ({
      ...mappedNotes,
      [note.playerId]: note.note,
    }),
    {}
  );

const toFirestoreRecommendation = (recommendation, aiNote, aiSummary, rankIndex) =>
  JSON.parse(
    JSON.stringify({
      ...recommendation,
      aiNote,
      aiSummary,
      rankIndex,
    })
  );

const KeeperRecommendationsSection = ({
  aiNotesSummary,
  canGenerateAiNotes,
  canGenerateRecommendations,
  generatingAiNotes,
  generatingRecommendations,
  notesByPlayerId,
  onGenerateAiNotes,
  onGenerateRecommendations,
  recommendations,
}) => {
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const selectedPlayer = selectedRecommendation
    ? normalizeKeeperPlayer(selectedRecommendation.player)
    : null;
  const selectedNote = selectedRecommendation
    ? getNoteForRecommendation(selectedRecommendation, notesByPlayerId)
    : "";
  const detailItems =
    selectedRecommendation && selectedPlayer
      ? [
          ["Keeper Cost", formatCurrency(selectedPlayer.keeperCost)],
          ["Auction Value", formatCurrency(selectedPlayer.auctionValue)],
          ["Max Value", formatCurrency(selectedPlayer.maxAuctionValue)],
          ["Hard Max", formatCurrency(selectedPlayer.hardMaxAuctionValue)],
          [
            "Market Profit",
            formatSignedCurrency(selectedRecommendation.valueMetrics.marketProfit),
          ],
          [
            "Max Bid Cap",
            formatSignedCurrency(selectedRecommendation.valueMetrics.maxBidGap),
          ],
          [
            "Hard Max Cushion",
            formatSignedCurrency(selectedRecommendation.valueMetrics.hardMaxGap),
          ],
          ["Projected Points", formatValue(selectedPlayer.projectedPoints)],
        ]
      : [];

  return (
    <div className="players-page m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <div className="players-toolbar">
        <div>
          <p className="text-xl font-semibold mb-1">
            Top 5 Keeper Recommendations
          </p>
          <p className="text-gray-500 mb-0">
            Rankings are calculated locally. AI notes only explain the locked order.
          </p>
        </div>
      </div>

      {aiNotesSummary && (
        <p className="text-sm text-gray-500 mb-3">{aiNotesSummary}</p>
      )}

      {recommendations.length === 0 ? (
        <div className="players-empty-state">
          {canGenerateRecommendations
            ? "Click Generate Recommendations and Save to create and save your top five."
            : "Add players to your Keepers roster to generate keeper recommendations."}
        </div>
      ) : (
        <div className="table-responsive players-table-wrap">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player</th>
                <th scope="col">Rank/Tier</th>
                <th scope="col">Label</th>
                <th scope="col">Keeper Cost</th>
                <th scope="col">Auction Value</th>
                <th className="keeper-ai-note-col" scope="col">AI Note</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((recommendation, index) => {
                const normalizedPlayer = normalizeKeeperPlayer(recommendation.player);
                const note = getNoteForRecommendation(recommendation, notesByPlayerId);

                return (
                  <tr key={normalizedPlayer.id || normalizedPlayer.playerId}>
                    <td className="fw-semibold">#{index + 1}</td>
                    <td>
                      <button
                        className="d-flex align-items-center gap-3 text-left border-0 bg-transparent p-0"
                        onClick={() => setSelectedRecommendation(recommendation)}
                        type="button"
                      >
                        <img
                          alt={`${normalizedPlayer.fullName} headshot`}
                          className="rounded-circle"
                          src={normalizedPlayer.headshotUrl || placeholderAvatar}
                          style={{
                            height: 42,
                            objectFit: "cover",
                            width: 42,
                          }}
                        />
                        <div>
                          <div className="fw-semibold">
                            {formatValue(normalizedPlayer.fullName)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatValue(normalizedPlayer.position)} /{" "}
                            {formatValue(normalizedPlayer.team)}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td>
                      <span className="badge bg-primary rounded-pill me-2">
                        {normalizedPlayer.positionRank
                          ? `#${normalizedPlayer.positionRank} ${normalizedPlayer.position}`
                          : "-"}
                      </span>
                      <span className="badge bg-secondary rounded-pill">
                        Tier {formatValue(normalizedPlayer.tier)}
                      </span>
                    </td>
                    <td>{recommendation.recommendationLabel}</td>
                    <td>{formatCurrency(normalizedPlayer.keeperCost)}</td>
                    <td>{formatCurrency(normalizedPlayer.auctionValue)}</td>
                    <td className="keeper-ai-note-col">
                      {note || "Generate notes for an AI explanation."}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div
        className="d-flex justify-content-end mt-4"
        style={{ gap: "18px" }}
      >
        <button
          className="btn btn-success rounded-pill px-4"
          disabled={generatingRecommendations || !canGenerateRecommendations}
          onClick={onGenerateRecommendations}
          style={{
            backgroundColor: "#198754",
            borderColor: "#198754",
            borderRadius: "9999px",
            color: "#fff",
          }}
          type="button"
        >
          {generatingRecommendations ? (
            <>
              <span
                aria-hidden="true"
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Generating...
            </>
          ) : (
            "Generate Recommendations and Save"
          )}
        </button>
        <button
          className="btn rounded-pill px-4 text-white"
          disabled={generatingAiNotes || !canGenerateAiNotes}
          onClick={onGenerateAiNotes}
          style={{
            backgroundColor: "#7c3aed",
            borderColor: "#7c3aed",
            borderRadius: "9999px",
            marginLeft: "24px",
          }}
          type="button"
        >
          {generatingAiNotes ? (
            <>
              <span
                aria-hidden="true"
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Generating...
            </>
          ) : (
            "Generate AI Notes"
          )}
        </button>
      </div>

      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setSelectedRecommendation(null)}
        open={Boolean(selectedRecommendation)}
      >
        <DialogTitle>
          {selectedPlayer?.fullName || "Keeper Recommendation"}
        </DialogTitle>
        <DialogContent>
          {selectedRecommendation && selectedPlayer && (
            <>
              <div className="d-flex align-items-center gap-3 mb-4">
                <img
                  alt={`${selectedPlayer.fullName} headshot`}
                  className="rounded-circle"
                  src={selectedPlayer.headshotUrl || placeholderAvatar}
                  style={{ height: 58, objectFit: "cover", width: 58 }}
                />
                <div>
                  <p className="font-semibold mb-1">
                    {selectedRecommendation.recommendationLabel}
                  </p>
                  <p className="text-gray-500 mb-0">
                    {formatValue(selectedPlayer.position)} /{" "}
                    {formatValue(selectedPlayer.team)} - Keeper Score{" "}
                    {selectedRecommendation.keeperScore}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {detailItems.map(([label, value]) => (
                  <div className="border-b border-color py-2" key={label}>
                    <p className="text-gray-500 mb-1">{label}</p>
                    <p className="font-semibold mb-0">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-b border-color py-2 mb-3">
                <p className="text-gray-500 mb-1">AI Note</p>
                <p className="mb-0">
                  {selectedNote || "Generate notes for an AI explanation."}
                </p>
              </div>

              <details>
                <summary className="fw-semibold">Score breakdown</summary>
                <div className="mt-2">
                  {Object.entries(selectedRecommendation.scoreBreakdown).map(
                    ([label, value]) => (
                      <div
                        className="d-flex justify-content-between border-b border-color py-2"
                        key={label}
                      >
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </details>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedRecommendation(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const ReviewTeamPage = () => {
  const { currentUser } = useAuth();
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [reviewPlayers, setReviewPlayers] = useState([]);
  const [deletingPlayerId, setDeletingPlayerId] = useState("");
  const [savingPosition, setSavingPosition] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [leagueSettings, setLeagueSettings] = useState(null);
  const [savedKeeperRecommendations, setSavedKeeperRecommendations] = useState([]);
  const [aiNotesSummary, setAiNotesSummary] = useState("");
  const [notesByPlayerId, setNotesByPlayerId] = useState({});
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [generatingAiNotes, setGeneratingAiNotes] = useState(false);
  const [useAiApis, setUseAiApis] = useState(false);

  useEffect(() => {
    const playersQuery = query(
      collection(db, "players"),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      async (querySnapshot) => {
        const playerList = querySnapshot.docs
          .map(normalizePlayer)
          .filter(
            (player) =>
              POSITIONS.includes(player.position) && player.fullName && player.id
          );

        setAvailablePlayers(await Promise.all(playerList.map(addProjectedStatsToPlayer)));
      },
      (error) => {
        console.error("Error loading players:", error);
        setAvailablePlayers([]);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "userprofile", currentUser.uid, "reviewPlayers"),
      (querySnapshot) => {
        const savedPlayers = querySnapshot.docs.map((playerDoc) => ({
          id: playerDoc.id,
          ...playerDoc.data(),
        }));

        setReviewPlayers(savedPlayers);
      },
      (error) => {
        console.error("Error loading review players:", error);
        setReviewPlayers([]);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "userprofile", currentUser.uid, "keeperrecommendations"),
      (querySnapshot) => {
        const savedRecommendations = querySnapshot.docs
          .map((recommendationDoc) => recommendationDoc.data())
          .filter((recommendation) => recommendation?.player)
          .sort((first, second) => (first.rankIndex ?? 0) - (second.rankIndex ?? 0));

        setSavedKeeperRecommendations(savedRecommendations);
        setAiNotesSummary(savedRecommendations[0]?.aiSummary ?? "");
        setNotesByPlayerId(
          savedRecommendations.reduce((mappedNotes, recommendation) => {
            const playerId = recommendation.player?.id || recommendation.player?.playerId;

            if (!playerId || !recommendation.aiNote) {
              return mappedNotes;
            }

            return {
              ...mappedNotes,
              [playerId]: recommendation.aiNote,
            };
          }, {})
        );
      },
      (error) => {
        console.error("Error loading keeper recommendations:", error);
        toast.error("Unable to load saved keeper recommendations.");
        setSavedKeeperRecommendations([]);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    getLeagueSettings(currentUser.uid)
      .then((settings) => setLeagueSettings(settings))
      .catch((error) => {
        console.error("Error loading league settings:", error);
        setLeagueSettings(null);
      });
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, "userprofile", currentUser.uid),
      (userProfileSnap) => {
        setUseAiApis(userProfileSnap.data()?.UseAIAPIs === true);
      },
      (error) => {
        console.error("Error loading user settings:", error);
        setUseAiApis(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const recommendationPlayers = useMemo(
    () =>
      reviewPlayers.map((savedPlayer) => {
        const playerId = savedPlayer.playerId || savedPlayer.id;
        const availablePlayer = availablePlayers.find(
          (player) => player.id === playerId || player.id === savedPlayer.id
        );

        return {
          ...(availablePlayer ?? {}),
          ...savedPlayer,
          id: playerId,
          playerId,
          fullName: getFirstValue(savedPlayer.fullName, availablePlayer?.fullName, ""),
          name: getFirstValue(savedPlayer.name, savedPlayer.fullName, availablePlayer?.fullName, ""),
          position: getFirstValue(savedPlayer.position, availablePlayer?.position, ""),
          nflTeam: getFirstValue(savedPlayer.nflTeam, savedPlayer.team, availablePlayer?.nflTeam, ""),
          team: getFirstValue(savedPlayer.team, savedPlayer.nflTeam, availablePlayer?.nflTeam, ""),
          headshotUrl: getFirstValue(savedPlayer.headshotUrl, availablePlayer?.headshotUrl, ""),
          keeperCost: getFirstValue(
            savedPlayer.keeperCost,
            savedPlayer.keeperValue,
            savedPlayer.auctionValue,
            availablePlayer?.auctionValue,
            0
          ),
          auctionValue: getFirstValue(availablePlayer?.auctionValue, savedPlayer.auctionValue, 0),
          maxAuctionValue: getFirstValue(
            availablePlayer?.maxAuctionValue,
            savedPlayer.maxAuctionValue,
            savedPlayer.maxBid,
            availablePlayer?.auctionValue,
            0
          ),
          hardMaxAuctionValue: getFirstValue(
            availablePlayer?.hardMaxAuctionValue,
            savedPlayer.hardMaxAuctionValue,
            savedPlayer.hardMax,
            availablePlayer?.maxAuctionValue,
            availablePlayer?.auctionValue,
            0
          ),
          projectedPoints: getFirstValue(
            availablePlayer?.projectedPoints,
            savedPlayer.projectedPoints,
            0
          ),
          rank: getFirstValue(availablePlayer?.rank, savedPlayer.rank, null),
          positionRank: getFirstValue(
            availablePlayer?.positionRank,
            savedPlayer.positionRank,
            savedPlayer.rank,
            null
          ),
          tier: getFirstValue(availablePlayer?.tier, savedPlayer.tier, null),
        };
      }),
    [availablePlayers, reviewPlayers]
  );

  const candidateKeeperRecommendations = useMemo(
    () => getTopKeeperRecommendations(recommendationPlayers, leagueSettings),
    [leagueSettings, recommendationPlayers]
  );

  const reviewPlayersByPosition = useMemo(
    () =>
      POSITIONS.reduce(
        (groupedPlayers, position) => ({
          ...groupedPlayers,
          [position]: reviewPlayers
            .filter((player) => player.position === position)
            .sort((firstPlayer, secondPlayer) =>
              firstPlayer.fullName.localeCompare(secondPlayer.fullName)
            ),
        }),
        {}
      ),
    [reviewPlayers]
  );

  const addPlayer = async (position, player, auctionValue) => {
    if (!currentUser?.uid || !player) {
      return;
    }

    setSavingPosition(position);
    setErrorMessage("");

    try {
      await setDoc(
        doc(db, "userprofile", currentUser.uid, "reviewPlayers", player.id),
        buildReviewPlayerDoc(player, auctionValue),
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("Error saving review player:", error);
      setErrorMessage("Unable to add player. Please try again.");
      return false;
    } finally {
      setSavingPosition("");
    }
  };

  const deletePlayer = async (player) => {
    if (!currentUser?.uid || !player?.id) {
      return false;
    }

    setDeletingPlayerId(player.id);
    setErrorMessage("");

    try {
      await deleteDoc(
        doc(db, "userprofile", currentUser.uid, "reviewPlayers", player.id)
      );
      return true;
    } catch (error) {
      console.error("Error deleting review player:", error);
      setErrorMessage("Unable to delete player. Please try again.");
      return false;
    } finally {
      setDeletingPlayerId("");
    }
  };

  const generateKeeperRecommendations = async () => {
    if (!currentUser?.uid) {
      toast.error("You must be signed in to save keeper recommendations.");
      return;
    }

    if (candidateKeeperRecommendations.length === 0) {
      toast.error("Add players to your Keepers roster first.");
      return;
    }

    setGeneratingRecommendations(true);

    try {
      let notesResponse = buildFallbackKeeperNotes(candidateKeeperRecommendations);

      if (useAiApis) {
        try {
          notesResponse = await getOpenAIKeeperNotes(candidateKeeperRecommendations);
        } catch (error) {
          console.error("Error generating keeper notes:", error);
          toast.error(`AI notes unavailable: ${error.message}`);
        }
      } else {
        toast.error("AI is currently turned off");
      }

      const generatedNotesByPlayerId = mapNotesByPlayerId(notesResponse.notes ?? []);
      const recommendationsCollectionRef = collection(
        db,
        "userprofile",
        currentUser.uid,
        "keeperrecommendations"
      );
      const existingRecommendationsSnap = await getDocs(recommendationsCollectionRef);

      await Promise.all(
        existingRecommendationsSnap.docs.map((recommendationDoc) =>
          deleteDoc(recommendationDoc.ref)
        )
      );

      await Promise.all(
        candidateKeeperRecommendations.map((recommendation, index) => {
          const playerId = recommendation.player.id || recommendation.player.playerId;
          const note = generatedNotesByPlayerId[playerId] ?? "";

          return setDoc(
            doc(
              db,
              "userprofile",
              currentUser.uid,
              "keeperrecommendations",
              playerId
            ),
            {
              ...toFirestoreRecommendation(
                recommendation,
                note,
                notesResponse.summary ?? "",
                index
              ),
              generatedAt: serverTimestamp(),
            }
          );
        })
      );

      setAiNotesSummary(notesResponse.summary ?? "");
      setNotesByPlayerId(generatedNotesByPlayerId);
      toast.success("Keeper recommendations saved.");
    } catch (error) {
      console.error("Error saving keeper recommendations:", error);
      toast.error(`Unable to save keeper recommendations: ${error.message}`);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const generateAiNotesForSavedRecommendations = async () => {
    if (!currentUser?.uid) {
      toast.error("You must be signed in to save AI notes.");
      return;
    }

    if (savedKeeperRecommendations.length === 0) {
      toast.error("Generate and save keeper recommendations first.");
      return;
    }

    if (!useAiApis) {
      toast.error("AI is currently turned off");
      return;
    }

    setGeneratingAiNotes(true);

    try {
      const notesResponse = await getOpenAIKeeperNotes(savedKeeperRecommendations);
      const generatedNotesByPlayerId = mapNotesByPlayerId(notesResponse.notes ?? []);

      await Promise.all(
        savedKeeperRecommendations.map((recommendation) => {
          const playerId = recommendation.player.id || recommendation.player.playerId;
          const note = generatedNotesByPlayerId[playerId] ?? "";

          return setDoc(
            doc(
              db,
              "userprofile",
              currentUser.uid,
              "keeperrecommendations",
              playerId
            ),
            {
              aiNote: note,
              aiSummary: notesResponse.summary ?? "",
              aiNotesGeneratedAt: serverTimestamp(),
            },
            { merge: true }
          );
        })
      );

      setAiNotesSummary(notesResponse.summary ?? "");
      setNotesByPlayerId(generatedNotesByPlayerId);
      toast.success("AI notes saved.");
    } catch (error) {
      console.error("Error generating AI notes:", error);
      toast.error(`Unable to generate AI notes: ${error.message}`);
    } finally {
      setGeneratingAiNotes(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Command Center" title="Keepers" />
        <p className="text-gray-500 mb-0">
          Keeper workspace for entering your roster, reviewing imported player data,
          and generating keep/cut recommendations.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {POSITIONS.map((position) => (
          <PositionReviewCard
            availablePlayers={availablePlayers}
            deletingPlayerId={deletingPlayerId}
            key={position}
            onAddPlayer={addPlayer}
            onDeletePlayer={deletePlayer}
            position={position}
            reviewPlayers={reviewPlayersByPosition[position]}
            savingPosition={savingPosition}
          />
        ))}
      </div>
      {errorMessage && (
        <p className="text-center text-sm text-danger mb-0">{errorMessage}</p>
      )}

      <KeeperRecommendationsSection
        aiNotesSummary={aiNotesSummary}
        canGenerateAiNotes={savedKeeperRecommendations.length > 0}
        canGenerateRecommendations={candidateKeeperRecommendations.length > 0}
        generatingAiNotes={generatingAiNotes}
        generatingRecommendations={generatingRecommendations}
        notesByPlayerId={notesByPlayerId}
        onGenerateAiNotes={generateAiNotesForSavedRecommendations}
        onGenerateRecommendations={generateKeeperRecommendations}
        recommendations={savedKeeperRecommendations}
      />

    </>
  );
};

export default ReviewTeamPage;
