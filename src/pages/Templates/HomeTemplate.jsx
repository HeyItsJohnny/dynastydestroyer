import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import {
  Navbar,
  NavigationBar,
  Sidebar,
  ThemeSettings,
} from "../../components";
import { Plans, Home, NewPlan } from "../../pages";
import { AuthProvider } from "../../contexts/AuthContext";
import "../../App.css";

import { useStateContext } from "../../contexts/ContextProvider";

const HomeTemplate = ({ page }) => {
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentMode,
  } = useStateContext();

  function getCurrentPage() {
    switch (page) {
      case "HOME":
        return <Home />;
      case "PLANS":
        return <Plans />;
      case "NEWPLAN":
        return <NewPlan />;
      default:
        return (
          <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
            <h1>Something went wrong..</h1>
          </div>
        );
    }
  }
  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <div className="flex relative dark:bg-mai-dark-bg">
        <div
          className={`dark:bg-main-dark-bg bg-main-bg 
                min-h-screen w-full "flex-2"`}
        >
          <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
            <Navbar />
          </div>

          <div>
            {themeSettings && <ThemeSettings />}
            {getCurrentPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTemplate;
