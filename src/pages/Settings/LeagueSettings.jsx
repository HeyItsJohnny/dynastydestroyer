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

const defaultAllocationRules = [
  {
    position: "RB",
    title: "Running Backs",
    minPercent: 35,
    maxPercent: 45,
    description:
      "Elite rushers are scarce, so top-tier running backs command a premium.",
  },
  {
    position: "WR",
    title: "Wide Receivers",
    minPercent: 35,
    maxPercent: 45,
    description:
      "Receiver talent is deeper, but strong starters still deserve premium budget.",
  },
  {
    position: "QB",
    title: "Quarterbacks",
    minPercent: 5,
    maxPercent: 10,
    description:
      "Unless this is Superflex, quarterbacks are usually abundant.",
  },
  {
    position: "TE",
    title: "Tight Ends",
    minPercent: 5,
    maxPercent: 10,
    description:
      "Elite tight ends create an edge, but mid-tier options are cheaper.",
  },
  {
    position: "K",
    title: "Kickers",
    minPercent: 1,
    maxPercent: 1,
    description:
      "Do not overspend. Stream this position when needed.",
  },
  {
    position: "DST",
    title: "Defense",
    minPercent: 1,
    maxPercent: 1,
    description:
      "Keep the spend minimal and stream matchups during the season.",
  },
];

const formatCurrency = (value) => `$${Math.round(value).toLocaleString()}`;

const getAllocationRange = (budgetValue, rule) => {
  const parsedBudget = Number(budgetValue) || 0;
  const minAmount = (parsedBudget * rule.minPercent) / 100;
  const maxAmount = (parsedBudget * rule.maxPercent) / 100;

  return rule.minPercent === rule.maxPercent
    ? formatCurrency(minAmount)
    : `${formatCurrency(minAmount)} - ${formatCurrency(maxAmount)}`;
};

const getAllocationAmount = (budgetValue, percent) => {
  const parsedBudget = Number(budgetValue) || 0;
  const parsedPercent = Number(percent) || 0;

  return formatCurrency((parsedBudget * parsedPercent) / 100);
};

const normalizeAllocationRules = (rules) => {
  const existingRules = Array.isArray(rules) ? rules : [];

  return defaultAllocationRules.map((defaultRule) => {
    const existingRule = existingRules.find(
      (rule) => rule.position === defaultRule.position
    );

    return {
      ...defaultRule,
      ...(existingRule ?? {}),
      minPercent: existingRule?.minPercent ?? defaultRule.minPercent,
      maxPercent: existingRule?.maxPercent ?? defaultRule.maxPercent,
    };
  });
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
  const [benchPlayers, setBenchPlayers] = useState(8);
  const [allocationRules, setAllocationRules] = useState(defaultAllocationRules);

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
        setBenchPlayers(data.BenchPlayers ?? 8);
        setAllocationRules(normalizeAllocationRules(data.AllocationRules));
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
        BenchPlayers: benchPlayers,
        AllocationRules: allocationRules,
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

  const handleAllocationRuleChange = (position, field, value) => {
    setAllocationRules((currentRules) =>
      currentRules.map((rule) =>
        rule.position === position
          ? {
              ...rule,
              [field]: value,
            }
          : rule
      )
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
        <Header category="Auction" title="Allocation Rules" />
        <p className="text-gray-500 mb-6">
          Baseline positional spending guide based on a {formatCurrency(Number(budget) || 0)} budget.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {allocationRules.map((rule) => (
            <div
              className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl shadow-sm border-b border-color"
              key={rule.position}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xl font-semibold mb-1">{rule.title}</p>
                  <p className="text-gray-500 mb-0">{rule.position}</p>
                </div>
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  {Number(rule.minPercent) === Number(rule.maxPercent)
                    ? `${rule.minPercent}%`
                    : `${rule.minPercent}% - ${rule.maxPercent}%`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <TextField
                  InputProps={{
                    ...fieldInputProps,
                    inputProps: { min: "0", max: "100", step: "1" },
                  }}
                  InputLabelProps={fieldLabelProps}
                  label="Min %"
                  type="number"
                  variant="standard"
                  value={rule.minPercent}
                  onChange={(e) =>
                    handleAllocationRuleChange(
                      rule.position,
                      "minPercent",
                      e.target.value
                    )
                  }
                />

                <TextField
                  InputProps={{
                    ...fieldInputProps,
                    inputProps: { min: "0", max: "100", step: "1" },
                  }}
                  InputLabelProps={fieldLabelProps}
                  label="Max %"
                  type="number"
                  variant="standard"
                  value={rule.maxPercent}
                  onChange={(e) =>
                    handleAllocationRuleChange(
                      rule.position,
                      "maxPercent",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="mt-5">
                <p className="text-gray-500 mb-1">Recommended Spend</p>
                <p className="font-semibold mb-0">
                  {getAllocationRange(budget, rule)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border-b border-color py-2">
                  <p className="text-gray-500 mb-1">Min Spend</p>
                  <p className="font-semibold mb-0">
                    {getAllocationAmount(budget, rule.minPercent)}
                  </p>
                </div>

                <div className="border-b border-color py-2">
                  <p className="text-gray-500 mb-1">Max Spend</p>
                  <p className="font-semibold mb-0">
                    {getAllocationAmount(budget, rule.maxPercent)}
                  </p>
                </div>
              </div>

              <p className="text-gray-500 mt-4 mb-0">{rule.description}</p>
            </div>
          ))}
        </div>
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

            <TextField
              InputProps={fieldInputProps}
              InputLabelProps={fieldLabelProps}
              label="Bench"
              type="number"
              variant="standard"
              value={benchPlayers}
              onChange={(e) => setBenchPlayers(e.target.value)}
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
