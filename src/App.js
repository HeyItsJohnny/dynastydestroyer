import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Registration, ForgotPassword, HomeTemplate } from "./pages";
import { AuthProvider } from "./contexts/AuthContext";
//import PrivateRoute from "./PrivateRoute";
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
                <HomeTemplate page="HOME" />
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
            path="/newplan"
            element={
              <PrivateRoute>
                <HomeTemplate page="NEWPLAN" />
              </PrivateRoute>
            }
          />

          <Route
            path="/plans"
            element={
              <PrivateRoute>
                <HomeTemplate page="PLANS" />
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
