import React from "react";

import { PlaceholderBadge } from "./PlayerDetailHelpers";

const WeeklyGameLogCard = ({ rows, isPlaceholder }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>Weekly Game Log</span>
        {isPlaceholder && <PlaceholderBadge label="Placeholder Data" />}
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-hover table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Week</th>
                <th>Opponent</th>
                <th>Pass Yds</th>
                <th>Pass TD</th>
                <th>Rush Yds</th>
                <th>Rush TD</th>
                <th>Rec</th>
                <th>Rec Yds</th>
                <th>Rec TD</th>
                <th>PPR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.week}</td>
                  <td>{row.opponent}</td>
                  <td>{row.passingYards}</td>
                  <td>{row.passingTDs}</td>
                  <td>{row.rushingYards}</td>
                  <td>{row.rushingTDs}</td>
                  <td>{row.receptions}</td>
                  <td>{row.receivingYards}</td>
                  <td>{row.receivingTDs}</td>
                  <td>{row.fantasyPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGameLogCard;
