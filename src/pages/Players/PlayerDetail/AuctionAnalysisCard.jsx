import React from "react";

import { FieldValue, PlaceholderBadge } from "./PlayerDetailHelpers";

const AUCTION_FIELDS = [
  "fairValue",
  "currentAverageCost",
  "recommendedMaxBid",
  "hardMaxBid",
  "valueScore",
  "positionScarcity",
];

const AuctionAnalysisCard = ({ resolvePlayerField }) => {
  const threatTeams = resolvePlayerField("threatTeams");
  const fields = AUCTION_FIELDS.map((fieldKey) => resolvePlayerField(fieldKey));
  const hasPlaceholderValues =
    fields.some((field) => field.isPlaceholder) || threatTeams.isPlaceholder;

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold d-flex align-items-center justify-content-between">
        <span>Auction Analysis</span>
        {hasPlaceholderValues && <PlaceholderBadge />}
      </div>
      <div className="card-body">
        <div className="row g-3">
          {fields.map((field) => {
            return (
              <div className="col-12 col-md-6" key={field.key}>
                <div className="border rounded p-3 h-100">
                  <div className="text-muted small">{field.label}</div>
                  <div className="fs-5 fw-semibold">
                    <FieldValue field={field} />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="col-12">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small mb-2">Threat Teams</div>
              <ul className="mb-0 ps-3 d-flex flex-column gap-1">
                {threatTeams.value.map((team) => (
                  <li key={team}>{team}</li>
                ))}
              </ul>
              {threatTeams.isPlaceholder && <PlaceholderBadge />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionAnalysisCard;
