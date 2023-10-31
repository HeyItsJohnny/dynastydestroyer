import React, { useState, useEffect } from "react";

import { db } from "../firebase/firebase";

import {
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

import { getDatesBetween } from "./globalFunctions";

export async function addNewPlan(data) {
  try {
    const docRef = await addDoc(collection(db, "plans"), {
      Name: data.target.Name.value,
      Destination: data.target.Destination.value,
      StartDate: data.target.StartDate.value,
      EndDate: data.target.EndDate.value,
      EnableAirfare: false,
      EnableLodging: false,
      EnableToDos: false,
    });
    startCreateDateDocuments(data,docRef.id);
  } catch (error) {
    alert("Error adding data to Database: " + error);
  }
}

function startCreateDateDocuments(data, docID) {
  const arrayOfDates = getDatesBetween(data.target.StartDate.value,data.target.EndDate.value);
  arrayOfDates.forEach((date) => {
    addNewPlanDateDocuments(data, docID, date);
  });
}

async function addNewPlanDateDocuments(data, docID, date) {
  try {
    await setDoc(doc(db, "plans", docID, "datedocuments",date), {
      PlanName: data.target.Name.value,
      PlanDate: date
    });
  } catch (error) {
    alert("Error adding data to Database: " + error);
  }
}

//Summary Page
export async function updatePlanDestination(planid, destination) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      Destination: destination,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

//Day Page
export async function deleteDayDocument(planid, docid) {
  try {
    await deleteDoc(doc(db, "plans", planid, "datedocuments", docid));
  } catch (error) {
    alert("Error deleting data from Firestore:", error);
  }
}

export async function addToPlanDayCalendar(planid, dayid, data) {
  try {
    console.log(data.StartTime);
    await addDoc(collection(db, "plans", planid, "datedocuments", dayid, "calendar"), {
      Subject: data.Subject,
      Location: data.Location ?? "",
      Description: data.Description ?? "",
      StartTime: data.StartTime ?? "",
      EndTime: data.EndTime ?? "",
      IsAllDay: data.IsAllDay ?? "",
      RecurrenceRule: data.RecurrenceRule ?? "",
      RecurrenceException: data.RecurrenceException ?? "",
      CategoryColor: data.CategoryColor ?? "",
      EventColor: data.EventColor ?? "",
    });
  } catch (error) {
    alert("Error adding data to Database: " + error);
  }
}

export async function updatePlanDayCalendar(planid, dayid, data) {
  try {
    const calendarEventsRef = doc(db, "plans", planid, "datedocuments", dayid, "calendar", data.Id);
    await updateDoc(calendarEventsRef, {
      Subject: data.Subject,
      Location: data.Location ?? "",
      Description: data.Description ?? "",
      StartTime: data.StartTime ?? "",
      EndTime: data.EndTime ?? "",
      IsAllDay: data.IsAllDay ?? "",
      RecurrenceRule: data.RecurrenceRule ?? "",
      RecurrenceException: data.RecurrenceException ?? "",
      CategoryColor: data.CategoryColor ?? "",
      EventColor: data.EventColor ?? "",
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function deletePlanDayCalendar(planid, dayid, docid) {
  try {
    await deleteDoc(doc(db, "plans", planid, "datedocuments", dayid, "calendar", docid));
  } catch (error) {
    alert("Error deleting data from Database: " + error);
  }
}

export async function addEventToCalendar(planid, startdate, enddate, dayid, docid, calsubject) {
  try {
    await setDoc(doc(db, "plans", planid, "datedocuments", dayid, "calendar", docid), {
      CategoryColor: "",
      Description: "",
      EndTime: enddate,
      EventColor: "",
      IsAllDay: false,
      Location: "",
      RecurrenceException: "",
      RecurrenceRule: "",
      StartTime: startdate,
      Subject: calsubject,
    });
  } catch (error) {
    alert("There was an error adding to the database: " + error);
  }
}

//Detail Functions -
export async function updatePlanLodgingCheckinDate(planid, checkindate) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingCheckinDate: checkindate,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanLodgingCheckinTime(planid, checkintime) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingCheckinTime: checkintime,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanLodgingCheckoutDate(planid, checkoutdate) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingCheckoutDate: checkoutdate,
    });
  } catch (error) {
    alert("Error editing data tso Database: " + error);
  }
}

export async function updatePlanLodgingCheckoutTime(planid, checkouttime) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingCheckoutTime: checkouttime,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanLodgingAddress1(planid, address1) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingAddress1: address1,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanLodgingAddress2(planid, address2) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingAddress2: address2,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanLodgingAddressCity(planid, addresscity) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingAddressCity: addresscity,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanLodgingAddressState(planid, addressstate) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingAddressState: addressstate,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanLodgingAddressZip(planid, addresszip) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      LodgingAddressZip: addresszip,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function addCheckinCalendar(planid, dayid, startdate, enddate) {
  try {
    await setDoc(doc(db, "plans", planid, "datedocuments", dayid, "calendar", "LodgingCheckin"), {
      CategoryColor: "",
      Description: "",
      EndTime: enddate,
      EventColor: "",
      IsAllDay: false,
      Location: "",
      RecurrenceException: "",
      RecurrenceRule: "",
      StartTime: startdate,
      Subject: "Lodging Checkin",
    });
  } catch (error) {
    alert("There was an error adding to the database: " + error);
  }
}

export async function addCheckoutCalendar(planid, dayid, startdate, enddate) {
  try {
    await setDoc(doc(db, "plans", planid, "datedocuments", dayid, "calendar", "LodgingCheckout"), {
      CategoryColor: "",
      Description: "",
      EndTime: enddate,
      EventColor: "",
      IsAllDay: false,
      Location: "",
      RecurrenceException: "",
      RecurrenceRule: "",
      StartTime: startdate,
      Subject: "Lodging Checkout",
    });
  } catch (error) {
    alert("There was an error adding to the database: " + error);
  }
}

export async function deletePlanCalendar(planid, dayid, docid) {
  try {
    await deleteDoc(doc(db, "plans", planid, "datedocuments", dayid, "calendar", docid));
  } catch (error) {
    alert("Error deleting data from Database: " + error);
  }
}
//Details Functions +

//Food Calendar Functions -
export async function updateFoodCalendarWithRestaurant(planid, dayid, docid, subject, address) {
  try {
    const familyPlansRef = doc(db, "plans", planid, "datedocuments", dayid, "calendar", docid);
    await updateDoc(familyPlansRef, {
      Subject: subject,
      Location: address
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}
//Food Calendar Functions +