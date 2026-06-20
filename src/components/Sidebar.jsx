import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { SiShopware } from "react-icons/si";
import { MdOutlineCancel } from "react-icons/md";
import { AiOutlineApartment } from "react-icons/ai";
import { GoDashboard } from "react-icons/go";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

import { links } from "../components/Settings";
import { useStateContext } from "../contexts/ContextProvider";

//Firebase
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, query, collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

const Sidebar = () => {
  const { activeMenu, setActiveMenu, currentColor } = useStateContext();
  const [sleeperLeagues, setSleeperLeagues] = useState([]);
  const { currentUser } = useAuth();

  const handleCloseSizeBar = () => {
    if (activeMenu) {
      setActiveMenu(false);
    }
  };


  const activeLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2";
  const normalLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2";
  const activeChildLink =
    "flex items-center gap-4 pl-8 pt-2 pb-2 rounded-lg text-white text-sm m-2";
  const normalChildLink =
    "flex items-center gap-4 pl-8 pt-2 pb-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2";

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link
              to="/"
              onClick={handleCloseSizeBar}
              className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
            >
              <SiShopware /> <span>Dynasty Destroyer</span>
            </Link>
            <TooltipComponent content="Menu" position="BottomCenter">
              <button
                type="button"
                onClick={() => {
                  setActiveMenu((prevActiveMenu) => !prevActiveMenu);
                }}
                className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 blockmd:hidden"
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>
          <div className="mt-10">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-400 m-3 mt-4 uppercase">{item.title}</p>
                {item.links.map((link) => (
                  <React.Fragment key={link.name}>
                    <NavLink
                      to={`/${link.linktoname}`}
                      onClick={handleCloseSizeBar}
                      style={({ isActive }) => ({
                        backgroundColor:
                          isActive && !link.children ? currentColor : "",
                      })}
                      className={({ isActive }) =>
                        isActive && !link.children ? activeLink : normalLink
                      }
                    >
                      {link.icon}
                      <span className="capitalize">{link.name}</span>
                    </NavLink>
                    {link.children?.map((childLink) => (
                      <NavLink
                        to={`/${childLink.linktoname}`}
                        key={childLink.name}
                        onClick={handleCloseSizeBar}
                        style={({ isActive }) => ({
                          backgroundColor: isActive ? currentColor : "",
                        })}
                        className={({ isActive }) =>
                          isActive ? activeChildLink : normalChildLink
                        }
                      >
                        {childLink.icon}
                        <span className="capitalize">{childLink.name}</span>
                      </NavLink>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
