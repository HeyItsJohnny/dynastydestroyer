import React, { useState, useEffect } from "react";

//Firebase
import { db } from "../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";

//UI
import {
  TextField,
  Box,
  Typography,
} from "@mui/material";

const DraftPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [searchPlayerQuery, setSearchPlayerQuery] = useState("");

  const inputStyles = {
    color: "white",
  };

  const selectPlayer = (player) => {
    //Move Draft Status to "Pending"
    //Move Player to Current "Auction Draft"
    alert("Button Pressed. " + player.FullName);
  };

  const filteredPlayers = players
    .filter((item) =>
      item.FullName.toLowerCase().includes(searchPlayerQuery.toLowerCase())
    )
    .splice(0, 5);

  const fetchPlayerData = async () => {
    const docCollection = query(
      collection(db, "players"),
      where("DraftStatus", "==", "N/A"),
      orderBy("PositionRank")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          Age: doc.data().Age,
          College: doc.data().College,
          DepthChartOrder: doc.data().DepthChartOrder,
          DraftStatus: doc.data().DraftStatus,
          FirstName: doc.data().FirstName,
          FullName: doc.data().FullName,
          InjuryNotes: doc.data().InjuryNotes,
          InjuryStatus: doc.data().Status,
          DatabaseID: doc.data().DatabaseID,
          KeepTradeCutIdentifier: doc.data().KeepTradeCutIdentifier,
          LastName: doc.data().LastName,
          NonSuperFlexValue: doc.data().NonSuperFlexValue,
          Position: doc.data().Position,
          SleeperID: doc.data().SleeperID,
          SearchFirstName: doc.data().SearchFirstName,
          SearchFullName: doc.data().SearchFullName,
          SearchLastName: doc.data().SearchLastName,
          SearchRank: doc.data().SearchRank,
          Status: doc.data().Status,
          SuperFlexValue: doc.data().SuperFlexValue,
          Team: doc.data().Team,
          YearsExperience: doc.data().YearsExperience,
          Fumbles: doc.data().Fumbles,
          PassingYards: doc.data().PassingYards,
          PassingTDs: doc.data().PassingTDs,
          PassingINT: doc.data().PassingINT,
          RushingYDS: doc.data().RushingYDS,
          RushingTDs: doc.data().RushingTDs,
          ReceivingRec: doc.data().ReceivingRec,
          ReceivingYDS: doc.data().ReceivingYDS,
          ReceivingTDs: doc.data().ReceivingTDs,
          ReceivingTargets: doc.data().ReceivingTargets,
          ReceptionPercentage: doc.data().ReceptionPercentage,
          RedzoneTargets: doc.data().RedzoneTargets,
          RedzoneTouches: doc.data().RedzoneTouches,
          PositionRank: doc.data().PositionRank,
          TotalPoints: doc.data().TotalPoints,
        };
        list.push(data);
      });
      setPlayers(list);
    });
  };

  useEffect(() => {
    fetchPlayerData();
    return () => {
      setPlayers([]);
    };
  }, []);

  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
      <div className="flex justify-between items-center gap-2">
        <Typography variant="h6" gutterBottom>
          Search Players
        </Typography>
      </div>
      <TextField
        InputProps={{ style: inputStyles }}
        InputLabelProps={{ style: inputStyles }}
        variant="outlined"
        fullWidth
        placeholder="Search"
        value={searchPlayerQuery}
        onChange={(e) => setSearchPlayerQuery(e.target.value)}
        sx={{ marginBottom: 1 }} // Add some margin at the bottom
      />
      <Box
        sx={{
          maxHeight: 400, // Set a fixed height
          overflowY: "auto", // Enable vertical scrolling
          paddingRight: 2, // Add some padding on the right for better look
        }}
        className="mt-5 w-72 md:w-200"
      >
        {filteredPlayers.map((player) => (
          <div className="flex justify-between mt-4">
            <div className="flex gap-4">
              <div>
                <button type="button" onClick={selectPlayer(player)}>
                  <p className="text-sm font-semibold">{player.FullName} ({player.Position})</p>
                </button>
                <p className="text-sm text-gray-400">{player.Position} Rank: {player.PositionRank}</p>
                <p className="text-sm text-gray-400">{player.Team}</p>
              </div>
            </div>

            <p className={`text-green-600`}>{player.TotalPoints} pts</p>
          </div>
        ))}
      </Box>
    </div>
  );
};

export default DraftPlayers;
