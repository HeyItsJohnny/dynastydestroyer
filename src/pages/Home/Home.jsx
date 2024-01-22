import React, { useState, useEffect } from "react";
import { Header } from "../../components";
import { useStateContext } from "../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";

//Visual
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

//Functions
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";

const Home = () => {
  const { currentUser } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");

  const fetchLeagueData = async () => {
    const docCollection = query(
      collection(db, "userprofile", currentUser.uid, "leagues"),
      orderBy("LeagueName")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          LeagueName: doc.data().LeagueName,
        };
        list.push(data);
      });
      setLeagues(list);
    });
  };

  const handleLeagueChange = (event) => {
    setSelectedLeague(event.target.value);
    console.log(event.target.value);
  };

  useEffect(() => {
    fetchLeagueData();
    return () => {
      setLeagues([]); // This worked for me
    };
  }, []);

  return (
    <>
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Dynasty Destroyer" title="Command Center" />
        <FormControl variant="outlined" fullWidth>
          <InputLabel
            id="demo-simple-select-label"
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
          >
            Select League
          </InputLabel>
          <Select
            label="Select an option"
            value={selectedLeague}
            onChange={handleLeagueChange}
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
          >
            {leagues.map((item) => (
              <MenuItem value={`${item.id}`}>{item.LeagueName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        {selectedLeague !== "" ? (
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-200">
            League Selected! {selectedLeague}
          </p>
        ) : (
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-200">
            Please select a league.
          </p>
        )}
      </div>
    </>

  );
};

export default Home;
