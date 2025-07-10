import React, { useState, useEffect } from "react";
import DraftComponent from "./DraftComponent";
import DraftTeams from "./DraftTeams";
import DraftPlayers from "./DraftPlayers";

const Draft = () => {
  return (
    <>
      <div className="flex gap-10 flex-wrap justify-center">
        <DraftComponent />
        <DraftTeams />
        <DraftPlayers />
      </div>
    </>
  );
};

export default Draft;
