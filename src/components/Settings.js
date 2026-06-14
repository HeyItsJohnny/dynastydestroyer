import React from "react";
import { MdSportsFootball } from "react-icons/md";
import { GoDashboard } from "react-icons/go";
import { GiAmericanFootballHelmet } from "react-icons/gi";
import { TbReportMoney } from "react-icons/tb";

export const links = [
  {
    title: "Big Dawgs Draft",
    links: [
      {
        name: "Command Center",
        icon: <GoDashboard />,
        linktoname: "bigdawgsdraft/commandcenter"
      },
      {
        name: "Keepers",
        icon: <MdSportsFootball />,
        linktoname: "bigdawgsdraft/reviewteam"
      },
      {
        name: "Teams",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "bigdawgsdraft/teams"
      },    
    ],
  },
  {
    title: "Players",
    links: [
      {
        name: "Player List",
        icon: <MdSportsFootball />,
        linktoname: "players"
      },
    ],
  },
  {
    title: "Settings",
    links: [
      {
        name: "League Settings",
        icon: <MdSportsFootball />,
        linktoname: "leaguesettings"
      },
      {
        name: "Import",
        icon: <TbReportMoney />,
        linktoname: "import"
      }
    ],
  }

];

export const themeColors = [
  {
    name: "blue-theme",
    color: "#1A97F5",
  },
  {
    name: "green-theme",
    color: "#03C9D7",
  },
  {
    name: "purple-theme",
    color: "#7352FF",
  },
  {
    name: "red-theme",
    color: "#FF5C8E",
  },
  {
    name: "indigo-theme",
    color: "#1E4DB7",
  },
  {
    color: "#FB9678",
    name: "orange-theme",
  },
];
