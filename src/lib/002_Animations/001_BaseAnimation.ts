import { ResourceManager } from "../003_Resources/001_ResourceManager";

export interface DrawingContext {
	width: number;
	height: number;
	noStroke: () => void;
	stroke: (...args: any[]) => void;
	strokeWeight: (weight: number) => void;
	fill: (...args: any[]) => void;
	ellipse: (x: number, y: number, w: number, h?: number) => void;
	rect: (x: number, y: number, w: number, h: number) => void;
	triangle: (
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		x3: number,
		y3: number,
	) => void;
	push: () => void;
	pop: () => void;
	background: (...args: any[]) => void;
	clear: () => void;
	imageMode: (mode: any) => void;
	image: (
		img: any,
		x: number,
		y: number,
		width?: number,
		height?: number,
	) => void;
	tint: (...args: any[]) => void;
	text: (str: string, x: number, y: number) => void;
	textAlign: (alignX: any, alignY?: any) => void;
	textSize: (size: number) => void;
	get: () => any;
	beginShape: () => void;
	endShape: (mode?: any) => void;
	vertex: (x: number, y: number) => void;
	CENTER?: any;
	CLOSE?: any;
	translate: (x: number, y: number, z?: number) => void;
	rotate: (angle: number) => void;
	scale: (x: number, y?: number, z?: number) => void;
}

export abstract class BaseAnimation {
	protected p5: any;
	protected editorManager: any;
	protected resourceManager: ResourceManager;

	constructor(p5Instance: any, editorManager: any) {
		this.p5 = p5Instance;
		this.editorManager = editorManager;
		this.resourceManager = ResourceManager.getInstance();
	}

	draw(frameIndex: number): void {
		this.implementDrawing(this.p5, frameIndex);
	}

	drawToBuffer(buffer: any, frameIndex: number): void {
		this.implementDrawing(buffer, frameIndex);
	}

	protected getNormalizedTime(frameIndex: number): number {
		return frameIndex / this.editorManager.getFrameCount();
	}

	protected getImage(id: string): any {
		return this.resourceManager.getImage(id);
	}

	protected getSound(id: string): any {
		return this.resourceManager.getSound(id);
	}

	protected colorCycle(
		t: number,
		phaseOffset: number = 0,
		amplitude: number = 127,
		center: number = 128,
	): number {
		return center + amplitude * Math.sin(t * Math.PI * 2 + phaseOffset);
	}

	protected orbit(
		t: number,
		centerX: number,
		centerY: number,
		radiusX: number,
		radiusY: number = radiusX,
		phaseOffset: number = 0,
	): { x: number; y: number } {
		return {
			x: centerX + radiusX * Math.cos(t * Math.PI * 2 + phaseOffset),
			y: centerY + radiusY * Math.sin(t * Math.PI * 2 + phaseOffset),
		};
	}

	protected easeInOut(t: number): number {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	protected easeIn(t: number): number {
		return t * t;
	}

	protected easeOut(t: number): number {
		return t * (2 - t);
	}

	protected oscillate(
		t: number,
		frequency: number = 1,
		amplitude: number = 1,
	): number {
		return amplitude * Math.sin(t * Math.PI * 2 * frequency);
	}

	protected regularPolygon(
		context: DrawingContext,
		x: number,
		y: number,
		radius: number,
		sides: number,
		rotation: number = 0,
	): void {
		context.push();
		context.beginShape();
		for (let i = 0; i < sides; i++) {
			const angle = rotation + (i * Math.PI * 2) / sides;
			const vx = x + radius * Math.cos(angle);
			const vy = y + radius * Math.sin(angle);
			context.vertex(vx, vy);
		}
		context.endShape(context.CLOSE);
		context.pop();
	}

	protected lerp(start: number, end: number, amt: number): number {
		return start + (end - start) * amt;
	}

	protected bounce(t: number): number {
		const b = 4;
		return Math.abs(Math.sin(t * Math.PI * b) * (1 - t));
	}

	protected curve3D(
		t: number,
		radius: number = 1,
		height: number = 0.5,
		twist: number = 3,
	): { x: number; y: number; z: number } {
		return {
			x: radius * Math.cos(t * Math.PI * 2),
			y: radius * Math.sin(t * Math.PI * 2),
			z: height * Math.sin(t * Math.PI * 2 * twist),
		};
	}

	protected abstract implementDrawing(
		context: DrawingContext,
		frameIndex: number,
	): void;
}
