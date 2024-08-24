import React from "react";
import PlayerComponent from "./PlayerComponent";

const TeamPlayers = ({ qbData, rbData, wrData, teData }) => {
  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
      <PositionSection title="Quarterbacks" players={qbData} />
      <PositionSection title="Runningbacks" players={rbData} />
      <PositionSection title="Wide Receivers" players={wrData} />
      <PositionSection title="Tight Ends" players={teData} />
    </div>
  );
};

const PositionSection = ({ title, players }) => (
  <div>
    <div className="flex justify-between items-center gap-2 mt-5">
      <p className="text-xl font-semibold">{title}</p>
    </div>
    <div className="mt-5 w-72 md:w-400">
      {players.length > 0 ? (
        players.map((player) =>  <PlayerComponent playerData={player}/>)
      ) : (
        <p>No drafted players available.</p>
      )}
    </div>
  </div>
);

export default TeamPlayers;
