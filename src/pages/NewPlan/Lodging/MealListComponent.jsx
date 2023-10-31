import React from "react";

//Visual
import { AiOutlineCheck } from "react-icons/ai";
import { useStateContext } from "../../../contexts/ContextProvider";

const MealListComponent = ({ mealsData }) => {
  const { currentColor } = useStateContext();

  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">Restaurants</p>
        </div>
        <div className="mt-5 w-72 md:w-400">
          {mealsData.map((meal) => (
            <div className="flex justify-between mt-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  style={{
                    backgroundColor: currentColor,
                    color: "White",
                  }}
                  className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                >
                  <AiOutlineCheck />
                </button>
                <div>
                  <a href={meal.website} target="_blank">
                    <p className="text-md font-semibold">{meal.name}</p>
                  </a>
                  <p className="text-sm text-gray-400">{meal.category}</p>
                </div>
              </div>
              <p className={`text-green-600`}>{meal.review_stars}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MealListComponent;
