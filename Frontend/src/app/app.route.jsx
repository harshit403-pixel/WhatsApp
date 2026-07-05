import { createBrowserRouter } from "react-router";
import Protected from "../features/shared/components/Protected";
import PublicRouter from "../features/shared/components/PublicRouter";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Home from "../features/chats/pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRouter>
        <Login />
      </PublicRouter>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRouter>
        <Register />
      </PublicRouter>
    ),
  },
]);


export default router;