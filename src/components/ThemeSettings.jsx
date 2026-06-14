import React, { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { Button, FormControlLabel, Switch } from "@mui/material";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { useStateContext } from "../contexts/ContextProvider";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/firebase";

const ThemeSettings = () => {
  const { setThemeSettings } = useStateContext();
  const { currentUser } = useAuth();
  const [useAiApis, setUseAiApis] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    const loadUserSettings = async () => {
      try {
        const userSettingsSnap = await getDoc(doc(db, "userprofile", currentUser.uid));

        if (userSettingsSnap.exists()) {
          setUseAiApis(userSettingsSnap.data().UseAIAPIs === true);
        }
      } catch (error) {
        setStatusMessage("Unable to load user settings.");
      }
    };

    loadUserSettings();
  }, [currentUser?.uid]);

  const saveUseAiApis = async (checked) => {
    if (!currentUser?.uid) {
      return;
    }

    setUseAiApis(checked);
    setSaving(true);
    setStatusMessage("");

    try {
      await setDoc(
        doc(db, "userprofile", currentUser.uid),
        { UseAIAPIs: checked },
        { merge: true }
      );
      setStatusMessage("Settings saved.");
    } catch (error) {
      setUseAiApis(!checked);
      setStatusMessage("Unable to save user settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed nav-item top-0 right-0">
      <div className="float-right h-screen bg-white dark:text-gray-200 dark:bg-secondary-dark-bg w-400">
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
          <p className="font-bold text-lg mb-3">AI Settings</p>
          <FormControlLabel
            control={
              <Switch
                checked={useAiApis}
                disabled={saving}
                onChange={(event) => saveUseAiApis(event.target.checked)}
              />
            }
            label="Use AI APIs"
          />
          <p className="text-sm text-gray-500 mb-0">
            Turn this on to allow OpenAI keeper note generation.
          </p>
        </div>

        {statusMessage && (
          <div className="flex-col border-t-1 border-color p-4 ml-4">
            <p className="text-sm text-gray-500 mb-0">{statusMessage}</p>
          </div>
        )}

        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setThemeSettings(false)}
            style={{ width: "100%" }}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
