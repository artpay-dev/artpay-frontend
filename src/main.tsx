import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./tailwind.css"
import "./App.scss";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
