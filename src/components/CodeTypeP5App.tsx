"use client";

import { useCallback, useRef, useState } from "react";
import { RawDOMContainer } from "../../../../src/components/tools-ui/RawDOMContainer";
import { useP5Lifecycle } from "../hooks/useP5Lifecycle";
import { CanvasContainer } from "./CanvasContainer";
import { ConfigPanel } from "./ConfigPanel";
import { Controls } from "./Controls";
import { type AppConfig, DEFAULT_CONFIG } from "./types";

export default function CodeTypeP5App() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [code, setCode] = useState("");
	const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const { editorManagerRef } = useP5Lifecycle({
		containerRef,
		setCode,
		setConfig,
		setIsPlaying,
		setIsLoaded,
	});

	const togglePlayback = () => {
		if (!editorManagerRef.current) return;
		editorManagerRef.current.togglePlayback();
	};

	const handleExportZip = () => {
		if (!editorManagerRef.current) return;
		if (editorManagerRef.current.isEncodingActive()) return;
		editorManagerRef.current.setCurrentFrame(0);
		editorManagerRef.current.stopPlayback();
		editorManagerRef.current.startEncoding();
	};

	const handleApply = useCallback(() => {
		if (!editorManagerRef.current) return;
		const editorManager = editorManagerRef.current;

		if (window.animationFunctions?.resizeCanvas) {
			window.animationFunctions.resizeCanvas(config.width, config.height);
		}

		editorManager.setFPS(config.fps);
		editorManager.setFrameCount(Math.floor(config.fps * config.duration));

		const canvases = document.querySelectorAll("canvas");
		if (canvases.length > 1) {
			for (let i = 1; i < canvases.length; i++) canvases[i].remove();
		}

		if (window.animationFunctions?.setBackgroundColor) {
			const alpha = config.backgroundTransparent ? 0 : 255;
			window.animationFunctions.setBackgroundColor(
				config.backgroundColor.r,
				config.backgroundColor.g,
				config.backgroundColor.b,
				alpha,
			);
		}

		const animations = window.animationFunctions?.getAnimations();
		if (animations && animations.length > 0) {
			animations.forEach((anim: any) => {
				if (anim && typeof anim.updateCode === "function")
					anim.updateCode(code);
				if (anim && typeof anim.updateConfig === "function") {
					anim.updateConfig({
						fontSize: config.fontSize,
						lineHeight: config.lineHeight,
						canvasHeight: config.height,
						language: config.language,
					});
				}
			});
		}

		editorManager.setCurrentFrame(0);
	}, [config, code, editorManagerRef]);

	return (
		<RawDOMContainer
			title="Code Type p5"
			breadcrumbs={[
				{ label: "Home", href: "/" },
				{ label: "Tools", href: "/tools" },
				{ label: "Code Type p5" },
			]}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				<Controls
					isPlaying={isPlaying}
					isDrawerOpen={isDrawerOpen}
					onTogglePlayback={togglePlayback}
					onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
				/>
				<CanvasContainer
					ref={containerRef}
					isLoaded={isLoaded}
					height={config.height}
				/>
				{isDrawerOpen && (
					<ConfigPanel
						config={config}
						setConfig={setConfig}
						code={code}
						setCode={setCode}
						onApply={handleApply}
						onExportZip={handleExportZip}
					/>
				)}
			</div>
		</RawDOMContainer>
	);
}
