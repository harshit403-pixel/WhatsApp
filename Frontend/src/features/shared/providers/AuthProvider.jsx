import { useEffect } from "react";
import useAuth from "../../auth/hooks/useAuth";


const AuthProvider = ({ children }) => {
  const { fetchMe } = useAuth();

  useEffect(() => {
    fetchMe();
    // We only want to restore the session once when the app boots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

export default AuthProvider;
