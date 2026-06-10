import React from "react";

import { Header } from "../../components";

const ReviewCard = ({ children, className = "", title }) => (
  <div
    className={`bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl shadow-sm ${className}`}
  >
    <p className="text-xl font-semibold mb-4">{title}</p>
    {children}
  </div>
);

const Pill = ({ children, tone = "secondary" }) => (
  <span className={`badge bg-${tone} rounded-pill px-3 py-2 me-2 mb-2`}>
    {children}
  </span>
);

const ReviewTeamPage = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Command Center" title="Review Team" />
        <p className="text-gray-500 mb-0">
          Draft prep workspace for entering your roster, reviewing imported player data,
          and eventually generating keep/cut recommendations.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <ReviewCard className="md:w-600" title="Current Team Input">
          <div className="mb-3">
            <label className="form-label text-gray-500">Team Name</label>
            <input
              className="form-control"
              placeholder="Big Dawgs"
              readOnly
              type="text"
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-gray-500">Roster</label>
            <textarea
              className="form-control"
              placeholder="Paste or type your current roster here..."
              readOnly
              rows={8}
            />
          </div>
          <button className="btn btn-success rounded-pill px-4" disabled type="button">
            Analyze Team
          </button>
        </ReviewCard>

        <ReviewCard className="md:w-600" title="AI Review Outline">
          <p className="text-gray-500">
            Future analysis will compare your roster against imported ranks, tiers,
            projected stats, auction values, season notes, and player flags.
          </p>
          <div className="mt-4">
            <Pill tone="success">Keeper Value</Pill>
            <Pill tone="primary">Auction Edge</Pill>
            <Pill tone="warning">Risk Flags</Pill>
            <Pill tone="danger">Replacement Cost</Pill>
          </div>
        </ReviewCard>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <ReviewCard className="md:w-400" title={`${currentYear} Keepers`}>
          <ul className="list-unstyled mb-0">
            <li className="border-b border-color py-2">Bijan Robinson - Keep</li>
            <li className="border-b border-color py-2">Ja'Marr Chase - Keep</li>
            <li className="border-b border-color py-2">Puka Nacua - Keep</li>
          </ul>
        </ReviewCard>

        <ReviewCard className="md:w-400" title="Bubble Players">
          <ul className="list-unstyled mb-0">
            <li className="border-b border-color py-2">Player A - Review Cost</li>
            <li className="border-b border-color py-2">Player B - Monitor Role</li>
            <li className="border-b border-color py-2">Player C - Compare Tier</li>
          </ul>
        </ReviewCard>

        <ReviewCard className="md:w-400" title="Cut Candidates">
          <ul className="list-unstyled mb-0">
            <li className="border-b border-color py-2">Player D - Low Ceiling</li>
            <li className="border-b border-color py-2">Player E - Poor Value</li>
            <li className="border-b border-color py-2">Player F - Replaceable</li>
          </ul>
        </ReviewCard>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <ReviewCard className="md:w-600" title="Roster Needs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Primary Need</p>
              <p className="font-semibold mb-0">RB depth</p>
            </div>
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Secondary Need</p>
              <p className="font-semibold mb-0">Upside WR</p>
            </div>
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Budget Focus</p>
              <p className="font-semibold mb-0">Preserve $22 for tier breaks</p>
            </div>
            <div className="border-b border-color py-2">
              <p className="text-gray-500 mb-1">Draft Posture</p>
              <p className="font-semibold mb-0">Aggressive early, patient late</p>
            </div>
          </div>
        </ReviewCard>

        <ReviewCard className="md:w-600" title="Data To Use Later">
          <div className="d-flex flex-wrap">
            <Pill>Projected Rank</Pill>
            <Pill>Tier</Pill>
            <Pill>ADP</Pill>
            <Pill>Auction Value</Pill>
            <Pill>Max Bid</Pill>
            <Pill>Hard Max</Pill>
            <Pill>Season Notes</Pill>
            <Pill>Target Flags</Pill>
            <Pill>Do Not Draft Flags</Pill>
            <Pill>Sleeper Flags</Pill>
            <Pill>Last Season Stats</Pill>
            <Pill>Weekly Game Logs</Pill>
          </div>
        </ReviewCard>
      </div>
    </>
  );
};

export default ReviewTeamPage;
