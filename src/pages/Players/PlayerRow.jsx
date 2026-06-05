import React from "react";

const displayValue = (value) =>
  value === undefined || value === null || value === "" ? "-" : value;

const PlayerRow = ({ player }) => {
  return (
    <tr>
      <td className="fw-semibold">{displayValue(player.fullName)}</td>
      <td>{displayValue(player.nflTeam)}</td>
      <td>{displayValue(player.position)}</td>
      <td>{displayValue(player.depthChartOrder)}</td>
      <td>{displayValue(player.age)}</td>
    </tr>
  );
};

export default PlayerRow;
