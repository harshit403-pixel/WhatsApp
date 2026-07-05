import { useEffect } from "react";
import useAuth from "../../auth/hooks/useAuth";


const AuthProvider = ({ children }) => {
  const { fetchMe } = useAuth();

  useEffect(() => {
    fetchMe();
  }, []);

  return children;
};

export default AuthProvider;