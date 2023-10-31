import React, { useState } from "react";
import { Header } from "../../components";
import { Stepper, Step, StepLabel } from "@material-ui/core";

import Details from "./Details";
import Sites from "./Sites/Sites";
import Meals from "./Meals/Meals";
import Lodging from "./Lodging/Lodging";
import ReviewPlan from "./ReviewPlan/ReviewPlan";

const steps = ["Details", "Sites", "Meals", "Lodging"];

const NewPlan = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [detailsData, setDetailsData] = useState({});
  const [sitesData, setSitesData] = useState([]);
  const [mealsData, setMealsData] = useState([]);
  const [lodgingData, setLodgingData] = useState({});

  const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
  const backStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const detailsNext = (data) => {
    const detailValues = {
      Destination: data.target.Destination.value,
      StartDate: data.target.StartDate.value,
      EndDate: data.target.EndDate.value,
    };
    setDetailsData(detailValues);
    nextStep();
  };

  const sitesNext = (data) => {
    setSitesData(data);
    nextStep();
  };

  const mealsNext = (data) => {
    setMealsData(data);
    nextStep();
  };

  const lodgingNext = (data) => {
    const lodgingValues = {
      Name: data.target.Name.value,
      Address1: data.target.Address1.value,
      Address2: data.target.Address2.value,
      City: data.target.City.value,
      State: data.target.State.value,
      ZipCode: data.target.ZipCode.value,
    };
    console.log(lodgingValues);
    setLodgingData(lodgingValues);
    nextStep();
  };

  const Confirmation = () => (
    <>
      <ReviewPlan
        detailsData={detailsData}
        sitesData={sitesData}
        mealsData={mealsData}
        lodgingData={lodgingData}
      />
    </>
  );

  function getStepContent() {
    switch (activeStep) {
      case 0:
        return <Details detailsNext={detailsNext} />;
      case 1:
        return (
          <Sites
            sitesNext={sitesNext}
            backStep={backStep}
            detailsData={detailsData}
          />
        );
      case 2:
        return (
          <Meals
            mealsNext={mealsNext}
            backStep={backStep}
            detailsData={detailsData}
          />
        );
      case 3:
        return (
          <Lodging
            lodgingNext={lodgingNext}
            backStep={backStep}
            sitesData={sitesData}
            mealsData={mealsData}
            lodgingData={lodgingData}
          />
        );
      default:
        return <h1>Something went wrong.</h1>;
    }
  }

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="" title="New Plan" />
        <Stepper
          activeStep={activeStep}
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg"
        >
          {steps.map((step) => (
            <Step key={step}>
              <StepLabel>
                <div className="text-slate-900 dark:text-gray-200">{step}</div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
      {activeStep === steps.length ? <Confirmation /> : getStepContent()}
    </>
  );
};

export default NewPlan;
