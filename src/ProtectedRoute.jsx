// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();

  let tokenKey;
  let loginPath;

  if (role === "admin") {
    tokenKey = "adminToken";
    loginPath = "/AdminLogin";
  } else if (role === "citizen") {
    tokenKey = "citizenToken";
    loginPath = "/Account"; // or /CitizenLogin kung separate
  } else {
    // fallback para safe
    tokenKey = null;
    loginPath = "/";
  }

  const token = tokenKey ? localStorage.getItem(tokenKey) : null;

  if (!token) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
