import React from "react";

import { InfoRow } from "./PlayerDetailHelpers";

const DRAFT_INFO_FIELDS = [
  "auctionValue",
  "rank",
  "tier",
  "adp",
  "recommendedMaxBid",
  "hardMaxBid",
];

const DraftInfoCard = ({ resolvePlayerField }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold">Draft Information</div>
      <div className="card-body">
        {DRAFT_INFO_FIELDS.map((fieldKey) => {
          const field = resolvePlayerField(fieldKey);
          return <InfoRow field={field} key={fieldKey} label={field.label} />;
        })}
      </div>
    </div>
  );
};

export default DraftInfoCard;
