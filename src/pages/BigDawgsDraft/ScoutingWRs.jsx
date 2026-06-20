import React from "react";

import Scouting from "./Scouting";

const ScoutingWRs = () => (
  <Scouting
    lockedPosition="WR"
    pageTitle="Scouting - WRs"
    playerListInModal
    showTargetFilterCard={false}
    showPositionFilters={false}
  />
);

export default ScoutingWRs;
