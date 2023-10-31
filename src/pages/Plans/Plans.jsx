import React, { useState, useEffect } from "react";
import { BsCurrencyDollar } from "react-icons/bs";

import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

//DATA
import { Header } from "../../components";

import { useStateContext } from "../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import PlanComponent from "./PlanComponent";
import NewPlanModal from "../../modals/NewPlanModal";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const { currentColor } = useStateContext();

  const fetchData = async () => {
    const docCollection = query(collection(db, "plans"));
    onSnapshot(docCollection, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        var data = {
          id: doc.id,
          Name: doc.data().Name,
          Type: doc.data().Type,
          SubType: doc.data().SubType,
          StartDate: doc.data().StartDate,
          EndDate: doc.data().EndDate
        };
        list.push(data);
      });
      setPlans(list);
    });
  };

  useEffect(() => {
    fetchData();
    return () => {
      setPlans([]);
    };
  }, []);

  return (
    <>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Home" title="Plans" />
        <NewPlanModal />         
      </div>

      
        <div className="flex flex-wrap justify-center">
          {plans.map((plan) => (
            <PlanComponent plan={plan} />
          ))}
        </div>
    </>
  );
};

export default Plans;
