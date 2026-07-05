import { Navigate } from "react-router";
import { useSelector } from "react-redux";

const Protected = ({ children }) => {
  const { user, isAuthChecked } = useSelector(
    (state) => state.auth
  );

  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;