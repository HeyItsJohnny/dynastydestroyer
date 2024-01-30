import React, { useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { BsCheck } from "react-icons/bs";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import { themeColors } from "../components/Settings";
import { TextField, Button } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";
import avatar from "../data/avatar.jpg";

const UserProfile = () => {
  const { setColor, setMode, currentMode, handleExitClick, setUserSettings } = useStateContext();
  const [sleeperUsername, setSleeperUsername] = useState("");

  const onSave = () => {
    //const apiUrl = "https://api.sleeper.app/v1/user/" + "728783232002306048" + "/leagues/nfl/"+ "2023";
    getSleeperUserID()
      .then((userId) => {
        getSleeperUserLeagues(userId);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    //getSleeperUserLeagues();
  };

  const getSleeperUserID = () => {
    const apiUrl = `https://api.sleeper.app/v1/user/${sleeperUsername}`;
    return fetchData(apiUrl)
      .then((data) => {
        return data.user_id; // Returning the user_id value
      })
      .catch((error) => {
        // Handle errors here
        console.error("Error in onRefresh:", error);
        throw error; // Re-throw the error to propagate it further
      });
  };

  const getSleeperUserLeagues = (userID) => {
    const apiUrl =
      "https://api.sleeper.app/v1/user/" + userID + "/leagues/nfl/" + "2023";
    if (userID !== null) {
      fetchData(apiUrl).then((data) => {
        //League Data Here
        console.log(data);
      });
    }
  };

  function fetchData(url, options = {}) {
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  return (
    <div className="bg-half-transparent w-screen fixed nav-item top-0 right-0">
      <div className="float-right h-screen bg-white w-400">
        <div className="flex justify-between items-center p-4 ml-4">
          <p className="font-semibold text-xl">User Profile</p>
          <button
            type="button"
            onClick={() => handleExitClick("userProfile")}
            style={{ color: "rbg(153, 171, 180)", borderRadius: "50%" }}
            className="text-2xl p-3 hover:drop-shadow-xl hover:bg-light-gray"
          >
            <MdOutlineCancel />
          </button>
        </div>
        {/*
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <p className="font-semibold text-lg">Avatar</p>
          <img className="rounded-full w-14 h-14" src={avatar} />
        </div>
        */}
      </div>
    </div>
  );
};

export default UserProfile;
