import React from "react";

const PlayerComponentQB = ({item, icon}) => {
  return (
    <div className="flex justify-between mt-4">
      <div className="flex gap-4">
        <button
          type="button"
          style={{
            backgroundColor: "#1A97F5",
            color: "White",
          }}
          className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
        >
          {icon}
        </button>

        <div>
          <p className="text-md font-semibold">
            {item.FullName}
          </p>
          <p className="text-sm text-gray-400">Total Points: {item.TotalPoints}</p>
        </div>
      </div>
      <p className={`text-green-600`}>Rank: {item.AuctionRank}</p>
    </div>
  );
};

export default PlayerComponentQB;
