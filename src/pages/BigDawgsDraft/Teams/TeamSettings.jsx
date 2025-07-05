import React, { useState, useEffect } from "react";

//User ID
import { useAuth } from "../../../contexts/AuthContext";
import { getTeamDataByID, updateTeamSettings } from "../../../globalFunctions/firebaseUserFunctions";

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

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeamSettings = ({ teamid }) => {
  const { currentUser } = useAuth();
  const [teamData, setTeamData] = useState({});
  const [teamName, setTeamName] = useState();
  const [myTeam, setMyTeam] = useState(false);

  const inputStyles = {
    color: "white",
  };

  const fetchTeamData = async () => {
    try {
      const data = await getTeamDataByID(currentUser.uid, teamid);
      setTeamData(data);
      setTeamName(data.TeamName);
      setMyTeam(data.MyTeam);
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleMyTeam = (event) => {
    setMyTeam(event.target.checked);
  };

  const handleSave = () => {
    updateTeamSettings(currentUser.uid, teamid, teamName, myTeam); 
    toast("Team has been saved.");
  };

  useEffect(() => {
    fetchTeamData();
    return () => {
      setTeamData({});
      setTeamName("");
      setMyTeam(false);
    };
  }, [teamid]);

  return (
    <>
      <ToastContainer />
      <div className="flex gap-10 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-md font-semibold">Team Name: </p>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex gap-4">
              <TextField
                InputProps={{ style: inputStyles }}
                InputLabelProps={{ style: inputStyles }}
                variant="outlined"
                fullWidth
                placeholder="Search TE Prospects"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                sx={{ marginBottom: 1 }} // Add some margin at the bottom
              />
            </div>
          </div>
          <div className="flex justify-between items-center gap-2 mt-4">
            <p className="text-md font-semibold">Is My Team: </p>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex gap-4">
              <Switch checked={myTeam} onChange={handleMyTeam} />
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ mr: 2 }} // Adds margin to the right of the button
              >
                Save
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamSettings;
