import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
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

import { Header } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";

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

const Pill = ({ children, tone = "secondary" }) => (
  <span className={`badge bg-${tone} rounded-pill px-3 py-2 me-2 mb-2`}>
    {children}
  </span>
);

const POSITIONS = ["QB", "RB", "WR", "TE"];

const normalizeText = (value) => `${value ?? ""}`.toLowerCase().trim();

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
  };
};

const buildReviewPlayerDoc = (player, auctionValue) => ({
  playerId: player.id,
  fullName: player.fullName,
  position: player.position,
  nflTeam: player.nflTeam,
  sleeperId: player.sleeperId,
  keepTradeCutIdentifier: player.keepTradeCutIdentifier,
  auctionValue: Number(auctionValue) || 0,
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
          Do you want to delete {player?.fullName || "this player"} from Pre-Draft?
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
                    ${player.auctionValue}
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

const ReviewTeamPage = () => {
  const { currentUser } = useAuth();
  const currentYear = new Date().getFullYear();
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [reviewPlayers, setReviewPlayers] = useState([]);
  const [deletingPlayerId, setDeletingPlayerId] = useState("");
  const [savingPosition, setSavingPosition] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const playersQuery = query(
      collection(db, "players"),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(
      playersQuery,
      (querySnapshot) => {
        const playerList = querySnapshot.docs
          .map(normalizePlayer)
          .filter(
            (player) =>
              POSITIONS.includes(player.position) && player.fullName && player.id
          );

        setAvailablePlayers(playerList);
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

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Command Center" title="Pre-Draft" />
        <p className="text-gray-500 mb-0">
          Draft prep workspace for entering your roster, reviewing imported player data,
          and eventually generating keep/cut recommendations.
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

      <div className="flex gap-4 flex-wrap justify-center">
        <ReviewCard className="md:w-600" title="AI Review Outline">
          <p className="text-gray-500">
            Future analysis will compare your roster against imported ranks, tiers,
            projected stats, auction values, season notes, and player flags.
          </p>
          <div className="mt-4">
            <Pill tone="success">Keeper Value</Pill>
            <Pill tone="primary">Auction Edge</Pill>
            <Pill tone="warning">Risk Flags</Pill>
            <Pill tone="danger">Replacement Cost</Pill>
          </div>
        </ReviewCard>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <ReviewCard className="md:w-400" title={`${currentYear} Keepers`}>
          <ul className="list-unstyled mb-0">
            <li className="border-b border-color py-2">Bijan Robinson - Keep</li>
            <li className="border-b border-color py-2">Ja'Marr Chase - Keep</li>
            <li className="border-b border-color py-2">Puka Nacua - Keep</li>
          </ul>
        </ReviewCard>

        <ReviewCard className="md:w-400" title="Bubble Players">
          <ul className="list-unstyled mb-0">
            <li className="border-b border-color py-2">Player A - Review Cost</li>
            <li className="border-b border-color py-2">Player B - Monitor Role</li>
            <li className="border-b border-color py-2">Player C - Compare Tier</li>
          </ul>
        </ReviewCard>

        <ReviewCard className="md:w-400" title="Cut Candidates">
          <ul className="list-unstyled mb-0">
            <li className="border-b border-color py-2">Player D - Low Ceiling</li>
            <li className="border-b border-color py-2">Player E - Poor Value</li>
            <li className="border-b border-color py-2">Player F - Replaceable</li>
          </ul>
        </ReviewCard>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <ReviewCard className="md:w-600" title="Roster Needs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Primary Need</p>
              <p className="font-semibold mb-0">RB depth</p>
            </div>
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Secondary Need</p>
              <p className="font-semibold mb-0">Upside WR</p>
            </div>
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Budget Focus</p>
              <p className="font-semibold mb-0">Preserve $22 for tier breaks</p>
            </div>
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Draft Posture</p>
              <p className="font-semibold mb-0">Aggressive early, patient late</p>
            </div>
          </div>
        </ReviewCard>

        <ReviewCard className="md:w-600" title="Data To Use Later">
          <div className="d-flex flex-wrap">
            <Pill>Projected Rank</Pill>
            <Pill>Tier</Pill>
            <Pill>ADP</Pill>
            <Pill>Auction Value</Pill>
            <Pill>Max Bid</Pill>
            <Pill>Hard Max</Pill>
            <Pill>Season Notes</Pill>
            <Pill>Target Flags</Pill>
            <Pill>Do Not Draft Flags</Pill>
            <Pill>Sleeper Flags</Pill>
            <Pill>Last Season Stats</Pill>
            <Pill>Weekly Game Logs</Pill>
          </div>
        </ReviewCard>
      </div>
    </>
  );
};

export default ReviewTeamPage;
