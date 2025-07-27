import React, { useState, useEffect } from "react";

import DraftSettings from "./DraftSettings";
import Draft from "./DraftComponent/Draft";
import DraftTeamStatsSummary from "./DraftComponent/DraftTeamStatsSummary";

//User ID
import { useAuth } from "../../contexts/AuthContext";

//UI
import {
  Box,
  Typography,
  Switch,
} from "@mui/material";
import { Header } from "../../components";



const BigDawgsDraftCommandCenter = () => {
  const { currentUser } = useAuth();
  const [checkedDraftSettings, setCheckedDraftSettings] = useState(false);
  const [checkedDraft, setCheckedDraft] = useState(false);
  const [checkedTeamStatsSummary, setCheckedTeamStatsSummary] = useState(false);
  const [checkedTeamStatsDetail, setCheckedTeamStatsDetail] = useState(false);

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
  const handleDraftTeamStatsSummaryCheckboxChange = (event) => {
    setCheckedTeamStatsSummary(event.target.checked);
  };
  const handleDraftTeamStatsDetailCheckboxChange = (event) => {
    setCheckedTeamStatsDetail(event.target.checked);
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
          <Typography gutterBottom>Show Team Stats Summary</Typography>
          <Switch
            checked={checkedTeamStatsSummary}
            onChange={handleDraftTeamStatsSummaryCheckboxChange}
          />
          <Typography gutterBottom>Show Team Stats Detail</Typography>
          <Switch
            checked={checkedTeamStatsDetail}
            onChange={handleDraftTeamStatsDetailCheckboxChange}
          />
        </Box>
      </div>
      {/* Settings */}
      {checkedDraftSettings && <DraftSettings />}
      {/* Draft */}
      {checkedDraft && <Draft />}
      {/* Draft Team Stats Summary*/}
      {checkedTeamStatsSummary && <DraftTeamStatsSummary/> }
      {/* Draft Team Stats Detail*/}
      {checkedTeamStatsDetail && <DraftTeamStatsSummary/> }
    </>
  );
};

export default BigDawgsDraftCommandCenter;
