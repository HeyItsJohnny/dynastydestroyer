import React, { useState, useEffect } from "react";
import DraftModal from "../../Modals/DraftModal";

//User ID
import { useAuth } from "../../../../contexts/AuthContext";

import {
  getAuctionDataSettings,
  listenToTeamSpending
} from "../../../../globalFunctions/firebaseAuctionDraft";

const DraftTeamComponent = ({ team }) => {
  const { currentUser } = useAuth();
  const [auctionAmount, setAuctionAmount] = useState(null);
  const [teamSpent, setTeamSpent] = useState(0);

  //Fetch Auction Data
  const fetchAuctionSettings = async () => {
    if (!currentUser) return;
    try {
      const data = await getAuctionDataSettings(currentUser.uid);
      setAuctionAmount(data.AuctionAmount);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
  if (!currentUser) return;

  fetchAuctionSettings();

  const unsubscribe = listenToTeamSpending(currentUser.uid, team.id, (totalSpent) => {
    setTeamSpent(totalSpent);
  });

  return () => unsubscribe();
}, [currentUser, team.id]);

  const remaining = auctionAmount !== null ? auctionAmount - teamSpent : null;

  return (
    <div className="mt-2 w-48">
      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <div>
            <DraftModal team={team} />
            <p className="text-sm text-gray-400">
              Remaining $:{" "}
              <span className="text-white">
                {remaining !== null ? remaining : "Loading..."}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftTeamComponent;
