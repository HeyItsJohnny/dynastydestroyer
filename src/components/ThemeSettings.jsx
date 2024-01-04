import React, { useState, useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { BsCheck } from "react-icons/bs";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import { themeColors } from "../components/Settings";
import { useStateContext } from "../contexts/ContextProvider";
import { TextField, Button } from "@mui/material";

//Functions
import { getSleeperUserID, getSleeperUserLeagues } from "../globalFunctions/SleeperAPIFunctions";
import { updateSleeperUsername } from "../globalFunctions/firebaseFunctions";

//Firebase
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const ThemeSettings = () => {
  const { setColor, setMode, currentMode, currentColor, setThemeSettings } =
    useStateContext();
  const [sleeperUsername, setSleeperUsername] = useState("");
  const { currentUser } = useAuth();

  const onSave = () => {
    //Save UserName to Firebase


    //Get User ID & leagues
    startGetInfoFromSleeper();

    //Save Leagues to Database
  };

  const onRefresh = () => {
    //Save UserName to Firebase

    //Get User ID & leagues
    startGetInfoFromSleeper();

    //Save Leagues to Database
  };

  const startGetInfoFromSleeper = () => {
    getSleeperUserID(sleeperUsername)
    .then((userId) => {
      getSleeperLeagues(userId);
    })
    .catch((error) => {
      alert("Error. Please check your username");
    });
  }


  const getSleeperLeagues = (userId) => {
    getSleeperUserLeagues(userId)
    .then((data) => {
      saveSleeperUsername(userId);
      console.log(data);            //Leagues Data
    })
    .catch((error) => {
      alert("Error. Please check your username");
    });
  }

  const saveSleeperUsername = (userId) => {
    updateSleeperUsername(currentUser.uid,sleeperUsername,userId);
  }

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

  useEffect(() => {
    setSleeperUserName();
    return () => {};
  }, []);

  return (
    <>
      <div className="bg-half-transparent w-screen fixed nav-item top-0 right-0">
        <div className="float-right h-screen bg-white w-400">
          <div className="flex justify-between items-center p-4 ml-4">
            <p className="font-semibold text-xl">Settings</p>
            <button
              type="button"
              onClick={() => setThemeSettings(false)}
              style={{ color: "rbg(153, 171, 180)", borderRadius: "50%" }}
              className="text-2xl p-3 hover:drop-shadow-xl hover:bg-light-gray"
            >
              <MdOutlineCancel />
            </button>
          </div>

          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <p className="font-semibold text-lg mb-5">Sleeper Settings</p>
            <div className="flex gap-3">
              <TextField
                label="Sleeper Username"
                variant="outlined"
                value={sleeperUsername}
                onChange={(e) => setSleeperUsername(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <Button variant="contained" color="primary" onClick={onSave} style={{ width: '100%' }}>
              Save
            </Button>
            <div className="mt-2"></div>
            <Button variant="contained" color="primary" onClick={onRefresh} style={{ width: '100%' }}>
              Refresh
            </Button>
          </div>
          {/*
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <p className="font-semibold text-lg">Theme Options</p>
            <div className="mt-4">
              <input
                type="radio"
                id="light"
                name="theme"
                value="Light"
                className="cursor-pointer"
                onChange={setMode}
                checked={currentMode === "Light"}
              />
              <label htmlFor="light" className="ml-2 text-md cursor-pointer">
                Light
              </label>
            </div>
            <div className="mt-4">
              <input
                type="radio"
                id="dark"
                name="theme"
                value="Dark"
                className="cursor-pointer"
                onChange={setMode}
                checked={currentMode === "Dark"}
              />
              <label htmlFor="dark" className="ml-2 text-md cursor-pointer">
                Dark
              </label>
            </div>
          </div>
          */}
          {/*
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <p className="font-semibold text-lg">Theme Colors</p>
            <div className="flex gap-3">
              {themeColors.map((item, index) => (
                <TooltipComponent
                  key={index}
                  content={item.name}
                  position="TopCenter"
                >
                  <div className="re;atove mt-2 cursor-pointer flex gap-5 items-center">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full cursor-pointer"
                      style={{ backgroundColor: item.color }}
                      onClick={() => setColor(item.color)}
                    >
                      <BsCheck
                        className={`ml-2 text-2xl text-white ${
                          item.color === currentColor ? "block" : "hidden"
                        }`}
                      />
                    </button>
                  </div>
                </TooltipComponent>
              ))}
            </div>
          </div>
                      */}
        </div>
      </div>
    </>
  );
};

export default ThemeSettings;
