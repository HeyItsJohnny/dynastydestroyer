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
import {
  Home,
  ComparePlayers,
  CompareLineups,
  Players,
  QBScouting,
  RBScouting,
  TEScouting,
  WRScouting,
} from "../../pages";
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
      case "SCOUTINGQBS":
        return <QBScouting />;
      case "SCOUTINGRBS":
        return <RBScouting />;
      case "SCOUTINGTES":
        return <TEScouting />;
      case "SCOUTINGWRS":
        return <WRScouting />;
      case "PLAYERS":
        return <Players />;
      case "COMPAREPLAYERS":
        return <ComparePlayers />;
      case "COMPARELINEUPS":
        return <CompareLineups />;
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
        <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
          <TooltipComponent content="Settings" position="top">
            <button
              type="button"
              className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
              onClick={() => setThemeSettings(true)}
              style={{ background: currentColor, borderRadius: "50%" }}
            >
              <FiSettings />
            </button>
          </TooltipComponent>
        </div>
        {activeMenu ? (
          <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
            <Sidebar />
          </div>
        ) : (
          <div className="w-0 dark:bg-secondary-dark-bg">
            <Sidebar />
          </div>
        )}
        <div
          className={`dark:bg-main-dark-bg bg-main-bg 
                min-h-screen w-full 
                ${activeMenu ? "md:ml-72" : "flex-2"}`}
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
