import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Registration, ForgotPassword, HomeTemplate } from "./pages";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./PrivateRoute.js";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* DASHBOARD */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomeTemplate page="AUCTIONDRAFT" />
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomeTemplate page="HOME" />
              </PrivateRoute>
            }
          />
          <Route
            path="/commandcenter"
            element={
              <PrivateRoute>
                <HomeTemplate page="COMMANDCENTER" />
              </PrivateRoute>
            }
          />
          <Route
            path="/auctiondraft/commandcenter"
            element={
              <PrivateRoute>
                <HomeTemplate page="AUCTIONDRAFT" />
              </PrivateRoute>
            }
          />
          <Route
            path="/auctiondraft/teams"
            element={
              <PrivateRoute>
                <HomeTemplate page="AUCTIONDRAFTTEAMS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/snakedraft"
            element={
              <PrivateRoute>
                <HomeTemplate page="SNAKEDRAFT" />
              </PrivateRoute>
            }
          />
          <Route
            path="/league/:leagueid"
            element={
              <PrivateRoute>
                <HomeTemplate page="LEAGUE" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/quarterbacks"
            element={
              <PrivateRoute>
                <HomeTemplate page="SCOUTINGQBS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/runningbacks"
            element={
              <PrivateRoute>
                <HomeTemplate page="SCOUTINGRBS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/tightends"
            element={
              <PrivateRoute>
                <HomeTemplate page="SCOUTINGTES" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/widereceivers"
            element={
              <PrivateRoute>
                <HomeTemplate page="SCOUTINGWRS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/quarterbacks/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="QBDETAILS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/runningbacks/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="RBDETAILS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/tightends/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="TEDETAILS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/scouting/widereceivers/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="WRDETAILS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/apps/compareplayers"
            element={
              <PrivateRoute>
                <HomeTemplate page="COMPAREPLAYERS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/tiers/qb"
            element={
              <PrivateRoute>
                <HomeTemplate page="QBTIERS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/tiers/rb"
            element={
              <PrivateRoute>
                <HomeTemplate page="RBTIERS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/tiers/te"
            element={
              <PrivateRoute>
                <HomeTemplate page="TETIERS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/tiers/wr"
            element={
              <PrivateRoute>
                <HomeTemplate page="WRTIERS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/comparelineups"
            element={
              <PrivateRoute>
                <HomeTemplate page="COMPARELINEUPS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <HomeTemplate page="SETTINGS" />
              </PrivateRoute>
            }
          />
          {/* PLAYERS */}
          <Route
            path="/players/quarterbacks"
            element={
              <PrivateRoute>
                <HomeTemplate page="QUARTERBACKS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/players/runningbacks"
            element={
              <PrivateRoute>
                <HomeTemplate page="RUNNINGBACKS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/players/tightends"
            element={
              <PrivateRoute>
                <HomeTemplate page="TIGHTENDS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/players/widereceivers"
            element={
              <PrivateRoute>
                <HomeTemplate page="WIDERECEIVERS" />
              </PrivateRoute>
            }
          />
          {/* PLAYERS */}
          
          {/* AUTH */}
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/hometemplate" element={<HomeTemplate />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
