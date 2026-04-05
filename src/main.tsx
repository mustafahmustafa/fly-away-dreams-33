import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { resetStaleServiceWorkers } from "./lib/resetStaleServiceWorkers";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

resetStaleServiceWorkers().finally(() => {
  createRoot(rootElement).render(<App />);
});
