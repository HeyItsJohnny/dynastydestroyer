import React from "react";
const DraftTeamComponent = ({ team }) => {

  const handleButton = () => {
    alert("Button Pressed.");
  };

  return (
    <div className="mt-2 w-48">
      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <div>
            <button
              type="button"
              onClick={handleButton}
            >
              <p className="text-sm font-semibold">{team.TeamName}</p>
            </button>
            <p className="text-sm text-gray-400">Remaining $:</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftTeamComponent;
