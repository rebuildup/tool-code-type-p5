import { ANIMATION_CONFIG, CANVAS_CONFIG } from "../lib/config";

export interface AppConfig {
	width: number;
	height: number;
	fontSize: number;
	lineHeight: number;
	fps: number;
	duration: number;
	language: string;
	backgroundColor: { r: number; g: number; b: number };
	backgroundTransparent: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
	width: CANVAS_CONFIG.WIDTH,
	height: CANVAS_CONFIG.HEIGHT,
	fontSize: 14,
	lineHeight: 18,
	fps: ANIMATION_CONFIG.FPS,
	duration: ANIMATION_CONFIG.FRAME_COUNT / ANIMATION_CONFIG.FPS,
	language: "rust",
	backgroundColor: { r: 0, g: 0, b: 0 },
	backgroundTransparent: CANVAS_CONFIG.BACKGROUND_COLOR[3] === 0,
};

export const LANGUAGES: Array<{ value: string; label: string }> = [
	{ value: "rust", label: "Rust" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "python", label: "Python" },
	{ value: "cpp", label: "C++" },
	{ value: "html", label: "HTML" },
	{ value: "css", label: "CSS" },
	{ value: "java", label: "Java" },
	{ value: "go", label: "Go" },
];
