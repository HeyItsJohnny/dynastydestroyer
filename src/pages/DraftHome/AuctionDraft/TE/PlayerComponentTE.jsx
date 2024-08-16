import React from "react";
import PlayerDetailsTE from "./PlayerDetailsTE";
import PlayerDrafted from "../Modals/PlayerDrafted";

const PlayerComponentTE = ({ item, icon, auctionSettings }) => {

  return (
    <>
      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <PlayerDrafted item={item} icon={icon} auctionSettings={auctionSettings}/>
          <div>
            <PlayerDetailsTE item={item} icon={icon} />
            <p className="text-sm text-gray-400">
              Total Points: {item.TotalPoints}
            </p>
          </div>
        </div>

        <p className={`text-green-600`}>Rank: {item.AuctionRank}</p>
      </div>
    </>
  );
};

export default PlayerComponentTE;
