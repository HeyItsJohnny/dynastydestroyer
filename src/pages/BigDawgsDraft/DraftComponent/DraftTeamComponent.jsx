import React from "react";
import DraftModal from "../Modals/DraftModal";
const DraftTeamComponent = ({ team }) => {

  const handleButton = () => {
    alert("Button Pressed.");
  };

  return (
    <div className="mt-2 w-48">
      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <div>
            <DraftModal team={team} />
            <p className="text-sm text-gray-400">Remaining $:</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftTeamComponent;
