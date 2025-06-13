import React, { useState, useEffect } from "react";
import { Header } from "../../components";

import { useAuth } from "../../contexts/AuthContext";

import { KanbanComponent } from "@syncfusion/ej2-react-kanban";

import {
  getUserTierList,
  updatePlayerTier,
  deletePlayerTierData,
} from "../../globalFunctions/firebaseUserFunctions";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Sleepers = () => {
  const [tierList, setTierList] = useState([]);
  const { currentUser } = useAuth();

  const addEvent = async (args) => {
    if (args.requestType === "cardChanged") {
      //Updated
      try {
        /*
        updatePlayerTier(
          currentUser.uid,
          args.changedRecords[0].KeepTradeCutIdentifier,
          args.changedRecords[0].Tier
        );
        */
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
  const fetchPlayerTierData = async () => {
    try {
      //const data = await getUserTierList(currentUser.uid, "QB");
      //setTierList(data);
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const clearPlayerData = async () => {
    for (const player of tierList) {
      try {
        //deletePlayerTierData(currentUser.uid, player);
      } catch (error) {
        alert("Error deleting data from Database: " + error);
      }
    }
    toast("Board Cleared.");
    //fetchPlayerTierData();
  };

  useEffect(() => {
    fetchPlayerTierData();
    return () => {
      setTierList([]);
    };
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Apps" title="Sleepers" />
      <div className="mb-5">
        <button
          type="button"
          style={{
            backgroundColor: "red",
            color: "White",
            borderRadius: "10px",
          }}
          className={`text-md p-3 hover:drop-shadow-xl`}
          onClick={clearPlayerData}
        >
          Clear Board
        </button>
      </div>
      <ToastContainer />
      <KanbanComponent
        id="kanban"
        dataSource={tierList}
        columns={[
        { headerText: "QBs", keyField: "Quarterbacks" },
          { headerText: "RBs", keyField: "Runningbacks" },
          { headerText: "TEs", keyField: "Tight Ends" },
          { headerText: "WRs", keyField: "Wide Receivers" },
        ]}
        cardSettings={{ contentField: "Team", headerField: "FullName" }}
        keyField="Tier"
        actionComplete={addEvent}
      ></KanbanComponent>
    </div>
  );

};

export default Sleepers;
