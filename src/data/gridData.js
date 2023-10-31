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
export const toDoSettingsGrid = [
  { field: "ToDo", headerText: "To Dos", width: "150", textAlign: "Center" },
];

export const calendarSettingsGrid = [
  { field: "CalendarEvent", headerText: "Calendar Event", width: "150", textAlign: "Center" },
  { field: "StartTime", headerText: "Start Time", width: "150", textAlign: "Center" },
  { field: "EndTime", headerText: "End Time", width: "150", textAlign: "Center" }
];
//NEW

export const plansGrid = [
  { field: "Name", headerText: "Name", width: "150", textAlign: "Center" },
  { field: "Type", headerText: "Type", width: "170", textAlign: "Center" },
  { field: "SubType", headerText: "SubType", width: "170", textAlign: "Center" },
];

export const tripCostGrid = [
  { field: "CostSummary", headerText: "Cost Summary", width: "150", textAlign: "Center" },
  { field: "Cost", headerText: "Cost ($)", width: "150", textAlign: "Center" },
  { field: "Status", headerText: "Status", width: "150", textAlign: "Center" },
  { field: "Buyer", headerText: "Financed By", width: "150", textAlign: "Center" },
];


export const peopleInvitedGrid = [
  { field: "Name", headerText: "Name", width: "150", textAlign: "Center" },
  { field: "Phone", headerText: "Phone", width: "170", textAlign: "Center" },
  { field: "Email", headerText: "Email", width: "170", textAlign: "Center" },
  { field: "Status", headerText: "Status", width: "170", textAlign: "Center" },
];

//OLD 

export const choresListSelectionGrid = [
  { type: 'checkbox', width: '50' },
  { field: "id", headerText: "Chore", width: "100", textAlign: "Center" },
  { field: "AssignedTo", headerText: "Assigned To", width: "100", textAlign: "Center" },
  { field: "Frequency", headerText: "Frequency", width: "100", textAlign: "Center" },
  { field: "LastUpdated", headerText: "Last Updated", width: "100", textAlign: "Center" },
];

export const choresListGrid = [
  { field: "id", headerText: "Chore", width: "100", textAlign: "Center" },
  { field: "AssignedTo", headerText: "Assigned To", width: "100", textAlign: "Center" },
  { field: "Frequency", headerText: "Frequency", width: "100", textAlign: "Center" },
  { field: "LastUpdated", headerText: "Last Updated", width: "100", textAlign: "Center" },
];

export const choresScheduleGrid = [
  { field: "Chore", headerText: "Chore", width: "100", textAlign: "Center" },
  { field: "Status", headerText: "Status", width: "100", textAlign: "Center" },
  { field: "AssignedTo", headerText: "Assigned To", width: "100", textAlign: "Center" },
];

export const familyPlansGrid = [
  { field: "PlanName", headerText: "Plans", width: "150", textAlign: "Center" },
  { field: "StartDate", headerText: "Start Date", width: "150", textAlign: "Center" },
  { field: "EndDate", headerText: "End Date", width: "150", textAlign: "Center" },
];

export const familyMealsSelectionGrid = [
  { type: 'checkbox', width: '50' },
  { field: "Meal", headerText: "Meal", width: "100", textAlign: "Center" },
  { field: "FoodType", headerText: "Food Type", width: "100", textAlign: "Center" },
  { field: "Description", headerText: "Description", width: "100", textAlign: "Center" },
];

export const familyMealsGrid = [
  { field: "Meal", headerText: "Meal", width: "100", textAlign: "Center" },
  { field: "FoodType", headerText: "Food Type", width: "100", textAlign: "Center" },
  { field: "Description", headerText: "Description", width: "100", textAlign: "Center" },
];

export const mealScheduleGrid = [
  { field: "Meal", headerText: "Meal", width: "100", textAlign: "Center" },
  { field: "MealType", headerText: "Meal Type", width: "100", textAlign: "Center" },
  { field: "Description", headerText: "Description", width: "100", textAlign: "Center" },
];


export const weekdayMealScheduleKanbanGrid = [
  { headerText: "Monday", keyField: "Open", allowToggle: true },
  { 
    headerText: "Tuesday", keyField: "InProgress", allowToggle: true },

  {
    headerText: "Wednesday",
    keyField: "Testing",
    allowToggle: true,
  },

  { headerText: "Thursday", keyField: "Close", allowToggle: true },
  { headerText: "Friday", keyField: "Friday", allowToggle: true },
];

export const weekendMealScheduleKanbanGrid = [
  { headerText: "Not Scheduled", keyField: "Open", allowToggle: true },
  { headerText: "Saturday", keyField: "Close", allowToggle: true },
  { headerText: "Sunday", keyField: "Friday", allowToggle: true },
];

export const PlanKanbanGrid = [
  { headerText: 'To Do', keyField: 'ToDo', allowToggle: true },
  { headerText: 'Completed', keyField: 'Completed',allowToggle: true },
];
