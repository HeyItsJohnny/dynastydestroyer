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

export const stackedChartData = [
  [
    { x: '1', y: 24 },
    { x: '2', y: 35 },
    { x: '3', y: 20 },
    { x: '4', y: 18 },
    { x: '5', y: 28 },
    { x: '6', y: 17 },
    { x: '7', y: 16 },
    { x: '8', y: 15 },
    { x: '9', y: 0 },
    { x: '10', y: 10 },
    { x: '11', y: 11 },
    { x: '12', y: 26 },
    { x: '13', y: 34 },
    { x: '14', y: 24 },
    { x: '15', y: 3 },
    { x: '16', y: 19 },
    { x: '17', y: 20 },
  ]
];

export const stackedCustomSeries = [

  { dataSource: stackedChartData[0],
    xName: 'x',
    yName: 'y',
    name: 'Weekly Points',
    type: 'StackingColumn',
    background: 'blue',
  },
];

export const stackedPrimaryXAxis = {
  majorGridLines: { width: 0 },
  minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  interval: 1,
  lineStyle: { width: 0 },
  labelIntersectAction: 'Rotate45',
  valueType: 'Category',
};

export const stackedPrimaryYAxis = {
  lineStyle: { width: 0 },
  minimum: 0,
  maximum: 50,
  interval: 10,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  minorGridLines: { width: 1 },
  minorTickLines: { width: 0 },
  labelFormat: '{value}',
};
