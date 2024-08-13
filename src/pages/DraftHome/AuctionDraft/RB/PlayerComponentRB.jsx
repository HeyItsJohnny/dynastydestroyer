import React from "react";
import PlayerDetailsRB from "./PlayerDetailsRB";
import PlayerDrafted from "../Modals/PlayerDrafted";

const PlayerComponentRB = ({ item, icon }) => {
  const nameClick = () => {
    alert("Name Click");
  };

  return (
    <>
      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <PlayerDrafted item={item} icon={icon} />
          <div>
            <PlayerDetailsRB item={item} icon={icon} />
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

export default PlayerComponentRB;
