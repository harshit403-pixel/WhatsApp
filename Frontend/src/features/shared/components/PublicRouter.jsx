import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import AppShellLoader from "./AppShellLoader";

const PublicRouter = ({ children }) => {
  const { user, isAuthChecked } = useSelector(
    (state) => state.auth
  );

  // Wait until authentication check completes
  if (!isAuthChecked) {
    return (
      <AppShellLoader
        title="Opening authentication"
        description="Checking whether we should keep you signed in or return you to your workspace."
      />
    );
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
