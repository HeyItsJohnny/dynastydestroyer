import React, {useState, useEffect} from "react";
import { Header } from "../../../../components";
import { useAuth } from "../../../../contexts/AuthContext";
import { KanbanComponent } from "@syncfusion/ej2-react-kanban";
//Firebase
import { db } from "../../../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { deleteSleeperPlayer } from "../../../../globalFunctions/firebaseAuctionDraft";

const Sleepers = () => {
  const { currentUser } = useAuth();
  const [sleeperPlayers, setSleeperPlayers] = useState([]);

  const addEvent = async (args) => {
    if (args.requestType === "cardChanged") {
      //Do nothing with updated
      
    } else if (args.requestType === "cardRemoved") {
      //Delete player from sleeper documents
      try {
        deleteSleeperPlayer(currentUser.uid, args.deletedRecords[0].KeepTradeCutIdentifier);
      } catch (error) {
        alert("Error deleting data from Database: " + error);
      }
    }
  };

  const fetchSleeperPlayerData = async () => {
    const docCollection = query(
      collection(
        db,
        "userprofile",
        currentUser.uid,
        "auctiondraft",
        "players",
        "sleepers"
      ),
      orderBy("FullName")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          Position: doc.data().Position,
          Team: doc.data().Team,
          FullName: doc.data().FullName,
          KeepTradeCutIdentifier: doc.data().KeepTradeCutIdentifier
        };
        list.push(data);
      });
      setSleeperPlayers(list);
    });
  };

  useEffect(() => {
    fetchSleeperPlayerData();
    return () => {
      setSleeperPlayers([]);
    };
  }, []);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Draft Board" title="Sleeper Players" />
      <KanbanComponent
        id="kanban"
        dataSource={sleeperPlayers}
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
