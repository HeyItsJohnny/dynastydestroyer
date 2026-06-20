import React from "react";

import Scouting from "./Scouting";

const ScoutingTEs = () => (
  <Scouting
    lockedPosition="TE"
    pageTitle="Scouting - TEs"
    playerListInModal
    showTargetFilterCard={false}
    showPositionFilters={false}
  />
);

export default ScoutingTEs;
