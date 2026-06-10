import { db } from "../firebase/firebase";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const getLeagueSettingsDocRef = (uid) =>
  doc(db, "userprofile", uid, "leaguesettings", "settings");

const normalizeLeagueSettings = (leagueSettings) => ({
  LeagueName: leagueSettings.LeagueName ?? "",
  ScoringFormat: leagueSettings.ScoringFormat ?? "PPR",
  PPRPoints: leagueSettings.PPRPoints * 1,
  Teams: leagueSettings.Teams * 1,
  Budget: leagueSettings.Budget * 1,
  PlayoffTeams: leagueSettings.PlayoffTeams * 1,
  LeagueTeams: Array.isArray(leagueSettings.LeagueTeams)
    ? leagueSettings.LeagueTeams.map((team, index) => ({
        TeamName: team.TeamName ?? "",
        MyTeam: team.MyTeam === true,
        TeamNumber: index + 1,
      }))
    : [],
  QBPlayers: leagueSettings.QBPlayers * 1,
  RBPlayers: leagueSettings.RBPlayers * 1,
  WRPlayers: leagueSettings.WRPlayers * 1,
  TEPlayers: leagueSettings.TEPlayers * 1,
  FLEXPlayers: leagueSettings.FLEXPlayers * 1,
  DEFPlayers: leagueSettings.DEFPlayers * 1,
  KPlayers: leagueSettings.KPlayers * 1,
  AllocationRules: Array.isArray(leagueSettings.AllocationRules)
    ? leagueSettings.AllocationRules.map((rule) => ({
        position: rule.position ?? "",
        title: rule.title ?? "",
        minPercent: Number(rule.minPercent) || 0,
        maxPercent: Number(rule.maxPercent) || 0,
        description: rule.description ?? "",
      }))
    : [],
});

export async function getLeagueSettings(uid) {
  try {
    const docRef = getLeagueSettingsDocRef(uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error("Error fetching league settings:", error);
    throw error;
  }
}

export async function createOrUpdateLeagueSettings(uid, leagueSettings) {
  const existingSettings = await getLeagueSettings(uid);

  if (existingSettings) {
    return updateLeagueSettings(uid, leagueSettings);
  }

  return createLeagueSettings(uid, leagueSettings);
}

export async function createLeagueSettings(uid, leagueSettings) {
  try {
    await setDoc(
      getLeagueSettingsDocRef(uid),
      normalizeLeagueSettings(leagueSettings)
    );
  } catch (error) {
    console.error("Error creating league settings:", error);
    throw error;
  }
}

export async function updateLeagueSettings(uid, leagueSettings) {
  try {
    await updateDoc(
      getLeagueSettingsDocRef(uid),
      normalizeLeagueSettings(leagueSettings)
    );
  } catch (error) {
    console.error("Error updating league settings:", error);
    throw error;
  }
}
