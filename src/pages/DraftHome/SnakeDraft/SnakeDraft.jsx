import React, { useState, useEffect } from "react";

//UI
import { TextField, Button } from "@mui/material";
import { Header } from "../../../components";

const SnakeDraft = () => {
  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Snake Draft" title="First Rounds" />
      </div>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Snake Draft" title="Middle Rounds" />
      </div>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Snake Draft" title="Late Rounds" />
      </div>
    </>
  );
};

export default SnakeDraft;
