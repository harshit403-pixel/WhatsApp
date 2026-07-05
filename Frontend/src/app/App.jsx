import React from "react";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";

import { store } from "./app.store.js";
import router from "./app.route.jsx";
import AuthProvider from "../features/shared/providers/AuthProvider.jsx";


const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  );
};

export default App;