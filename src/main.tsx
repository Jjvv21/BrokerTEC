import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // ✅ Tailwind se carga aquí
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";

// Crear el punto de entrada React
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
