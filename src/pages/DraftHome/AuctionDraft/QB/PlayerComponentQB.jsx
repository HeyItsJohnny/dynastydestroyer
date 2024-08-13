import React from "react";
import PlayerDetailsQB from "./PlayerDetailsQB";

const PlayerComponentQB = ({ item, icon }) => {
  const nameClick = () => {
    alert("Name Click");
  };

  return (
    <>
      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <PlayerDetailsQB item={item} icon={icon} />
          <div>
            <button type="button" onClick={nameClick}>
              <p className="text-sm font-semibold">{item.FullName}</p>
            </button>
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

export default PlayerComponentQB;
