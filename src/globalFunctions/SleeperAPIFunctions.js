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
