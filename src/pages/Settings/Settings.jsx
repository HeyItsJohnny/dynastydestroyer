import React, { useState, useEffect } from "react";

//UI
import { TextField, Button } from "@mui/material";
import { Header } from "../../components";

//Data
import {
  createOrUpdatePlayerData,
  timestampSleeperData,
} from "../../globalFunctions/firebaseFunctions";

import ImportPlayerStatsModal from "../../modals/ImportPlayerStatsModal";

import {
  getPlayersFromSleeper,
} from "../../globalFunctions/SleeperAPIFunctions";

import { formatTimestamp } from "../../globalFunctions/globalFunctions";

//Firebase
import { useAuth } from "../../contexts/AuthContext";
import { doc, getDoc, query, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const Settings = () => {
  const [sleeperUsername, setSleeperUsername] = useState("");
  const [sleeperDataUpdateSettings, setSleeperDataSettings] = useState("");
  const [sleeperPlayerStatsSettings, setSleeperPlayerStatsSettings] = useState("");
  const { currentUser } = useAuth();

  const setSleeperUserName = async () => {
    try {
      const docRef = doc(db, "userprofile", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSleeperUsername(docSnap.data().SleeperUserName);
      }
    } catch (err) {
      alert(err);
    }
  };

  const getDataSettings = async () => {
    try {
      const docRef = doc(db, "settings", "datasettings");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSleeperDataSettings(
          formatTimestamp(docSnap.data().LastSleeperDataUpdate)
        );
        setSleeperPlayerStatsSettings(
          formatTimestamp(docSnap.data().LastPlayerStatsUpdate)
        );
      }
    } catch (err) {
      alert(err);
    }
  };

  const RefreshSleeperNonDynastyPlayerData = () => {
    getPlayersFromSleeper()
      .then((data) => {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            if (
              data[key].position === "QB" ||
              data[key].position === "RB" ||
              data[key].position === "WR" ||
              data[key].position === "TE"
            ) {
              if (data[key].status !== "Inactive") {
                if (checkPositionDepth(data[key]) === true) {
                  createOrUpdatePlayerData(data[key]);
                }
              }
            }
          }
        }
        timestampSleeperData();
      })
      .catch((error) => {
        alert("Error: " + error);
      });
  };

  const checkPositionDepth = (data) => {
    let depthChart = parseInt(data.depth_chart_order);

    if (data.position === "QB" && depthChart === 1) {
      return true;
    } else if (data.position === "WR" && depthChart < 4 && depthChart !== 0) {
      return true;
    } else if (data.position === "TE" && depthChart === 1) {
      return true;
    } else if (data.position === "RB" && depthChart < 3 && depthChart !== 0) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    setSleeperUserName();
    getDataSettings();
    return () => {};
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Settings" title="User Settings" />
        <div>
          <TextField
            label="Sleeper Username"
            variant="outlined"
            value={sleeperUsername}
            onChange={(e) => setSleeperUsername(e.target.value)}
            style={{ width: "100%" }}
            InputProps={{
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
            InputLabelProps={{
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
          />
        </div>
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <Button variant="contained" color="primary" style={{ width: "100%" }}>
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Sleeper" title="(Non Dynasty) Player Data" />
        <div className="flex justify-between items-center p-4 ml-4">
          <p className="font-semibold text-md">
            Last Updated: {sleeperDataUpdateSettings}
          </p>
        </div>
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <Button
            variant="contained"
            color="primary"
            style={{ width: "100%" }}
            onClick={RefreshSleeperNonDynastyPlayerData}
          >
            Refresh Player Data
          </Button>
        </div>
      </div>

      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Players" title="Statistics" />
        <div className="flex justify-between items-center p-4 ml-4">
          <p className="font-semibold text-md">
            Last Updated: {sleeperPlayerStatsSettings}
          </p>
        </div>
        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <ImportPlayerStatsModal />
        </div>
      </div>
    </>
  );
};

export default Settings;
