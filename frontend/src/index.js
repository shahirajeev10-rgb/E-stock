import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Homepage from "./Landing_page/Explore/Homepage";
import Signup from "./Landing_page/signup/Signup";
import Dashboard from "./Landing_page/Dashboard";
import ProtectedRoute from "./Landing_page/ProtectedRoute";
import { auth } from "./Landing_page/auth";
import Aboutpage from "./Landing_page/About/Aboutpage";
import ForgotPassword from "./Landing_page/About/ForgotPassword";

import FundamentalsLesson from "./Landing_page/Lesson/FundamentalsLesson";
import PriceMovementLesson from "./Landing_page/Lesson/PriceMovementLesson";
import PriceMovement from "./Landing_page/Lesson/PriceMovement";
import PortfolioLesson from "./Landing_page/Lesson/PortfolioLesson";
import RiskManagementLesson from "./Landing_page/Lesson/RiskManagementLesson";
import TradingPractice from "./Landing_page/Lesson/TradingPractice";
import Supportpage from "./Landing_page/Support/Supportpage";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
      }, 0);
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return null;
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);

function AppRouter() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      await auth.hydrate();
      if (!active) return;
      setReady(true);
    }

    bootstrapAuth();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  const loggedIn = auth.isLoggedIn();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/dashboard" replace /> : <Homepage />}
        />

        <Route path="/home" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/support" element={<Supportpage />} />
        <Route path="/about" element={<Aboutpage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lessons/fundamentals"
          element={
            <ProtectedRoute lessonKey="fundamentals">
              <FundamentalsLesson />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lessons/price-movement"
          element={
            <ProtectedRoute lessonKey="price-movement">
              <PriceMovementLesson />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lessons/profit-loss-portfolio"
          element={
            <ProtectedRoute lessonKey="profit-loss-portfolio">
              <PortfolioLesson />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lessons/risk-management"
          element={
            <ProtectedRoute lessonKey="risk-management">
              <RiskManagementLesson />
            </ProtectedRoute>
          }
        />

        <Route
          path="/demo/price-movement"
          element={
            <ProtectedRoute>
              <PriceMovement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice/simulator"
          element={
            <ProtectedRoute lessonKey="trading-simulator">
              <TradingPractice />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
