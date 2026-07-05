import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import AppShellLoader from "./AppShellLoader";

const Protected = ({ children }) => {
  const { user, isAuthChecked } = useSelector(
    (state) => state.auth
  );

  if (!isAuthChecked) {
    return <AppShellLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
