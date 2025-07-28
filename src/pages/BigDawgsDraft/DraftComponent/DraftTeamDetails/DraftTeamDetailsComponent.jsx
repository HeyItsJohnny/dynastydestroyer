import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../../../contexts/AuthContext";

const positionOrder = ["QB", "RB", "WR", "TE"];

const DraftTeamDetailsComponent = ({ team }) => {
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!currentUser || !team?.id) return;

    const db = getFirestore();
    const playersRef = collection(
      db,
      `userprofile/${currentUser.uid}/teams/${team.id}/players`
    );

    // 🔥 Listen in real-time for changes
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const fetchedPlayers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by position (custom order), then by position rank
      fetchedPlayers.sort((a, b) => {
        const posA = positionOrder.indexOf(a.Position || "ZZ");
        const posB = positionOrder.indexOf(b.Position || "ZZ");

        if (posA !== posB) return posA - posB;
        return (a.PositionRank || 999) - (b.PositionRank || 999);
      });

      setPlayers(fetchedPlayers);
    });

    // 🔄 Clean up listener when component unmounts
    return () => unsubscribe();
  }, [team]);
  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <Typography variant="h6" gutterBottom>
            {team.TeamName}
          </Typography>
        </div>
        <Box
          sx={{
            maxHeight: 400, // Set a fixed height
            overflowY: "auto", // Enable vertical scrolling
            paddingRight: 2, // Add some padding on the right for better look
          }}
          className="mt-5 w-72 md:w-200"
        >
          {players.map((player) => (
            <div key={player.id} className="flex justify-between mt-4">
              <div className="flex gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {player.FullName || "N/A"} ({player.Team || "N/A"})
                  </p>
                  <p className="text-sm text-gray-400">
                    {player.Position} Rank: {player.PositionRank || "?"}
                  </p>
                </div>
              </div>
              <p className="text-green-600 text-sm font-semibold">
                ${player.DraftAmount || 0}
              </p>
            </div>
          ))}
        </Box>
      </div>
    </>
  );
};

export default DraftTeamDetailsComponent;
