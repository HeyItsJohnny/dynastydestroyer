import React, { useState, useEffect } from "react";

import DraftSettings from "./DraftSettings";
import Draft from "./DraftComponent/Draft";

//User ID
import { useAuth } from "../../contexts/AuthContext";

//Player Buttons
import { TbSquareRoundedLetterQ } from "react-icons/tb";
import { TbSquareRoundedLetterR } from "react-icons/tb";
import { TbSquareRoundedLetterW } from "react-icons/tb";
import { TbSquareRoundedLetterT } from "react-icons/tb";

//UI
import {
  FormControl,
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  Switch,
} from "@mui/material";
import { Header } from "../../components";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BigDawgsDraftCommandCenter = () => {
  const { currentUser } = useAuth();
  const [checkedDraftSettings, setCheckedDraftSettings] = useState(false);
  const [checkedDraft, setCheckedDraft] = useState(false);

  const inputStyles = {
    color: "white",
  };

  //Handle Checkboxes
  const handleDraftSettingsCheckboxChange = (event) => {
    setCheckedDraftSettings(event.target.checked);
  };
  const handleDraftCheckboxChange = (event) => {
    setCheckedDraft(event.target.checked);
  };

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Home" title="Command Center" />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Typography gutterBottom>Show Draft</Typography>
          <Switch
            checked={checkedDraft}
            onChange={handleDraftCheckboxChange}
          />
          <Typography gutterBottom>Show Draft Settings</Typography>
          <Switch
            checked={checkedDraftSettings}
            onChange={handleDraftSettingsCheckboxChange}
          />
        </Box>
      </div>
      {/* Settings */}
      {checkedDraftSettings && <DraftSettings />}
      {/* Draft */}
      {checkedDraft && <Draft />}
    </>
  );
};

export default BigDawgsDraftCommandCenter;
