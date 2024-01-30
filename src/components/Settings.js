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
    title: "Leagues",
    links: [
      {
        name: "command center",
        icon: <GoDashboard />,
        linktoname: "home"
      },
    ],
  },
  {
    title: "Apps",
    links: [
      {
        name: "Players",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "players"
      },
      {
        name: "Compare Players",
        icon: <MdOutlineCompareArrows />,
        linktoname: "compareplayers"
      },
      {
        name: "Lineups",
        icon: <GiAmericanFootballHelmet />,
        linktoname: "comparelineups"
      },
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
