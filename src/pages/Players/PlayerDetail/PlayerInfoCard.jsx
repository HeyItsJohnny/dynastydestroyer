import React from "react";

import { InfoRow } from "./PlayerDetailHelpers";

const PLAYER_INFO_FIELDS = [
  "fullName",
  "nflTeam",
  "position",
  "age",
  "status",
  "depthChartPosition",
  "yearsExp",
  "height",
  "weight",
  "college",
  "byeWeek",
];

const PlayerInfoCard = ({ resolvePlayerField }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold">Player Information</div>
      <div className="card-body">
        {PLAYER_INFO_FIELDS.map((fieldKey) => {
          const field = resolvePlayerField(fieldKey);
          return <InfoRow field={field} key={fieldKey} label={field.label} />;
        })}
      </div>
    </div>
  );
};

export default PlayerInfoCard;
