import React, { createContext, useContext, useState, useEffect } from "react";

//DATA
import { db  } from "../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
  deleteDoc,
  updateDoc,
  addDoc
} from "firebase/firestore";

const StateContext = createContext();

const initialState = {
  chat: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(true); 
  const [isClicked, setIsClicked] = useState(initialState);
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState('#03C9D7');
  const [currentMode, setCurrentMode] = useState('Dark');
  const [currentSelectedPlan, setCurrentSelectedPlan] = useState('');
  const [currentPlanIsSet, setCurrentPlanIsSet] = useState(false);
  const [enableAirfare, setEnableAirfare] = useState(false);
  const [enableLodging, setEnableLodging] = useState(false);
  const [enableToDos, setEnableToDos] = useState(false);
  const [themeSettings, setThemeSettings] = useState(false);
  const [userSettings, setUserSettings] = useState(false);

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem('themeMode', e.target.value);
    setThemeSettings(false);
  }

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem('colorMode', color);
    setThemeSettings(false);
  }

  const setPlan = (plan) => {
    setCurrentSelectedPlan(plan);
    //localStorage.setItem('plan', plan);
  }

  const handleClick = (clicked) => {
    setIsClicked({ ...initialState, [clicked]: true});
  } 

  const handleExitClick = (clicked) => {
    setIsClicked({ ...initialState, [clicked]: false});
  } 

  const fetchPlansData = async () => {
    if (currentSelectedPlan !== '') {
      const docCollection = query(
        collection(db, "plans", currentSelectedPlan, "calendar")
      );
      onSnapshot(docCollection, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          setEnableAirfare(doc.data().EnableAirfare);
          setEnableLodging(doc.data().EnableLodging);
          setEnableToDos(doc.data().EnableToDos);
        });
      });
    }
    
  };

  useEffect(() => {
    fetchPlansData();
  }, []);

  return (
    <StateContext.Provider value={{ 
        activeMenu, 
        setActiveMenu,
        isClicked,
        setIsClicked,
        handleClick,
        screenSize,
        setScreenSize,
        currentColor,
        currentMode,
        setMode,
        setColor,
        themeSettings,
        setThemeSettings,
        userSettings,
        setUserSettings,
        handleExitClick,
        setCurrentSelectedPlan,
        currentSelectedPlan,
        setPlan,
        currentPlanIsSet,
        setCurrentPlanIsSet,
        enableAirfare,
        setEnableAirfare,
        enableLodging,
        setEnableLodging,
        enableToDos,
        setEnableToDos
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
