import React from "react";
import { useNavigate } from "react-router-dom";

const displayValue = (value) =>
  value === undefined || value === null || value === "" ? "-" : value;

const PlayerRow = ({ player }) => {
  const navigate = useNavigate();

  return (
    <tr
      className="players-clickable-row"
      onClick={() => navigate(`/player/${player.id}`)}
    >
      <td>{displayValue(player.position)}</td>
      <td className="fw-semibold">{displayValue(player.fullName)}</td>
      <td>{displayValue(player.nflTeam)}</td>
      <td>{displayValue(player.rank)}</td>
      <td>{displayValue(player.tier)}</td>
      <td>{displayValue(player.depthChartOrder)}</td>
      <td>{displayValue(player.age)}</td>
    </tr>
  );
};

export default PlayerRow;
