import React from "react";
import { AiOutlinePieChart, AiFillSetting } from "react-icons/ai";
import { FaCarSide } from "react-icons/fa";
import { FcTodoList } from "react-icons/fc";
import { MdOutlineCompareArrows } from "react-icons/md";
import { GoDashboard } from "react-icons/go";
import { GiAmericanFootballHelmet } from "react-icons/gi";
import { TbReportMoney } from "react-icons/tb";

export const links = [
  {
    title: "Home",
    links: [
      {
        name: "Command Center",
        icon: <GoDashboard />,
        linktoname: "commandcenter"
      },
      {
        name: "Auction Draft",
        icon: <GoDashboard />,
        linktoname: "auctiondraft"
      },
      {
        name: "Snake Draft",
        icon: <GoDashboard />,
        linktoname: "snakedraft"
      },
      /*
      {
        name: "command center",
        icon: <GoDashboard />,
        linktoname: "home"
      },*/
    ],
  },
  {
    title: "Scouting",
    links: [
      {
        name: "Quarterbacks",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "scouting/quarterbacks"
      },
      {
        name: "Running Backs",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "scouting/runningbacks"
      },
      {
        name: "Tight Ends",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "scouting/tightends"
      },
      {
        name: "Wide Receivers",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "scouting/widereceivers"
      },
    ],
  },
  {
    title: "Settings",
    links: [
      {
        name: "User Settings",
        icon: <AiFillSetting />,
        linktoname: "settings"
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
