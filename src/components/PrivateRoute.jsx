// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Si no hay usuario, redirige al login
  if (!user) return <Navigate to="/login" replace />;

  // Si sí hay sesión, muestra el contenido protegido
  return children;
};

export default PrivateRoute;
