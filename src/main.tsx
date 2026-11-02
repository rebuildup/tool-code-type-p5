import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CodeTypeP5App from "./CodeTypeP5App";

const container = document.getElementById("root");

if (!container) {
	throw new Error("Code Type p5: missing #root element");
}

createRoot(container).render(
	<StrictMode>
		<CodeTypeP5App />
	</StrictMode>,
);
