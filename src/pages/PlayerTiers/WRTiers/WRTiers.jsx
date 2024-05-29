import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

import {
  KanbanComponent,
} from "@syncfusion/ej2-react-kanban";

const WRTiers = () => {
  const [tierList, setTierList] = useState([]);

  const addEvent = async (args) => {
    console.log(args);
    if (args.requestType === "cardChanged") {
      //Updated
      try {
        console.log(args.changedRecords[0]);
      } catch (error) {
        alert("Error editing data to Database: " + error);
      }
    } else if (args.requestType === "cardRemoved") {
      //Deleted
      try {
        console.log(args.deletedRecords[0]);
      } catch (error) {
        alert("Error deleting data from Database: " + error);
      }
    }
  }

  useEffect(() => {
    return () => {
      setTierList([]);
    };
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Tiers" title="Wide Receivers" />
      <KanbanComponent
        id="kanban"
        dataSource={tierList}
        columns={[
          { headerText: "Tier 1", keyField: "Tier1" },
          { headerText: "Tier 2", keyField: "Tier2" },
          { headerText: "Tier 3", keyField: "Tier3" },
          { headerText: "Tier 4", keyField: "Tier4" },
          { headerText: "Tier 5", keyField: "Tier5" },
        ]}
        cardSettings={{ contentField: "Team", headerField: "Id" }}
        keyField="Tier"
        actionComplete={addEvent}
      ></KanbanComponent>
    </div>
  );
};

export default WRTiers;