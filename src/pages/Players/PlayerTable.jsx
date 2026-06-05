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
            <th scope="col">Name</th>
            <th scope="col">Team</th>
            <th scope="col">Pos</th>
            <th scope="col">Depth</th>
            <th scope="col">Age</th>
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
