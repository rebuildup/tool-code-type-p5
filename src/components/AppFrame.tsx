import type { ReactNode } from "react";

interface AppFrameProps {
	title: string;
	children: ReactNode;
}

/**
 * Standalone frame for the embedded app.
 *
 * The previous implementation imported the host application's
 * `RawDOMContainer` from a sibling checkout
 * (`../../../../src/components/tools-ui/RawDOMContainer`). That path only
 * exists inside a parent workspace, so a standalone build could not
 * resolve it, and its breadcrumb links point at host routes that do not
 * exist inside an iframe. This component keeps the same visual structure
 * — full-height surface, heading, content column — and owns it here.
 */
export function AppFrame({ title, children }: AppFrameProps) {
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				overflowY: "auto",
				background: "#fff",
				color: "#000",
				colorScheme: "light",
				padding: "2rem",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "4rem" }}
			>
				<h1
					style={{
						borderBottom: "1px solid #ccc",
						paddingBottom: "10px",
						marginBottom: "20px",
						fontSize: "1.5rem",
						fontWeight: "normal",
					}}
				>
					{title}
				</h1>
				{children}
			</div>
		</div>
	);
}
