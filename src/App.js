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
                <HomeTemplate page="COMMANDCENTER" />
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
            path="/auctiondraft"
            element={
              <PrivateRoute>
                <HomeTemplate page="AUCTIONDRAFT" />
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
            path="/compareplayers"
            element={
              <PrivateRoute>
                <HomeTemplate page="COMPAREPLAYERS" />
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
