import React from "react";

import { FieldValue } from "./PlayerDetailHelpers";

const PositionRankingCard = ({ position, resolvePlayerField }) => {
  const positionRank = resolvePlayerField("positionRank");
  const overallRank = resolvePlayerField("overallRank");
  const tier = resolvePlayerField("tier");
  const positionLabel = position || "RB";

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold">Position Ranking</div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">{positionLabel} Rank</div>
              <div className="fs-5 fw-semibold">
                <FieldValue field={positionRank} />
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Overall Rank</div>
              <div className="fs-5 fw-semibold">
                <FieldValue field={overallRank} />
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Tier</div>
              <div className="fs-5 fw-semibold">
                <FieldValue field={tier} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionRankingCard;
