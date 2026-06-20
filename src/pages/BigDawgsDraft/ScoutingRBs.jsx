import React from "react";

import Scouting from "./Scouting";

const ScoutingRBs = () => (
  <Scouting
    lockedPosition="RB"
    pageTitle="Scouting - RBs"
    playerListInModal
    showTargetFilterCard={false}
    showPositionFilters={false}
  />
);

export default ScoutingRBs;
