import React, { useState, useEffect } from "react";

import { GoPrimitiveDot } from "react-icons/go";

const HomeDetails = () => {
  return (
    <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-780  ">
      <div className="flex justify-between">
        <p className="font-semibold text-xl">Starter Details</p>
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-2 text-gray-600 hover:drop-shadow-xl">
            <span>
              <GoPrimitiveDot />
            </span>
            <span>Expense</span>
          </p>
          <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
            <span>
              <GoPrimitiveDot />
            </span>
            <span>Budget</span>
          </p>
        </div>
      </div>
      <div className="mt-10 flex gap-10 flex-wrap justify-left">
        <div className=" border-r-1 border-color m-4 pr-10">
          <div>
            <p>
              <span className="text-green-500 text-3xl font-semibold">34</span>
            </p>
            <p className="text-gray-500 mt-1">Average QB Age</p>
          </div>
          <div className="mt-4">
            <p className="text-red-500 text-3xl font-semibold">26</p>
            <p className="text-gray-500 mt-1">Average RB Age</p>
          </div>
          <div className="mt-4">
            <p className="text-red-500 text-3xl font-semibold">30</p>
            <p className="text-gray-500 mt-1">Average TE Age</p>
          </div>
          <div className="mt-4">
            <p className="text-green-500 text-3xl font-semibold">25</p>
            <p className="text-gray-500 mt-1">Average WR Age</p>
          </div>
        </div>
        <div>PIE CHART HERE</div>
      </div>
      <div className="flex justify-between">
        <p className="font-semibold text-xl mt-4">Bench Details</p>
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-2 text-gray-600 hover:drop-shadow-xl">
            <span>
              <GoPrimitiveDot />
            </span>
            <span>Expense</span>
          </p>
          <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
            <span>
              <GoPrimitiveDot />
            </span>
            <span>Budget</span>
          </p>
        </div>
      </div>

      <div className="mt-10 flex gap-10 flex-wrap justify-left">
        <div className=" border-r-1 border-color m-4 pr-10">
          <div>
            <p>
              <span className="text-green-500 text-3xl font-semibold">34</span>
            </p>
            <p className="text-gray-500 mt-1">Average QB Age</p>
          </div>
          <div className="mt-4">
            <p className="text-red-500 text-3xl font-semibold">26</p>
            <p className="text-gray-500 mt-1">Average RB Age</p>
          </div>
          <div className="mt-4">
            <p className="text-red-500 text-3xl font-semibold">30</p>
            <p className="text-gray-500 mt-1">Average TE Age</p>
          </div>
          <div className="mt-4">
            <p className="text-green-500 text-3xl font-semibold">25</p>
            <p className="text-gray-500 mt-1">Average WR Age</p>
          </div>
        </div>
        <div>PIE CHART HERE</div>
      </div>
    </div>
  );
};

export default HomeDetails;
