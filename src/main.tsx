import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { bootstrapAnalytics } from "@/lib/analytics-bootstrap";
import "./index.css";

bootstrapAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID);

createRoot(document.getElementById("root")!).render(<App />);
