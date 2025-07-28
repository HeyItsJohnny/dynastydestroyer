import React, { useState, useEffect } from "react";
//Firebase
import { db } from "../../../../firebase/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
//User ID
import { useAuth } from "../../../../contexts/AuthContext";
import DraftTeamDetailsComponent from "./DraftTeamDetailsComponent";

const DraftTeamDetails = () => {
     const { currentUser } = useAuth();
      const [teams, setTeams] = useState([]);
    
      useEffect(() => {
        if (!currentUser) return;
        const docCollection = query(
          collection(db, "userprofile", currentUser.uid, "teams"),
          orderBy("TeamName")
        );
    
        const unsubscribe = onSnapshot(docCollection, (querySnapshot) => {
          const list = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, TeamName: doc.data().TeamName, TeamAmount: doc.data().TeamAmount });
          });
          setTeams(list);
        });
    
        return () => {
          unsubscribe(); // Cleanup listener
        };
      }, [currentUser]);
  return (
    <div className="flex gap-10 flex-wrap justify-center mt-5">
        {teams.map((team) => (
          <DraftTeamDetailsComponent key={team.id} team={team} />
        ))}
    </div>
  )
}

export default DraftTeamDetails