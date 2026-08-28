"use client";

import JSZip from "jszip";
import p5 from "p5";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { AppConfig } from "../components/types";
import { EditorManager } from "../lib/001_Editors/001_EditorManager";
import { setupAnimationRenderer } from "../lib/001_Editors/002_AnimationRenderer";
import { CANVAS_CONFIG } from "../lib/config";

declare global {
	interface Window {
		p5: any;
		animationFunctions: any;
		JSZip: any;
	}
}

interface UseP5LifecycleArgs {
	containerRef: React.RefObject<HTMLDivElement | null>;
	setCode: Dispatch<SetStateAction<string>>;
	setConfig: Dispatch<SetStateAction<AppConfig>>;
	setIsPlaying: Dispatch<SetStateAction<boolean>>;
	setIsLoaded: Dispatch<SetStateAction<boolean>>;
}

export function useP5Lifecycle({
	containerRef,
	setCode,
	setConfig,
	setIsPlaying,
	setIsLoaded,
}: UseP5LifecycleArgs) {
	const editorManagerRef = useRef<EditorManager | null>(null);
	const p5InstanceRef = useRef<any>(null);
	const isInitializingRef = useRef<boolean>(false);

	const loadInitialData = useCallback(
		(editorManager: EditorManager) => {
			const animations = window.animationFunctions?.getAnimations();
			if (animations && animations.length > 0) {
				const codescroll = animations[0];
				if (typeof codescroll.getCode === "function") {
					setCode(codescroll.getCode());
				}
				if (typeof codescroll.getConfig === "function") {
					const animConfig = codescroll.getConfig();
					setConfig((prev) => ({
						...prev,
						fontSize: animConfig.fontSize || prev.fontSize,
						lineHeight: animConfig.lineHeight || prev.lineHeight,
						height: animConfig.canvasHeight || prev.height,
						language: animConfig.language || prev.language,
					}));
				}
			}

			const fps = editorManager.getFPS();
			const frameCount = editorManager.getFrameCount();
			setConfig((prev) => ({
				...prev,
				fps: fps || prev.fps,
				duration:
					frameCount && fps
						? parseFloat((frameCount / fps).toFixed(1))
						: prev.duration,
			}));

			const canvas = document.querySelector("canvas");
			if (canvas && canvas.width && canvas.height) {
				setConfig((prev) => ({
					...prev,
					width: canvas.width,
					height: canvas.height,
				}));
			}

			const bgColor = CANVAS_CONFIG.BACKGROUND_COLOR;
			setConfig((prev) => ({
				...prev,
				backgroundColor: { r: bgColor[0], g: bgColor[1], b: bgColor[2] },
				backgroundTransparent: bgColor[3] === 0,
			}));

			editorManager.setEvents({
				onPlaybackChange: (playing: boolean) => setIsPlaying(playing),
			});
		},
		[setCode, setConfig, setIsPlaying],
	);

	useEffect(() => {
		if ((window as any).__p5Initializing) return;
		(window as any).__p5Initializing = true;
		isInitializingRef.current = true;

		const initP5 = () => {
			if (!containerRef.current) {
				setTimeout(initP5, 50);
				return;
			}

			if (p5InstanceRef.current) {
				try {
					p5InstanceRef.current.remove();
				} catch (e) {
					console.warn(e);
				}
				p5InstanceRef.current = null;
			}

			const existingCanvases = document.querySelectorAll("canvas");
			existingCanvases.forEach((canvas) => canvas.remove());

			if (
				(window as any).p5Instances &&
				Array.isArray((window as any).p5Instances)
			) {
				(window as any).p5Instances.forEach((instance: any) => {
					try {
						instance.remove();
					} catch (e) {
						console.warn(e);
					}
				});
				(window as any).p5Instances = [];
			}

			let canvasContainer = document.getElementById("canvas-container");
			if (!canvasContainer) {
				canvasContainer = document.createElement("div");
				canvasContainer.id = "canvas-container";
				containerRef.current.appendChild(canvasContainer);
			}

			const editorManager = new EditorManager();
			editorManagerRef.current = editorManager;

			if (typeof window !== "undefined") {
				(window as any).p5 = p5;
				(window as any).JSZip = JSZip;
			}

			let p5Instance: any;
			try {
				p5Instance = setupAnimationRenderer(editorManager, canvasContainer);
			} catch (error) {
				console.error("Error setting up animation renderer:", error);
				setIsLoaded(true);
				return;
			}

			if (p5Instance) {
				p5InstanceRef.current = p5Instance;
			}

			setTimeout(() => {
				loadInitialData(editorManager);
				setIsLoaded(true);
			}, 1000);
		};

		initP5();

		return () => {
			const timeoutId = setTimeout(() => {
				(window as any).__p5Initializing = false;
				isInitializingRef.current = false;
			}, 100);

			if (p5InstanceRef.current) {
				try {
					p5InstanceRef.current.remove();
				} catch (e) {
					console.warn(e);
				}
				p5InstanceRef.current = null;
			}
			if ((window as any).animationFunctions) {
				delete (window as any).animationFunctions;
			}
			const canvases = document.querySelectorAll("#canvas-container canvas");
			canvases.forEach((canvas) => canvas.remove());
			if ((window as any).p5Instances) {
				(window as any).p5Instances.forEach((instance: any) => {
					try {
						instance.remove();
					} catch (e) {
						console.warn(e);
					}
				});
				delete (window as any).p5Instances;
			}

			clearTimeout(timeoutId);
		};
	}, [containerRef, loadInitialData, setIsLoaded]);

	return { editorManagerRef, p5InstanceRef, isInitializingRef };
}
