import React from "react";
import { Header } from "../../../components";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";

const ComparePlayers = () => {
    const { currentColor } = useStateContext();
    const navigate = useNavigate();
  
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl flex justify-between items-center">
        <Header category="Apps" title="Compare Players" />
      </div>
    );
}

export default ComparePlayers