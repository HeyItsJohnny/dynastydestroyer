import React, { useCallback, useEffect, useState } from "react";

// UI
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import { Header } from "../../components";

// Firebase
import { useAuth } from "../../contexts/AuthContext";
import {
  createOrUpdateLeagueSettings,
  getLeagueSettings,
} from "../../globalFunctions/firebaseLeagueSettings";

const normalizeLeagueTeams = (teamList, teamCount) => {
  const count = Math.max(0, parseInt(teamCount, 10) || 0);
  const existingTeams = Array.isArray(teamList) ? teamList : [];
  const myTeamIndex = existingTeams.findIndex((team) => team.MyTeam === true);

  return Array.from({ length: count }, (_, index) => ({
    TeamName: existingTeams[index]?.TeamName ?? "",
    MyTeam: myTeamIndex === index,
    TeamNumber: index + 1,
  }));
};

const LeagueSettings = () => {
  const { currentUser } = useAuth();
  const [leagueName, setLeagueName] = useState("");
  const [scoringFormat, setScoringFormat] = useState("PPR");
  const [pprPoints, setPprPoints] = useState(1);
  const [teams, setTeams] = useState(12);
  const [budget, setBudget] = useState(200);
  const [leagueTeams, setLeagueTeams] = useState(
    Array.from({ length: 12 }, () => ({ TeamName: "", MyTeam: false }))
  );
  const [playoffTeams, setPlayoffTeams] = useState(6);
  const [qbPlayers, setQbPlayers] = useState(1);
  const [rbPlayers, setRbPlayers] = useState(2);
  const [wrPlayers, setWrPlayers] = useState(2);
  const [tePlayers, setTePlayers] = useState(1);
  const [flexPlayers, setFlexPlayers] = useState(1);
  const [defPlayers, setDefPlayers] = useState(1);
  const [kPlayers, setKPlayers] = useState(1);

  const fetchLeagueSettings = useCallback(async () => {
    try {
      const data = await getLeagueSettings(currentUser.uid);

      if (data) {
        setLeagueName(data.LeagueName ?? "");
        setScoringFormat(data.ScoringFormat ?? "PPR");
        setPprPoints(data.PPRPoints ?? 1);
        setTeams(data.Teams ?? 12);
        setBudget(data.Budget ?? 200);
        setLeagueTeams(normalizeLeagueTeams(data.LeagueTeams, data.Teams ?? 12));
        setPlayoffTeams(data.PlayoffTeams ?? 6);
        setQbPlayers(data.QBPlayers ?? 1);
        setRbPlayers(data.RBPlayers ?? 2);
        setWrPlayers(data.WRPlayers ?? 2);
        setTePlayers(data.TEPlayers ?? 1);
        setFlexPlayers(data.FLEXPlayers ?? 1);
        setDefPlayers(data.DEFPlayers ?? 1);
        setKPlayers(data.KPlayers ?? 1);
      }
    } catch (error) {
      alert("Error fetching league settings: " + error);
    }
  }, [currentUser]);

  const handleSaveSettings = async () => {
    try {
      const leagueSettings = {
        LeagueName: leagueName,
        ScoringFormat: scoringFormat,
        PPRPoints: pprPoints,
        Teams: teams,
        Budget: budget,
        LeagueTeams: normalizeLeagueTeams(leagueTeams, teams),
        PlayoffTeams: playoffTeams,
        QBPlayers: qbPlayers,
        RBPlayers: rbPlayers,
        WRPlayers: wrPlayers,
        TEPlayers: tePlayers,
        FLEXPlayers: flexPlayers,
        DEFPlayers: defPlayers,
        KPlayers: kPlayers,
      };

      await createOrUpdateLeagueSettings(currentUser.uid, leagueSettings);
      alert("League settings saved.");
    } catch (error) {
      alert("Error saving league settings: " + error);
    }
  };

  const fieldInputProps = {
    className: "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
  };

  const fieldLabelProps = {
    className: "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
    shrink: true,
  };

  const handleTeamsChange = (value) => {
    setTeams(value);
    setLeagueTeams((currentTeams) => normalizeLeagueTeams(currentTeams, value));
  };

  const handleLeagueTeamChange = (index, value) => {
    setLeagueTeams((currentTeams) =>
      currentTeams.map((team, teamIndex) =>
        teamIndex === index ? { ...team, TeamName: value } : team
      )
    );
  };

  const handleMyTeamChange = (index, checked) => {
    setLeagueTeams((currentTeams) =>
      currentTeams.map((team, teamIndex) => ({
        ...team,
        MyTeam: checked && teamIndex === index,
      }))
    );
  };

  useEffect(() => {
    if (currentUser) {
      fetchLeagueSettings();
    }
  }, [currentUser, fetchLeagueSettings]);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Settings" title="League Settings" />

        <FormControl variant="outlined" fullWidth>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="League Name"
              variant="standard"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="Scoring Format"
              select
              variant="standard"
              value={scoringFormat}
              onChange={(e) => setScoringFormat(e.target.value)}
            >
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Half PPR">Half PPR</MenuItem>
              <MenuItem value="PPR">PPR</MenuItem>
              <MenuItem value="Superflex">Superflex</MenuItem>
            </TextField>

            <TextField
              InputProps={{
                ...fieldInputProps,
                inputProps: { step: "0.1", min: "0" },
              }}
              InputLabelProps={fieldLabelProps}
              label="PPR Points"
              type="number"
              variant="standard"
              value={pprPoints}
              onChange={(e) => setPprPoints(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="Teams"
              type="number"
              variant="standard"
              value={teams}
              onChange={(e) => handleTeamsChange(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="Playoff Teams"
              type="number"
              variant="standard"
              value={playoffTeams}
              onChange={(e) => setPlayoffTeams(e.target.value)}
            />

            <TextField
              InputProps={{
                ...fieldInputProps,
                inputProps: { min: "0" },
              }}
              InputLabelProps={fieldLabelProps}
              label="Budget"
              type="number"
              variant="standard"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </FormControl>
      </div>

      <div className="m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Roster" title="Player Counts" />

        <FormControl variant="outlined" fullWidth>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="QB"
              type="number"
              variant="standard"
              value={qbPlayers}
              onChange={(e) => setQbPlayers(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="RB"
              type="number"
              variant="standard"
              value={rbPlayers}
              onChange={(e) => setRbPlayers(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="WR"
              type="number"
              variant="standard"
              value={wrPlayers}
              onChange={(e) => setWrPlayers(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="TE"
              type="number"
              variant="standard"
              value={tePlayers}
              onChange={(e) => setTePlayers(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="FLEX"
              type="number"
              variant="standard"
              value={flexPlayers}
              onChange={(e) => setFlexPlayers(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="DEF"
              type="number"
              variant="standard"
              value={defPlayers}
              onChange={(e) => setDefPlayers(e.target.value)}
            />

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="K"
              type="number"
              variant="standard"
              value={kPlayers}
              onChange={(e) => setKPlayers(e.target.value)}
            />
          </div>
        </FormControl>
      </div>

      <div className="m-2 md:m-10 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="League" title="Teams" />

        <FormControl variant="outlined" fullWidth>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagueTeams.map((team, index) => (
              <div key={`league-team-${index + 1}`}>
                <TextField
                  InputProps={fieldInputProps}
                  InputLabelProps={fieldLabelProps}
                  label={`Team ${index + 1}`}
                  variant="standard"
                  fullWidth
                  value={team.TeamName}
                  onChange={(e) => handleLeagueTeamChange(index, e.target.value)}
                />

                <FormControlLabel
                  className="mt-2"
                  control={
                    <Checkbox
                      checked={team.MyTeam === true}
                      onChange={(e) =>
                        handleMyTeamChange(index, e.target.checked)
                      }
                    />
                  }
                  label="My Team"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </div>
        </FormControl>
      </div>
    </>
  );
};

export default LeagueSettings;
