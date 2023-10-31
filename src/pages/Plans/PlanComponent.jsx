import React from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { AiTwotoneDelete } from "react-icons/ai";
import { TbListDetails } from "react-icons/tb";

import { convertDateFormat } from "../../globalFunctions/globalFunctions";
import { useNavigate } from "react-router-dom";
import { deleteDocument } from "../../globalFunctions/firebaseGlobals";

const PlanComponent = ({ plan }) => {
  const navigate = useNavigate();
  const { currentColor, setPlan, setCurrentPlanIsSet } = useStateContext();

  const handleDetails = () => {
    setPlan(plan.id);             //Set Plan ID context
    setCurrentPlanIsSet(true);    //Set Plan ID to TRUE
    navigate("/summary");
  };

  const handleDeletePlan = async () => {
    deleteDocument("plans", plan.id);
  };

  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-no-repeat bg-cover bg-center"> 
      {/*<div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 bg-no-repeat bg-cover bg-center rounded-2xl ">
        */}
        <div className="flex justify-between items-center ">
          <div>
            <p className="font-bold text-gray-400">{plan.Name}</p>
            <p className="text-l">{convertDateFormat(plan.StartDate)} - {convertDateFormat(plan.EndDate)}</p>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="button"
            style={{
              backgroundColor: currentColor,
              color: "White",
              borderRadius: "10px",
            }}
            className={`text-md p-3 hover:drop-shadow-xl`}
            onClick={handleDetails}
          >
            <TbListDetails />
          </button>
          <button
            type="button"
            style={{
              backgroundColor: "#FF0000",
              color: "White",
              borderRadius: "10px",
            }}
            className={`text-md p-3 hover:drop-shadow-xl float-right`}
            onClick={handleDeletePlan}
          >
            <AiTwotoneDelete />
          </button>
        </div>
      </div>
    </>
  );
};

export default PlanComponent;
