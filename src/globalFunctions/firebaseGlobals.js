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

export async function getPlans() {
  const docCollection = query(collection(db, "plans"));
  const list = [];
  onSnapshot(docCollection, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      var data = {
        id: doc.id,
        Name: doc.data().Name,
        Type: doc.data().Type,
        SubType: doc.data().SubType,
      };
      list.push(data);
    });
  });
  console.log("HIT 1...");
  console.log(list);
  return list;
}

export async function deleteDocument(name, docid) {
  try {
    await deleteDoc(doc(db, name, docid));
  } catch (error) {
    alert("Error deleting data from Firestore:", error);
  }
}

export async function updatePlanStartDate(planid, start) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      StartDate: start,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanEndDate(planid, end) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      EndDate: end,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

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

export async function addToPlanCalendar(planid, data) {
  try {
    console.log(data.StartTime);
    await addDoc(collection(db, "plans", planid, "calendar"), {
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

export async function updatePlanCalendar(planid, data) {
  try {
    const calendarEventsRef = doc(db, "plans", planid, "calendar", data.Id);
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

export async function deletePlanCalendar(planid, docid) {
  try {
    await deleteDoc(doc(db, "plans", planid, "calendar", docid));
  } catch (error) {
    alert("Error deleting data from Database: " + error);
  }
}

export async function updatePlanEnableAirfare(planid, displayValue) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      EnableAirfare: displayValue,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanEnableLodging(planid, displayValue) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      EnableLodging: displayValue,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function updatePlanEnableToDos(planid, displayValue) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      EnableToDos: displayValue,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

//Lodging Information -
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

export async function updatePlanTotalBudget(planid, value) {
  try {
    const familyPlansRef = doc(db, "plans", planid);
    await updateDoc(familyPlansRef, {
      TotalPlanBudget: value,
    });
  } catch (error) {
    alert("Error editing data to Database: " + error);
  }
}

export async function addToCalendar(planid, startdate, enddate, docid, calsubject) {
  try {
    await setDoc(doc(db, "plans", planid, "calendar", docid), {
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

export async function addCheckinCalendar(planid, startdate, enddate) {
  try {
    await setDoc(doc(db, "plans", planid, "calendar", "LodgingCheckin"), {
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

export async function addCheckoutCalendar(planid, startdate, enddate) {
  try {
    await setDoc(doc(db, "plans", planid, "calendar", "LodgingCheckout"), {
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

//Lodging Information +

//Settings -
export async function addToDoSettings(data) {
  try {
    console.log(data.StartTime);
    await addDoc(collection(db, "todosettings"), {
      ToDo: data.target.ToDo.value,
    });
  } catch (error) {
    alert("Error adding data to Database: " + error);
  }
}

export async function addCalendarSettings(data) {
  try {
    console.log(data.StartTime);
    await addDoc(collection(db, "calendarsettings"), {
      CalendarEvent: data.target.CalendarEvent.value,
      StartTime: data.target.StartTime.value,
      EndTime: data.target.EndTime.value,
    });
  } catch (error) {
    alert("Error adding data to Database: " + error);
  }
}
//Settings +

//Budget -
export async function addBudgetCosts(planid, data, category) {
  try {
    console.log(data.StartTime);
    await addDoc(collection(db, "plans", planid, "budgetcosts"), {
      BudgetCategory: category,
      Cost: data.target.Cost.value,
      Summary: data.target.Summary.value,
    });
  } catch (error) {
    alert("Error adding data to Database: " + error);
  }
}
//Budget +

/*
export const getUserProfile = async (uid) => {
  const userRef = firestore.collection('users').doc(uid);
  const userDoc = await userRef.get();
  
  if (userDoc.exists) {
    return userDoc.data();
  } else {
    return null;
  }
};
*/
