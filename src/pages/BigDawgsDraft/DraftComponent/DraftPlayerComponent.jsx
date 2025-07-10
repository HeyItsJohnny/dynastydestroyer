import React from "react";

const DraftPlayerComponent = ({ player }) => {
  const selectPlayer = () => {
    //Move Draft Status to "Pending"
    //Move Player to Current "Auction Draft"
    alert("Button Pressed. " + player.FullName);
  };

  return (
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
  );
};

export default DraftPlayerComponent;
