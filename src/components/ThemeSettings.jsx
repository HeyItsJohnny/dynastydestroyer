import React, { useState, useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { BsCheck } from "react-icons/bs";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import { themeColors } from "../components/Settings";
import { useStateContext } from "../contexts/ContextProvider";
import { TextField, Button } from "@mui/material";

import Papa from "papaparse";

//Functions
import {
  getSleeperUserID,
  getSleeperUserLeagues,
  getPlayersFromSleeper,
} from "../globalFunctions/SleeperAPIFunctions";
import {
  updateSleeperUsername,
  saveUserSleeperLeague,
  deleteLeagueDocument,
  createOrUpdatePlayerData,
  timestampSleeperData,
  timestampKTCData
} from "../globalFunctions/firebaseFunctions";

import { formatTimestamp, formatPlayerName } from '../globalFunctions/globalFunctions';

//Firebase
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, query, collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

const ThemeSettings = () => {
  const { setThemeSettings } = useStateContext();
  const [sleeperUsername, setSleeperUsername] = useState("");
  const [sleeperLeagues, setSleeperLeagues] = useState([]);
  const [sleeperDataUpdateSettings, setSleeperDataSettings] = useState('');
  const [ktcDataUpdateSettings, setKTCDataSettings] = useState('');
  const { currentUser } = useAuth();

  const [csvFile, setCsvFile] = useState(null);

  const onRefresh = () => {
    startGetInfoFromSleeper();
  };

  const startGetInfoFromSleeper = () => {
    getSleeperUserID(sleeperUsername)
      .then((userId) => {
        DeleteSleeperLeagues();
        getSleeperLeagues(userId);
      })
      .catch((error) => {
        alert("Error. Please check your username");
      });
  };

  const DeleteSleeperLeagues = () => {
    sleeperLeagues.forEach((league) => {
      deleteLeagueDocument(currentUser.uid, league.LeagueID);
    });
  };

  const getSleeperLeagues = (userId) => {
    getSleeperUserLeagues(userId)
      .then((data) => {
        saveSleeperUsername(userId);
        saveSleeperLeagues(data);
      })
      .catch((error) => {
        alert("Error. Please check your username");
      });
  };

  const saveSleeperLeagues = (sleeperLeagues) => {
    sleeperLeagues.forEach((data) => {
      saveUserSleeperLeague(currentUser.uid, data.league_id, data.name);
    });
  };

  const saveSleeperUsername = (userId) => {
    updateSleeperUsername(currentUser.uid, sleeperUsername, userId);
  };

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
        setSleeperDataSettings(formatTimestamp(docSnap.data().LastSleeperDataUpdate));
        setKTCDataSettings(formatTimestamp(docSnap.data().LastKTCDataUpdate));
      }
    } catch (err) {
      alert(err);
    }
  };

  const getSleeperLeaguesFromFirebase = async () => {
    const docCollection = query(
      collection(db, "userprofile", currentUser.uid, "leagues")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          LeagueID: doc.id,
          LeagueName: doc.data().LeagueName,
        };
        list.push(data);
      });
      setSleeperLeagues(list);
    });
  };

  const RefreshSleeperPlayerData = () => {
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
                createOrUpdatePlayerData(data[key]);
              }
            }
          }
        }
        timestampSleeperData(currentUser.uid);
      })
      .catch((error) => {
        alert("Error: " + error);
      });
  };

  const handleFileChange = (event) => {
    try {
      const file = event.target.files[0];
      setCsvFile(file);
  
      Papa.parse(file, {
        complete: (result) => {
          if (result && result.data) {
            const jsonData = result.data;
            UpdatePlayerData(jsonData);
          } else {
            alert("Error parsing CSV file:", result.errors);
          }
        },
        header: true,
        skipEmptyLines: true,
      });
    } catch(e) {
      alert('Error: ' + e);
    }

  };

  const UpdatePlayerData = (KTCData) => {
    //console.log(KTCData);
    KTCData.forEach((data) => {
      const KTCIdentifier = formatPlayerName(data.Name) + "-" +data.Position;
      console.log(KTCIdentifier);
    })
    timestampKTCData(currentUser.uid);
  };

  useEffect(() => {
    setSleeperUserName();
    getSleeperLeaguesFromFirebase();
    getDataSettings();
    return () => {
      setSleeperLeagues([]);
    };
  }, []);

  return (
    <>
      <div className="bg-half-transparent w-screen fixed nav-item top-0 right-0">
        <div className="float-right h-screen bg-white w-400">
          <div className="flex justify-between items-center p-4 ml-4">
            <p className="font-bold text-xl">Settings</p>
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
            <p className="font-bold text-lg mb-5">Sleeper Settings</p>
            <div className="flex gap-3">
              <TextField
                label="Sleeper Username"
                variant="outlined"
                value={sleeperUsername}
                onChange={(e) => setSleeperUsername(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <Button
              variant="contained"
              color="primary"
              onClick={onRefresh}
              style={{ width: "100%" }}
            >
              Refresh
            </Button>
          </div>
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <p className="font-bold text-lg mb-5">My Leagues: </p>
            {sleeperLeagues.map((league) => (
              <p className="font-semibold text-md mb-5">{league.LeagueName}</p>
            ))}
          </div>
          <div className="flex justify-between items-center p-4 ml-4">
            <p className="font-bold text-xl">Sleeper Player Data</p>
            <div className="flex gap-3">
              
            </div>
          </div>
          <div className="flex justify-between items-center p-4 ml-4">
            <p className="font-semibold text-md">Last Updated: {sleeperDataUpdateSettings}</p>
          </div>
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <Button
              variant="contained"
              color="primary"
              onClick={RefreshSleeperPlayerData}
              style={{ width: "100%" }}
            >
              Refresh Player Data
            </Button>
          </div>
          <div className="flex justify-between items-center p-4 ml-4">
            <p className="font-bold text-xl">Import Keep Trade Cut Data</p>
          </div>
          <div className="flex justify-between items-center p-4 ml-4">
            <p className="font-semibold text-md">Last Updated: {ktcDataUpdateSettings}</p>
          </div>
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <TextField
              type="file"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              onChange={handleFileChange}
              accept=".csv"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeSettings;
