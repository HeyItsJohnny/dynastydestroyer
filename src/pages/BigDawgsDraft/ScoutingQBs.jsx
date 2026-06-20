import React from "react";

import Scouting from "./Scouting";

const ScoutingQBs = () => (
  <Scouting
    lockedPosition="QB"
    pageTitle="Scouting - QBs"
    playerListInModal
    showTargetFilterCard={false}
    showPositionFilters={false}
  />
);

export default ScoutingQBs;
