import React from "react";
import { Header } from "../../../../components";

import { useAuth } from "../../../../contexts/AuthContext";

import { KanbanComponent } from "@syncfusion/ej2-react-kanban";
import { updatePlayerTier } from "../../../../globalFunctions/firebaseAuctionDraft";

const WRTiers = ({ playerData }) => {
  const { currentUser } = useAuth();

  const addEvent = async (args) => {
    if (args.requestType === "cardChanged") {
      //Updated
      try {
        updatePlayerTier(
          args.changedRecords[0].KeepTradeCutIdentifier,
          args.changedRecords[0].Position,
          args.changedRecords[0].Tier,
          currentUser.uid
        );
      } catch (error) {
        alert("Error editing data to Database: " + error);
      }
    } else if (args.requestType === "cardRemoved") {
      //Deleted
      try {
        //deletePlayerTierData(currentUser.uid, args.deletedRecords[0]);
      } catch (error) {
        alert("Error deleting data from Database: " + error);
      }
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Tiers" title="Wide Recievers" />
      <KanbanComponent
        id="kanban"
        dataSource={playerData}
        columns={[
          { headerText: "Tier 1", keyField: "Tier 1" },
          { headerText: "Tier 2", keyField: "Tier 2" },
          { headerText: "Tier 3", keyField: "Tier 3" },
          { headerText: "Tier 4", keyField: "Tier 4" },
        ]}
        cardSettings={{ contentField: "Team", headerField: "FullName" }}
        keyField="Tier"
        actionComplete={addEvent}
      ></KanbanComponent>
    </div>
  );
};

export default WRTiers;
