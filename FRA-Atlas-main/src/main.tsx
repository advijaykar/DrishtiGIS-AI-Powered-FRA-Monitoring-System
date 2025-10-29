import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(<App />);
