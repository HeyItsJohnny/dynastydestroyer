import React from "react";

//Visual
import { AiOutlineCheck } from "react-icons/ai";
const UserLineup = ({ lineup, heading }) => {
  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">{heading}</p>
        </div>
        <div className="mt-5 w-72 md:w-400">
          {lineup.map((player) => (
            <div className="flex justify-between mt-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  style={{
                    backgroundColor: "#1A97F5",
                    color: "White",
                  }}
                  className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                >
                  {player.Icon}
                </button>
                <div>
                  <p className="text-md font-semibold">
                    {player.FullName} ({player.Team})
                  </p>
                  <p className="text-sm text-gray-400">Age: {player.Age}</p>
                </div>
              </div>
              <p className={`text-green-600`}>
                SF: {player.NonSuperFlexValue}{" "}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserLineup;
