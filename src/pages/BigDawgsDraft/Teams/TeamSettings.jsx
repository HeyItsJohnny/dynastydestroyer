import React, { useState, useEffect } from "react";

//User ID
import { useAuth } from "../../../contexts/AuthContext";
import { getTeamDataByID } from "../../../globalFunctions/firebaseUserFunctions";

const TeamSettings = ({teamid}) => {
  const { currentUser } = useAuth();
  const [teamData, setTeamData] = useState({});

  const fetchTeamData = async () => {
    try {
      const data = await getTeamDataByID(currentUser.uid,teamid);
      setTeamData(data);
    } catch (e) {
      alert("Error: " + e);
    }
  };

  useEffect(() => {
    fetchTeamData();
    return () => {
      setTeamData({});
    };
  }, [teamid]);

  return (
    <div className="flex gap-10 flex-wrap justify-center">
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">Settings: {teamData.TeamName}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
