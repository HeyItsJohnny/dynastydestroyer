import React, {useEffect} from "react";
import { Header } from "../../../components";

import { Typography, Button } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";

import ReviewLodgingComponent from "./ReviewLodgingComponent";
import ReviewSiteComponent from "./ReviewSiteComponent";
import ReviewMealComponent from "./ReviewMealComponent";

const ReviewPlan = ({ detailsData, sitesData, mealsData, lodgingData }) => {

  useEffect(() => {
    console.log("DATA 1:");
    console.log(lodgingData)
    return () => {
    };
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category={detailsData.Destination} title="Itinerary" />
        <p className="mb-5">We'll generate an itinerary here..</p>
        <Button
          className={`m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl`}
          component={Link}
          variant="outlined"
          type="button"
          to="/"
        >
          Back to home
        </Button>
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        <div className="flex gap-10 flex-wrap justify-center">
          <ReviewLodgingComponent lodgingData={lodgingData} />
          <ReviewSiteComponent sitesData={sitesData} />
          <ReviewMealComponent mealsData={mealsData} />
        </div>
      </div>
    </>
  );
};

export default ReviewPlan;
