import React from "react";
import { useNavigate } from "react-router-dom";

const displayValue = (value) =>
  value === undefined || value === null || value === "" ? "-" : value;

const displayCurrency = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return typeof value === "string" && value.startsWith("$") ? value : `$${value}`;
};

const PlayerRow = ({ player }) => {
  const navigate = useNavigate();

  return (
    <tr
      className="players-clickable-row"
      onClick={() => navigate(`/player/${player.id}`)}
    >
      <td className="players-position-col">{displayValue(player.position)}</td>
      <td className="fw-semibold">{displayValue(player.fullName)}</td>
      <td>{displayValue(player.age)}</td>
      <td>{displayValue(player.nflTeam)}</td>
      <td>{displayValue(player.rank)}</td>
      <td>{displayValue(player.tier)}</td>
      <td>{displayCurrency(player.auctionValue)}</td>
      <td>{displayCurrency(player.maxBid)}</td>
      <td>{displayCurrency(player.hardMax)}</td>
      <td>{displayValue(player.depthChartOrder)}</td>
    </tr>
  );
};

export default PlayerRow;
