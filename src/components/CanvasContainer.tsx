"use client";

import { forwardRef } from "react";
import { LoadingOverlay } from "./LoadingOverlay";

interface CanvasContainerProps {
	isLoaded: boolean;
	height: number;
}

export const CanvasContainer = forwardRef<HTMLDivElement, CanvasContainerProps>(
	function CanvasContainer({ isLoaded, height }, ref) {
		return (
			<div
				ref={ref}
				style={{
					border: "1px solid #ccc",
					minHeight: `${height}px`,
					position: "relative",
					overflow: "hidden",
				}}
			>
				{!isLoaded && <LoadingOverlay />}
			</div>
		);
	},
);
