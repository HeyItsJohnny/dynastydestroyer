import React from "react";

import {
  PLACEHOLDER_IMAGE,
  PlaceholderBadge,
  isMissingValue,
} from "./PlayerDetailHelpers";

const HeadshotCard = ({ player, fullNameField, teamField, positionField }) => {
  const headshotUrl = player?.media?.headshotUrl;
  const isPlaceholder = isMissingValue(headshotUrl);

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold">Player Photo</div>
      <div className="card-body text-center">
        <img
          alt={`${fullNameField.value} headshot`}
          className="img-fluid rounded border mb-3"
          src={headshotUrl || PLACEHOLDER_IMAGE}
        />
        <h5 className="mb-2">
          {fullNameField.value}
          {fullNameField.isPlaceholder && <PlaceholderBadge />}
        </h5>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <span className="badge bg-primary">{teamField.value}</span>
          <span className="badge bg-dark">{positionField.value}</span>
        </div>
        {isPlaceholder && (
          <div className="mt-3">
            <PlaceholderBadge />
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadshotCard;
