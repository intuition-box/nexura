import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to capture runtime errors (will print stack traces to terminal/devtools)
if (typeof window !== "undefined") {
	window.addEventListener("error", (ev) => {
		// ev.error may be null for some runtime errors, include message and stack when available
		// eslint-disable-next-line no-console
		console.error("Global window error:", ev.error ?? ev.message ?? ev);
	});

	window.addEventListener("unhandledrejection", (ev) => {
		// eslint-disable-next-line no-console
		console.error("Unhandled promise rejection:", ev.reason);
	});
}

createRoot(document.getElementById("root")!).render(<App />);
