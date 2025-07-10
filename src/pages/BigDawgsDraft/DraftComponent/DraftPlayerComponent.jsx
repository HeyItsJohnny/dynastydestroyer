import React from "react";
import { CreateOrUpdateCurrentDraftPlayer } from "../../../globalFunctions/firebaseAuctionDraft";
import { useAuth } from "../../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DraftPlayerComponent = ({ player }) => {
  const { currentUser } = useAuth();

  const selectPlayer = () => {
    CreateOrUpdateCurrentDraftPlayer(currentUser.uid, player);
    toast(player.FullName + ' added to Auction Draft');
  };

  return (
    <>
      <ToastContainer />
      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <div>
            <button type="button" onClick={selectPlayer}>
              <p className="text-sm font-semibold">
                {player.FullName} ({player.Position})
              </p>
            </button>
            <p className="text-sm text-gray-400">
              {player.Position} Rank: {player.PositionRank}
            </p>
            <p className="text-sm text-gray-400">{player.Team}</p>
          </div>
        </div>

        <p className={`text-green-600`}>{player.TotalPoints} pts</p>
      </div>
    </>
  );
};

export default DraftPlayerComponent;
