import React from "react";

//Visual
import { AiOutlineCheck } from "react-icons/ai";

const UserStartersComponent = ({ userStarters }) => {
  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">Starters</p>
        </div>
        <div className="mt-5 w-72 md:w-400">
          {userStarters.map((player) => (
            <div className="flex justify-between mt-4">
              <div className="flex gap-4">
                <AiOutlineCheck />
                <div>
                  <p className="text-md font-semibold">{player.FullName}</p>
                  <p className="text-sm text-gray-400">Age: {player.Age}</p>
                  <p className="text-sm text-gray-400">
                    Position: {player.Position}
                  </p>
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

export default UserStartersComponent;
