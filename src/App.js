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
                <HomeTemplate page="BIGDAWGSDRAFTCOMMANDCENTER" />
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
            path="/league/:leagueid"
            element={
              <PrivateRoute>
                <HomeTemplate page="LEAGUE" />
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
            path="/sleepers"
            element={
              <PrivateRoute>
                <HomeTemplate page="SLEEPERS" />
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
          {/* NEW */}
          <Route
            path="/bigdawgsdraft/commandcenter"
            element={
              <PrivateRoute>
                <HomeTemplate page="BIGDAWGSDRAFTCOMMANDCENTER" />
              </PrivateRoute>
            }
          />
          <Route
            path="/bigdawgsdraft/teams"
            element={
              <PrivateRoute>
                <HomeTemplate page="BIGDAWGSTEAMS" />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/players/quarterbacks/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="QBDETAILS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/players/runningbacks/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="RBDETAILS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/players/tightends/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="TEDETAILS" />
              </PrivateRoute>
            }
          />
          <Route
            path="/players/widereceivers/details/:id"
            element={
              <PrivateRoute>
                <HomeTemplate page="WRDETAILS" />
              </PrivateRoute>
            }
          />
          {/* NEW */}

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
