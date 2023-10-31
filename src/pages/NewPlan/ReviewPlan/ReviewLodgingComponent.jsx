import React, { useEffect } from "react";

const ReviewLodgingComponent = ({ lodgingData }) => {
  useEffect(() => {
    console.log("DATA 2:");
    console.log(lodgingData)
    return () => {
    };
  }, []);

  return (
    <>
      <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xl font-semibold">Lodging</p>
        </div>
        <div className="mt-5 w-72 md:w-400">
          <p className="text-md font-semibold">{lodgingData.Name}</p>
          <p className="text-md font-semibold">{lodgingData.Address1}</p>
          <p className="text-md font-semibold">{lodgingData.Address2}</p>
          <p className="text-md font-semibold">{lodgingData.City}, {lodgingData.State} {lodgingData.ZipCode}</p>
          <br />
          <p>Maybe Google Maps Link here..</p>
        </div>
      </div>
    </>
  );
};

export default ReviewLodgingComponent;
