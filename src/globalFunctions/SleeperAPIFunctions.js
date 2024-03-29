export function getSleeperUserID(sleeperUsername) {
  const apiUrl = `https://api.sleeper.app/v1/user/${sleeperUsername}`;
  return fetchData(apiUrl)
    .then((data) => {
      return data.user_id; // Returning the user_id value
    })
    .catch((error) => {
      console.error("Error in onRefresh:", error);
      throw error; // Re-throw the error to propagate it further
    });
}

export function getSleeperUserName(sleeperID) {
  const apiUrl = `https://api.sleeper.app/v1/user/${sleeperID}`;
  return fetchData(apiUrl)
    .then((data) => {
      return data.username; // Returning the user_id value
    })
    .catch((error) => {
      console.error("Error in onRefresh:", error);
      throw error; // Re-throw the error to propagate it further
    });
}

export function getSleeperUserDisplayName(sleeperID) {
  const apiUrl = `https://api.sleeper.app/v1/user/${sleeperID}`;
  return fetchData(apiUrl)
    .then((data) => {
      return data.display_name; // Returning the user_id value
    })
    .catch((error) => {
      console.error("Error in onRefresh:", error);
      throw error; // Re-throw the error to propagate it further
    });
}

export function getSleeperUserLeagues(sleeperID) {
  const apiUrl = `https://api.sleeper.app/v1/user/${sleeperID}/leagues/nfl/2024`;
  return fetchData(apiUrl)
    .then((data) => {
      return data; // Returning the user_id value
    })
    .catch((error) => {
      console.error("Error in onRefresh:", error);
      throw error; // Re-throw the error to propagate it further
    });
}

export function getSleeperLeagueRosters(leagueID) {
  const apiUrl = `https://api.sleeper.app/v1/league/${leagueID}/rosters`;
  return fetchData(apiUrl)
    .then((data) => {
      return data; // Returning the user_id value
    })
    .catch((error) => {
      console.error("Error in onRefresh:", error);
      throw error; // Re-throw the error to propagate it further
    });
}

export function getPlayersFromSleeper() {
  const apiUrl = `https://api.sleeper.app/v1/players/nfl`;
  return fetchData(apiUrl)
    .then((data) => {
      return data; // Returning the user_id value
    })
    .catch((error) => {
      console.error("Error in onRefresh:", error);
      throw error; // Re-throw the error to propagate it further
    });
}

export function getPlayerData() {
  const apiUrl = `https://api.sleeper.app/v1/players/nfl`;
  return fetchData(apiUrl)
    .then((data) => {
      return data; // Returning the user_id value
    })
    .catch((error) => {
      console.error("Error in onRefresh:", error);
      throw error; // Re-throw the error to propagate it further
    });
}

function fetchData(url, options = {}) {
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
