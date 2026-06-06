import React from "react";

const MissingDataRequirementsCard = ({ missingFields }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold d-flex flex-wrap align-items-center justify-content-between gap-2">
        <span>Missing Data Requirements</span>
        <span className="badge bg-secondary">
          {missingFields.length.toLocaleString()} Missing
        </span>
      </div>
      <div className="card-body">
        {missingFields.length === 0 ? (
          <p className="mb-0 text-success fw-semibold">No missing rendered fields.</p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {missingFields.map((field) => (
              <span className="badge bg-light text-dark border" key={field}>
                {field}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingDataRequirementsCard;
