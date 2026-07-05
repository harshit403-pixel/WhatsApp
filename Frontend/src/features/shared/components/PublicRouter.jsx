import React from "react";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";

const PublicRouter = ({ children }) => {
  const { user, isAuthChecked } = useSelector(
    (state) => state.auth
  );

  // Wait until authentication check completes
  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  // User is already logged in
  // Don't allow access to login/register pages
  if (user) {
    return <Navigate to="/" replace />;
  }

  // User is not logged in
  return children;
};

export default PublicRouter;