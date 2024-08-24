import React from "react";

const PlayerComponent = ({ playerData }) => {
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
        ></button>

        <div>
          <p className="text-md font-semibold">{playerData.FullName}</p>
          <p className="text-sm text-gray-400">
            Total Points: {playerData.TotalPoints}
          </p>
        </div>
      </div>
      <p className={`text-green-600`}>Price: {playerData.DraftPrice}</p>
    </div>
  );
};

export default PlayerComponent;
