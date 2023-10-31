import React, { useState, useEffect } from "react";
import { Header } from "../../../components";

//Visual
import { useStateContext } from "../../../contexts/ContextProvider";
import AIGeneratedSites from "./AIGeneratedSites";
import MySelectedSites from "./MySelectedSites";
import { convertDateFormat } from "../../../globalFunctions/globalFunctions";

const Sites = ({ sitesNext, backStep, detailsData }) => {
  const { currentColor } = useStateContext();
  const [selectedSites, setSelectedSites] = useState([]);

  const addSelectedData = (data) => {
    setSelectedSites([...selectedSites, data]);
  };

  const removefromSelectedData = (siteToRemove) => {
    const updatedSites = selectedSites.filter((site) => site !== siteToRemove);
    setSelectedSites(updatedSites);
  };

  const goToNext = () => {
    sitesNext(selectedSites);
  };

  useEffect(() => {
    return () => {
      setSelectedSites([]);
    };
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header
          category=""
          title={"Visit Sites in " + detailsData.Destination}
        />
        <div className="mt-10">
          <p>{detailsData.Destination}</p>
          <p>
            {convertDateFormat(detailsData.StartDate)} -{" "}
            {convertDateFormat(detailsData.EndDate)}
          </p>
        </div>
        <div className="mt-10">
          <button
            type="button"
            style={{
              backgroundColor: currentColor,
              color: "White",
              borderRadius: "10px",
            }}
            className={`text-md p-3 hover:drop-shadow-xl mb-5 mr-5`}
            onClick={backStep}
          >
            Back
          </button>
          <button
            type="button"
            style={{
              backgroundColor: currentColor,
              color: "White",
              borderRadius: "10px",
            }}
            className={`text-md p-3 hover:drop-shadow-xl mb-5 mr-5`}
            onClick={goToNext}
          >
            Next
          </button>
        </div>
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        <div className="flex gap-10 flex-wrap justify-center">
          <AIGeneratedSites
            addSelectedData={addSelectedData}
            detailsData={detailsData}
          />
          <MySelectedSites
            selectedSites={selectedSites}
            removefromSelectedData={removefromSelectedData}
          />
        </div>
      </div>
    </>
  );
};

export default Sites;
