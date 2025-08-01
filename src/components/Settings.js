import React from "react";
import { AiOutlinePieChart, AiFillSetting } from "react-icons/ai";
import { FaCarSide } from "react-icons/fa";
import { FcTodoList } from "react-icons/fc";
import { MdOutlineCompareArrows } from "react-icons/md";
import { GoDashboard } from "react-icons/go";
import { GiAmericanFootballHelmet } from "react-icons/gi";
import { TbReportMoney } from "react-icons/tb";
import { TfiArrowTopRight } from "react-icons/tfi";

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
        name: "Teams",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "bigdawgsdraft/teams"
      },    
    ],
  },
  {
    title: "Tiers/Sleepers",
    links: [
      {
        name: "QB Tier List",
        icon: <TfiArrowTopRight />,
        linktoname: "tiers/qb"
      },
      {
        name: "RB Tier List",
        icon: <TfiArrowTopRight />,
        linktoname: "tiers/rb"
      },
      {
        name: "TE Tier List",
        icon: <TfiArrowTopRight />,
        linktoname: "tiers/te"
      },
      {
        name: "WR Tier List",
        icon: <TfiArrowTopRight />,
        linktoname: "tiers/wr"
      },
      {
        name: "Sleepers",
        icon: <MdOutlineCompareArrows />,
        linktoname: "sleepers"
      }
    ],
  },
  {
    title: "Apps",
    links: [
      {
        name: "Compare Players",
        icon: <MdOutlineCompareArrows />,
        linktoname: "apps/compareplayers"
      }
    ],
  },
  {
    title: "Players",
    links: [
      {
        name: "Quarterbacks",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "players/quarterbacks"
      },
      {
        name: "Running Backs",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "players/runningbacks"
      },
      {
        name: "Tight Ends",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "players/tightends"
      },
      {
        name: "Wide Receivers",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "players/widereceivers"
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
