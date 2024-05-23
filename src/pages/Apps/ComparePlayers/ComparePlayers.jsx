import React, { useState, useEffect } from "react";
import { Header } from "../../../components";
import { useStateContext } from "../../../contexts/ContextProvider";

import PlayerProfile1 from "./PlayerProfiles/PlayerProfile1";
import PlayerProfile2 from "./PlayerProfiles/PlayerProfile2";
import PlayerProfile3 from "./PlayerProfiles/PlayerProfile3";

import { getPlayerName } from "../../../globalFunctions/firebasePlayerFunctions";

/*
const data = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
];
*/

const ComparePlayers = () => {
  const { currentColor } = useStateContext();
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const players = await getPlayerName();
      setData(players);
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      setData([]);
    };
  }, [])

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl flex justify-between items-center">
        <Header category="Apps" title="Compare Players" />
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        <PlayerProfile1 playerList={data}/>
        <PlayerProfile2 playerList={data}/>
        <PlayerProfile3 playerList={data}/>
      </div>
      
    </>
  );
};

export default ComparePlayers;
