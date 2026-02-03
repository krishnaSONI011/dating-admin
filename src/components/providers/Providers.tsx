"use client";

import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { store } from "../../../redux/store";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SidebarProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </SidebarProvider>
      </ThemeProvider>
    </Provider>
  );
}
