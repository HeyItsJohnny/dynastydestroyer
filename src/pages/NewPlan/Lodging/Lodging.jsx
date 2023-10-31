import React from "react";
import { Header } from "../../../components";

import { useStateContext } from "../../../contexts/ContextProvider";
import MealListComponent from "./MealListComponent";
import SiteListComponent from "./SiteListComponent";
import LodgingComponent from "./LodgingComponent";

const Lodging = ({ lodgingNext, backStep, sitesData, mealsData }) => {
  const { currentColor } = useStateContext();

  return (
    <>
      <div className="flex gap-10 flex-wrap justify-center">
        <div className="flex gap-10 flex-wrap justify-center">
          <LodgingComponent lodgingNext={lodgingNext} backStep={backStep}/>
          <MealListComponent mealsData={mealsData}/>
          <SiteListComponent sitesData={sitesData}/>
        </div>
      </div>
    </>
  );
};

export default Lodging;
