import React from "react";

import { FieldValue } from "./PlayerDetailHelpers";

const StatTile = ({ field }) => (
  <div className="col-6 col-md-4 col-xl-3">
    <div className="border rounded p-3 h-100 bg-light">
      <div className="text-muted small">{field.label}</div>
      <div className="fw-semibold">
        <FieldValue field={field} />
      </div>
    </div>
  </div>
);

const StatGroup = ({ title, fields }) => (
  <div className="mb-4">
    <h6 className="text-uppercase text-muted small fw-bold mb-2">{title}</h6>
    <div className="row g-3">
      {fields.map((field) => (
        <StatTile field={field} key={field.key} />
      ))}
    </div>
  </div>
);

const SummaryTile = ({ field }) => (
  <div className="col-12 col-md-4">
    <div className="border rounded p-3 h-100">
      <div className="text-muted small">{field.label}</div>
      <div className="fs-5 fw-semibold">
        <FieldValue field={field} />
      </div>
    </div>
  </div>
);

const LastYearStatsCard = ({ resolveStatsField }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold">Last Year Stats</div>
      <div className="card-body">
        <div className="mb-4">
          <h6 className="text-uppercase text-muted small fw-bold mb-2">
            Fantasy Summary
          </h6>
          <div className="row g-3">
            {[
              resolveStatsField("games"),
              resolveStatsField("fantasyPoints"),
              resolveStatsField("fantasyPointsPpr"),
            ].map((field) => (
              <SummaryTile field={field} key={field.key} />
            ))}
          </div>
        </div>

        <StatGroup
          title="Passing"
          fields={[
            resolveStatsField("passingYards"),
            resolveStatsField("passingTDs"),
            resolveStatsField("interceptions"),
          ]}
        />
        <StatGroup
          title="Rushing"
          fields={[
            resolveStatsField("rushingAttempts"),
            resolveStatsField("rushingYards"),
            resolveStatsField("rushingTDs"),
          ]}
        />
        <StatGroup
          title="Receiving"
          fields={[
            resolveStatsField("targets"),
            resolveStatsField("receptions"),
            resolveStatsField("receivingYards"),
            resolveStatsField("receivingTDs"),
          ]}
        />
      </div>
    </div>
  );
};

export default LastYearStatsCard;
