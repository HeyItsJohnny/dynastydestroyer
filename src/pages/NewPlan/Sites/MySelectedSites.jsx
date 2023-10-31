import React from "react";

//Visual
import { AiTwotoneDelete } from "react-icons/ai";

//Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MySelectedSites = ({ selectedSites, removefromSelectedData }) => {
  const removeSite = (site) => {
    removefromSelectedData(site);
    toast(site.name + " removed from my list.");
  };

  return (
    <>
      <ToastContainer />
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">My List</p>
        </div>
        <div className="mt-5 w-72 md:w-400">
          {selectedSites.map((site) => (
            <div className="flex justify-between mt-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  style={{
                    backgroundColor: "#FF0000",
                    color: "White",
                  }}
                  className="text-2xl rounded-lg p-2 hover:drop-shadow-xl"
                  onClick={() => removeSite(site)}
                >
                  <AiTwotoneDelete />
                </button>
                <div>
                  <a href={site.website} target="_blank">
                    <p className="text-md font-semibold">{site.name}</p>
                  </a>
                  <p className="text-sm text-gray-400">
                    Hours: {site.hours_spent}
                  </p>
                </div>
              </div>
              <p className={`text-green-600`}>{site.review_stars}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MySelectedSites;
