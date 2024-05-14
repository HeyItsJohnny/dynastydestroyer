import React from "react";
import { FaStar } from "react-icons/fa";

const PlayerDetailComponent = ({ rank, searchrank, age }) => {
  return (
    <>
      <div className="mt-5 w-72 md:w-400">
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
              <FaStar />
            </button>

            <div>
              <p className="text-md font-semibold">Rank</p>
            </div>
          </div>
          <p className="text-md font-semibold">{rank}</p>
        </div>
      </div>
      <div className="mt-5 w-72 md:w-400">
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
              <FaStar />
            </button>

            <div>
              <p className="text-md font-semibold">Search Rank</p>
            </div>
          </div>
          <p className="text-md font-semibold">{searchrank}</p>
        </div>
      </div>
      <div className="mt-5 w-72 md:w-400">
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
              <FaStar />
            </button>

            <div>
              <p className="text-md font-semibold">Age</p>
            </div>
          </div>
          <p className="text-md font-semibold">{age}</p>
        </div>
      </div>
    </>
  );
};

export default PlayerDetailComponent;
