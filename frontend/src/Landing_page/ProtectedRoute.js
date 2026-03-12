import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "./auth";

export default function ProtectedRoute({ children, lessonKey = "" }) {
  const location = useLocation();
  const loggedIn = auth.isLoggedIn();

  if (!loggedIn) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
