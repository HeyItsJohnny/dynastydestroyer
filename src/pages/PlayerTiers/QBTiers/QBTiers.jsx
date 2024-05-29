import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

import { useAuth } from "../../../contexts/AuthContext";

import {
  KanbanComponent,
} from "@syncfusion/ej2-react-kanban";

import { getUserTierList } from "../../../globalFunctions/firebaseUserFunctions";

const QBTiers = () => {
  const [tierList, setTierList] = useState([]);
  const { currentUser } = useAuth();

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

  const fetchPlayerTierData = async () => {
    try {
      const data = await getUserTierList(currentUser.uid, "QB");
      setTierList(data);
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  useEffect(() => {
    fetchPlayerTierData();
    return () => {
      setTierList([]);
    };
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Tiers" title="Quarterbacks" />
      <KanbanComponent
        id="kanban"
        dataSource={tierList}
        columns={[
          { headerText: "Tier 1", keyField: "Tier 1" },
          { headerText: "Tier 2", keyField: "Tier 2" },
          { headerText: "Tier 3", keyField: "Tier 3" },
          { headerText: "Tier 4", keyField: "Tier 4" },
          { headerText: "Tier 5", keyField: "Tier 5" },
        ]}
        cardSettings={{ contentField: "Team", headerField: "FullName" }}
        keyField="Tier"
        actionComplete={addEvent}
      ></KanbanComponent>
    </div>
  )
}

export default QBTiers
