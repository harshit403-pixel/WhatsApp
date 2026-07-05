import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";

import { store } from "./app.store.js";
import router from "./app.route.jsx";
import AuthProvider from "../features/shared/providers/AuthProvider.jsx";

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          closeButton
          richColors
          toastOptions={{
            classNames: {
              toast:
                "rounded-2xl border border-white/10 bg-[rgba(9,9,11,0.94)] text-white shadow-2xl backdrop-blur-xl",
              title: "text-sm font-semibold",
              description: "text-xs text-zinc-400",
            },
          }}
        />
      </AuthProvider>
    </Provider>
  );
};

export default App;
