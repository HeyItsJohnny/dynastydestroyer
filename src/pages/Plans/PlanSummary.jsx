import React, { useState, useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

//Visual
import { Header } from "../../components";
import { Box, TextField } from "@mui/material";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  Resize,
  DragAndDrop,
} from "@syncfusion/ej2-react-schedule";
import { parseISO } from "date-fns";
import { IoIosAddCircle } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Data
import { db } from "../../firebase/firebase";
import { doc, getDoc, query, collection, onSnapshot } from "firebase/firestore";
import { useStateContext } from "../../contexts/ContextProvider";
import {
  updatePlanStartDate,
  updatePlanEndDate,
  addToPlanCalendar,
  updatePlanCalendar,
  deletePlanCalendar,
  updatePlanDestination,
  addToCalendar,
  addCheckinCalendar,
  addCheckoutCalendar,
} from "../../globalFunctions/firebaseGlobals";

import {
  convertTo12HourFormat,
  getDatesBetween,
  convertDateTimeString,
  convertDateFormat,
} from "../../globalFunctions/globalFunctions";

import { useNavigate } from "react-router-dom";

const PlanSummary = () => {
  const {
    currentSelectedPlan,
    setEnableAirfare,
    setEnableLodging,
    setEnableToDos,
    enableLodging,
    EnableAirfare,
    enableToDos,
  } = useStateContext();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");

  //Itinerary
  const [planCalendar, setPlanCalendar] = useState([]);
  const [calendarView, setCalendarView] = useState("Week");
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  const [plan, setPlan] = useState({});
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //Calendar Settings
  const [calendarSettings, setCalendarSettings] = useState([]);

  //Checkin/Checkout Dates
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");

  const fetchCalendarSettingsData = async () => {
    const docCollection = query(collection(db, "calendarsettings"));
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          CalendarEvent: doc.data().CalendarEvent,
          StartTimeFormatted: convertTo12HourFormat(doc.data().StartTime),
          StartTime: doc.data().StartTime,
          EndTimeFormatted: convertTo12HourFormat(doc.data().EndTime),
          EndTime: doc.data().EndTime,
        };
        list.push(data);
      });
      setCalendarSettings(list);
    });
  };

  const setPlanFromContext = async () => {
    try {
      const docRef = doc(db, "plans", currentSelectedPlan);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPlan(docSnap.data());
        setDestination(docSnap.data().Destination);
        setStartDate(docSnap.data().StartDate);
        setEndDate(docSnap.data().EndDate);
        setEnableLodging(docSnap.data().EnableLodging);
        setEnableAirfare(docSnap.data().EnableAirfare);
        setEnableToDos(docSnap.data().EnableToDos);
        setCalendarViewComponents(
          docSnap.data().StartDate,
          docSnap.data().EndDate
        );
        setCheckinDate(convertDateFormat(docSnap.data().LodgingCheckinDate));
        setCheckoutDate(convertDateFormat(docSnap.data().LodgingCheckoutDate));
        setCheckinTime(
          convertTo12HourFormat(docSnap.data().LodgingCheckinTime)
        );
        setCheckoutTime(
          convertTo12HourFormat(docSnap.data().LodgingCheckoutTime)
        );
      }
    } catch (err) {
      alert(err);
    }
  };

  const fetchCalendarData = async () => {
    const docCollection = query(
      collection(db, "plans", currentSelectedPlan, "calendar")
    );
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          Id: doc.id,
          Subject: doc.data().Subject,
          Location: doc.data().Location,
          Description: doc.data().Description,
          StartTime: doc.data().StartTime.toDate(),
          EndTime: doc.data().EndTime.toDate(),
          IsAllDay: doc.data().IsAllDay,
          RecurrenceRule: doc.data().RecurrenceRule,
          RecurrenceException: doc.data().RecurrenceException,
          Color: "red",
          EventColor: doc.data().EventColor,
        };
        list.push(data);
      });
      setPlanCalendar(list);
    });
  };

  const onChangeStartDate = (args) => {
    setStartDate(args.target.value);
    setCalendarViewComponents(args.target.value, endDate);
    updatePlanStartDate(currentSelectedPlan, args.target.value);
  };

  const onChangeEndDate = (args) => {
    setEndDate(args.target.value);
    setCalendarViewComponents(startDate, args.target.value);
    updatePlanEndDate(currentSelectedPlan, args.target.value);
  };

  const onChangeDestination = (args) => {
    setDestination(args.target.value);
    updatePlanDestination(currentSelectedPlan, args.target.value);
  };

  const setCalendarViewComponents = (startDate, endDate) => {
    if (startDate === endDate) {
      setCalendarView("Day");
    } else {
      setCalendarView("Week");
    }
    setSelectedStartDate(parseISO(startDate));
  };

  const addCalendarEvent = async (args) => {
    if (args.requestType === "eventCreated") {
      addToPlanCalendar(currentSelectedPlan, args.addedRecords[0]);
    } else if (args.requestType === "eventChanged") {
      updatePlanCalendar(currentSelectedPlan, args.changedRecords[0]);
    } else if (args.requestType === "eventRemoved") {
      deletePlanCalendar(currentSelectedPlan, args.deletedRecords[0].Id);
    }
  };

  const addEverydayCalendarEvent = async (item) => {
    const arrayOfDates = getDatesBetween(startDate, endDate);

    arrayOfDates.forEach((date) => {
      deletePlanCalendar(currentSelectedPlan, item.CalendarEvent + "_" + date);
      const StartDateTime = convertDateTimeString(date, item.StartTime);
      const EndDateTime = convertDateTimeString(date, item.EndTime);
      addToCalendar(
        currentSelectedPlan,
        StartDateTime,
        EndDateTime,
        item.CalendarEvent + "_" + date,
        item.CalendarEvent
      );
    });
    toast(
      item.CalendarEvent + " has been added to the itinerary for all days."
    );
  };

  const goToCalendarPage = () => {
    navigate("/plancalendar/");
  };

  const goToCalendarSetupPage = () => {
    navigate("/plansettings/");
  };

  const goToLodgingPage = () => {
    navigate("/lodgingandairfare/");
  };

  const handleAddCheckinToItinerary = () => {
    //Delete Current Check In
    deletePlanCalendar(currentSelectedPlan, "LodgingCheckin");

    //Checkin Date/Time
    const LocalDateCheckinStartTime = convertDateTimeString(
      plan.LodgingCheckinDate,
      plan.LodgingCheckinTime
    );
    const LocalDateCheckinEndTime = new Date(LocalDateCheckinStartTime);
    LocalDateCheckinEndTime.setHours(LocalDateCheckinStartTime.getHours() + 1);

    addCheckinCalendar(
      currentSelectedPlan,
      LocalDateCheckinStartTime,
      LocalDateCheckinEndTime
    );

    toast("Added checkin to the itinerary.");
  };

  const handleAddCheckoutToItinerary = () => {
    //Delete Current Check Out
    deletePlanCalendar(currentSelectedPlan, "LodgingCheckout");

    //Checkout Date/Time
    const LocalDateCheckoutStartTime = convertDateTimeString(
      plan.LodgingCheckoutDate,
      plan.LodgingCheckoutTime
    );
    const LocalDateCheckoutEndTime = new Date(LocalDateCheckoutStartTime);
    LocalDateCheckoutEndTime.setHours(
      LocalDateCheckoutStartTime.getHours() + 1
    );

    addCheckoutCalendar(
      currentSelectedPlan,
      LocalDateCheckoutStartTime,
      LocalDateCheckoutEndTime
    );

    toast("Added checkout to the itinerary.");
  };

  useEffect(() => {
    setPlanFromContext();
    fetchCalendarData();
    fetchCalendarSettingsData();
    return () => {
      setPlan([]);
      setPlanCalendar([]);
      setCalendarSettings([]);
    };
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Plan Summary" title={plan.Name} />
        <ToastContainer />
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          <TextField
            InputLabelProps={{
              shrink: true,
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
            margin="dense"
            required
            id="StartDate"
            label="Destination"
            type="text"
            fullWidth
            variant="filled"
            value={destination}
            onChange={onChangeDestination}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
          />
          <TextField
            InputLabelProps={{
              shrink: true,
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
            margin="dense"
            required
            id="StartDate"
            label="Start Date"
            type="date"
            fullWidth
            variant="filled"
            value={startDate}
            onChange={onChangeStartDate}
            sx={{ gridColumn: "span 2" }}
            InputProps={{
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
          />
          <TextField
            InputLabelProps={{
              shrink: true,
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
            margin="dense"
            required
            id="EndDate"
            label="End Date"
            type="date"
            fullWidth
            variant="filled"
            value={endDate}
            onChange={onChangeEndDate}
            sx={{ gridColumn: "span 2" }}
            InputProps={{
              className:
                "bg-white dark:text-gray-200 dark:bg-secondary-dark-bg",
            }}
          />
        </Box>
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
              onClick={goToCalendarSetupPage}
            >
              <p className="text-xl font-semibold">Everyday Calendar Events</p>
            </button>
          </div>
          <div className="mt-5 w-72 md:w-400">
            {calendarSettings.map((item) => (
              <div key={item.id} className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    style={{
                      color: "#03C9D7",
                      backgroundColor: "#E5FAFB",
                    }}
                    className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
                    onClick={() => {
                      addEverydayCalendarEvent(item);
                    }}
                  >
                    <IoIosAddCircle />
                  </button>
                  <div>
                    <p className="text-md font-semibold">
                      {item.CalendarEvent}
                    </p>
                  </div>
                </div>
                <p>
                  {item.StartTimeFormatted} - {item.EndTimeFormatted}
                </p>
              </div>
            ))}
          </div>
          {enableLodging && (
            <div>
              <div className="flex justify-between items-center gap-2 mt-5">
                <button
                  type="button"
                  className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
                  onClick={goToLodgingPage}
                >
                  <p className="text-xl font-semibold">Lodging</p>
                </button>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    style={{
                      color: "#03C9D7",
                      backgroundColor: "#E5FAFB",
                    }}
                    className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
                    onClick={handleAddCheckinToItinerary}
                  >
                    <IoIosAddCircle />
                  </button>
                  <div>
                    <p className="text-md font-semibold">Checkin</p>
                    <p className="text-md font-semibold">{checkinDate}</p>
                  </div>
                </div>
                <p>{checkinTime}</p>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    style={{
                      color: "#03C9D7",
                      backgroundColor: "#E5FAFB",
                    }}
                    className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
                    onClick={handleAddCheckoutToItinerary}
                  >
                    <IoIosAddCircle />
                  </button>
                  <div>
                    <p className="text-md font-semibold">Checkout</p>
                    <p className="text-md font-semibold">{checkoutDate}</p>
                  </div>
                </div>
                <p>{checkoutTime}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-96 md:w-800">
          <div className="flex justify-between items-center gap-2 mb-10">
            <button
              type="button"
              className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
              onClick={goToCalendarPage}
            >
              <p className="text-xl font-semibold">Calendar</p>
            </button>
          </div>
          <ScheduleComponent
            currentView={calendarView}
            height="650px"
            eventSettings={{ dataSource: planCalendar }}
            actionComplete={addCalendarEvent}
            selectedDate={selectedStartDate || new Date()}
          >
            <Inject
              services={[
                Day,
                Week,
                WorkWeek,
                Month,
                Agenda,
                Resize,
                DragAndDrop,
              ]}
            />
          </ScheduleComponent>
        </div>
      </div>
    </>
  );
};

export default PlanSummary;
