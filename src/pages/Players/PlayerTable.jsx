import React from "react";
import PlayerRow from "./PlayerRow";

const PlayerTable = ({ players }) => {
  if (players.length === 0) {
    return <div className="players-empty-state">No players found</div>;
  }

  return (
    <div className="table-responsive players-table-wrap">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead>
          <tr>
            <th className="players-position-col" scope="col">Position</th>
            <th scope="col">Name</th>
            <th scope="col">Age</th>
            <th scope="col">Team</th>
            <th scope="col">Rank</th>
            <th scope="col">Tier</th>
            <th scope="col">Auction Value</th>
            <th scope="col">Max Value</th>
            <th scope="col">Hard Max Value</th>
            <th scope="col">Depth</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
