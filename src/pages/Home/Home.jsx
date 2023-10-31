import React from "react";
import { Header } from "../../components";
import { useStateContext } from "../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();

  const newTrip = async () => {
    navigate("/newplan");
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl flex justify-between items-center">
      <Header category="Home" title="Welcome to the Dynasty Destroyer" />

    </div>
  );
};

export default Home;
