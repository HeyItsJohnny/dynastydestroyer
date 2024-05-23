import React, { useState } from "react";
import {
  Container,
  TextField,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  getPlayerDataByID,
  getPlayerStatsData,
  createPlayerStatObject,
} from "../../../../globalFunctions/firebasePlayerFunctions";

const PlayerProfile1 = ({ playerList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPlayerData, setSelectedPlayerData] = useState({});

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    fetchPlayerData(item.DocID);
    setSearchTerm("");
  };

  const fetchPlayerData = async (id) => {
    try {
      const data = await getPlayerDataByID(id);
      addPlayerStats(data, "2023");
    } catch (e) {
      console.log(e);
      alert("Error: " + e);
    }
  };

  const addPlayerStats = async (data, year) => {
    try {
      const getPlayerStats = await getPlayerStatsData(data.SleeperID, year);
      var playerStats = createPlayerStatObject(data, getPlayerStats);
    } catch (error) {
      console.error(
        `Error fetching stats for player ${data.SleeperID}:`,
        error
      );
    }
    setSelectedPlayerData(playerStats);
  };

  const filteredData = playerList.filter((item) =>
    item.FullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">Player 1</p>
        </div>
        <Container>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleSearch}
            value={searchTerm}
            InputProps={{
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
            InputLabelProps={{
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
          />
          <List>
            {searchTerm && (
              <List>
                {filteredData.map((item, index) => (
                  <ListItemButton
                    key={index}
                    selected={selectedItem === item}
                    onClick={() => handleSelect(item)}
                  >
                    <ListItemText primary={item.FullName} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </List>
        </Container>
        {selectedItem && (
          <div className="mt-5 w-72 md:w-300">
          <div className="flex justify-between mt-4">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">
                  {selectedItem.FullName} ({selectedItem.Position})
                </p>
              </div>
            </div>
            <p className="text-md font-semibold">{selectedPlayerData.Team}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Age:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.Age}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Years Exp.</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.YearsExperience}</p>
          </div>
          <div className="flex justify-between mt-10">
              <div className="flex gap-4">
                <div>
                  <p className="text-md font-semibold">2023 Total Points:</p>
                </div>
              </div>
              <p className="text-md">{selectedPlayerData.TotalPoints}</p>
            </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">2023 Rank:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.Rank}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Search Rank:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.SearchRank}</p>
          </div>
          <div className="flex justify-between mt-10">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Passing Yards:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.PassingYDS}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Passing TDs:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.PassingTD}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Passing INTs:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.PassingINT}</p>
          </div>
          <div className="flex justify-between mt-10">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Receptions:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.ReceivingRec}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Targets:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.ReceivingTargets}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Reception %:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.ReceptionPercentage}%</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Receiving Yards:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.ReceivingYDS}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Receiving TDs:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.ReceivingTD}</p>
          </div>
          <div className="flex justify-between mt-10">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Rush Yards:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.RushingYDS}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Rush TDs:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.RushingTD}</p>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex gap-4">
              <div>
                <p className="text-md font-semibold">Total Carries:</p>
              </div>
            </div>
            <p className="text-md">{selectedPlayerData.TotalCarries}</p>
          </div>
        </div>
        )}
      </div>
    </>
  );
};

export default PlayerProfile1;
