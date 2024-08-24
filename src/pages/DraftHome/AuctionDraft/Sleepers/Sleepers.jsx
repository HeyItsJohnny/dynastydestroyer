import React from "react";
import { Header } from "../../../../components";

import { useAuth } from "../../../../contexts/AuthContext";

import { KanbanComponent } from "@syncfusion/ej2-react-kanban";
import { updatePlayerTier } from "../../../../globalFunctions/firebaseAuctionDraft";

const Sleepers = () => {
  const { currentUser } = useAuth();

  const addEvent = async (args) => {
    if (args.requestType === "cardChanged") {
      //Do nothing with updated
      
    } else if (args.requestType === "cardRemoved") {
      //Delete player from sleeper documents
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
          { headerText: "QB", keyField: "QB" },
          { headerText: "RB", keyField: "RB" },
          { headerText: "WR", keyField: "WR" },
          { headerText: "TE", keyField: "TE" },
        ]}
        cardSettings={{ contentField: "Team", headerField: "FullName" }}
        keyField="Position"
        actionComplete={addEvent}
      ></KanbanComponent>
    </div>
  );
};

export default Sleepers;
