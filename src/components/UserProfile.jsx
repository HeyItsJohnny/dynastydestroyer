import React from "react";
import { MdOutlineCancel } from "react-icons/md";
import { BsCheck } from "react-icons/bs";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import { themeColors } from "../components/Settings";
import { TextField, Button } from "@mui/material";
import { useStateContext } from "../contexts/ContextProvider";
import avatar from "../data/avatar.jpg";

const UserProfile = () => {
  const { setColor, setMode, currentMode, handleExitClick, setUserSettings } =
    useStateContext();

  const onRefresh = () => {
    //alert("Refresh.");
    const apiUrl = "https://api.sleeper.app/v1/user/" + "728783232002306048" + "/leagues/nfl/"+ "2023";
    //const apiUrl = "https://api.sleeper.app/v1/user/" + "JohnnyGoesHard";
    fetchData(apiUrl).then((data) => {
      console.log(data);
    });
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

        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <p className="font-semibold text-lg">Avatar</p>
          <img className="rounded-full w-14 h-14" src={avatar} />
        </div>
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <p className="font-semibold text-lg mb-5">Sleeper Settings</p>
          <TextField label="Sleeper Username" variant="outlined" />
        </div>
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <Button variant="contained" color="primary" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
