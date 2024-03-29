import React from "react";
import {
  AiOutlineCalendar,
  AiOutlineShoppingCart,
  AiOutlineAreaChart,
  AiOutlineBarChart,
  AiOutlineStock,
} from "react-icons/ai";
import {
  FiShoppingBag,
  FiEdit,
  FiPieChart,
  FiBarChart,
  FiCreditCard,
  FiStar,
  FiShoppingCart,
} from "react-icons/fi";
import {
  BsKanban,
  BsBarChart,
  BsBoxSeam,
  BsCurrencyDollar,
  BsShield,
  BsChatLeft,
} from "react-icons/bs";
import { BiColorFill } from "react-icons/bi";
import { IoMdContacts } from "react-icons/io";
import { RiContactsLine, RiStockLine } from "react-icons/ri";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { HiOutlineRefresh } from "react-icons/hi";
import { TiTick } from "react-icons/ti";
import { GiLouvrePyramid } from "react-icons/gi";
import { GrLocation } from "react-icons/gr";
import avatar from "./avatar.jpg";
import avatar2 from "./avatar2.jpg";
import avatar3 from "./avatar3.png";
import avatar4 from "./avatar4.jpg";
import product1 from "./product1.jpg";
import product2 from "./product2.jpg";
import product3 from "./product3.jpg";
import product4 from "./product4.jpg";
import product5 from "./product5.jpg";
import product6 from "./product6.jpg";
import product7 from "./product7.jpg";
import product8 from "./product8.jpg";

//NEW 2.0
/*
export const playersQBGrid = [
  { field: "FullName", headerText: "Name", width: "150", textAlign: "Center" },
  { field: "Team", headerText: "Team", width: "150", textAlign: "Center" },
]; 
*/

export const playersQBGrid = [
  { field: "FullName", headerText: "Name", width: "150", textAlign: "Center" },
  { field: "Age", headerText: "Age", width: "50", textAlign: "Center" },
  { field: "Team", headerText: "Team", width: "100", textAlign: "Center" },
  { field: "PassingYDS", headerText: "Pass Yds", width: "100", textAlign: "Center" },
  { field: "PassingTD", headerText: "Pass TDs", width: "100", textAlign: "Center" },
  { field: "PassingINT", headerText: "INTs", width: "100", textAlign: "Center" },
  { field: "RushingYDS", headerText: "Rush YDs", width: "100", textAlign: "Center" },
  { field: "RushingTD", headerText: "Rush TDs", width: "100", textAlign: "Center" },
  { field: "TotalPoints", headerText: "Total Points", width: "100", textAlign: "Center" },
];

export const playersRBGrid = [
  { field: "FullName", headerText: "Name", width: "150", textAlign: "Center" },
  { field: "Age", headerText: "Age", width: "50", textAlign: "Center" },
  { field: "Team", headerText: "Team", width: "100", textAlign: "Center" },
  { field: "RushingYDS", headerText: "Rush YDs", width: "100", textAlign: "Center" },
  { field: "RushingTD", headerText: "Rush TDs", width: "100", textAlign: "Center" },
  { field: "ReceivingYDS", headerText: "Rec YDs", width: "100", textAlign: "Center" },
  { field: "ReceivingTD", headerText: "Rec TDs", width: "100", textAlign: "Center" },
  { field: "TotalPoints", headerText: "Total Points", width: "100", textAlign: "Center" },
];

export const playersTEWRGrid = [
  { field: "FullName", headerText: "Name", width: "150", textAlign: "Center" },
  { field: "Age", headerText: "Age", width: "50", textAlign: "Center" },
  { field: "Team", headerText: "Team", width: "100", textAlign: "Center" },
  { field: "ReceivingRec", headerText: "Rcpt", width: "100", textAlign: "Center" },
  { field: "ReceivingYDS", headerText: "Rec YDs", width: "100", textAlign: "Center" },
  { field: "ReceivingTD", headerText: "Rec TDs", width: "100", textAlign: "Center" },
  { field: "ReceivingTargets", headerText: "Targets", width: "100", textAlign: "Center" },
  { field: "ReceptionPercentage", headerText: "Rcpt %", width: "100", textAlign: "Center" },
  { field: "TotalPoints", headerText: "Total Points", width: "100", textAlign: "Center" },
];

