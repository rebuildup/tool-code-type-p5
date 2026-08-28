import { ANIMATION_CONFIG } from "../config";

export interface EditorEvents {
	onFrameChange?: (frame: number) => void;
	onPlaybackChange?: (isPlaying: boolean) => void;
	onEncodingStart?: () => void;
	onEncodingProgress?: (frame: number, total: number) => void;
	onEncodingComplete?: () => void;
}

export class EditorManager {
	private isPlaying: boolean = false;
	private currentFrame: number = 0;
	private keyframes: number[] = [0, 30, 60, 90];
	private currentKeyframeIndex: number = 0;

	private fps: number = ANIMATION_CONFIG.FPS;
	private frameCount: number = ANIMATION_CONFIG.FRAME_COUNT;

	private isEncoding: boolean = false;
	public events: EditorEvents = {};

	constructor(events?: EditorEvents) {
		if (events) {
			this.events = events;
		}
	}

	public setEvents(events: EditorEvents): void {
		this.events = { ...this.events, ...events };
	}

	public togglePlayback(): void {
		this.isPlaying = !this.isPlaying;
		this.updatePageTitle();
		if (this.events.onPlaybackChange) {
			this.events.onPlaybackChange(this.isPlaying);
		}
	}

	public stopPlayback(): void {
		if (this.isPlaying) {
			this.isPlaying = false;
			this.updatePageTitle();
			if (this.events.onPlaybackChange) {
				this.events.onPlaybackChange(this.isPlaying);
			}
		}
	}

	public isPlaybackActive(): boolean {
		return this.isPlaying;
	}

	public incrementFrame(): void {
		const oldFrame = this.currentFrame;
		this.currentFrame = (this.currentFrame + 1) % this.frameCount;
		this.updatePageTitle();

		// Notify when frame changes
		if (oldFrame !== this.currentFrame) {
			this.notifyFrameChange();
		}

		// Notify specifically when we loop back to the start
		if (this.currentFrame === 0 && oldFrame === this.frameCount - 1) {
			this.notifyFrameLoop();
		}
	}

	public previousFrame(): void {
		const oldFrame = this.currentFrame;
		this.currentFrame =
			(this.currentFrame - 1 + this.frameCount) % this.frameCount;
		this.updatePageTitle();

		if (oldFrame !== this.currentFrame) {
			this.notifyFrameChange();
		}
	}

	public nextFrame(): void {
		const oldFrame = this.currentFrame;
		this.currentFrame = (this.currentFrame + 1) % this.frameCount;
		this.updatePageTitle();

		if (oldFrame !== this.currentFrame) {
			this.notifyFrameChange();
		}
	}

	public getCurrentFrame(): number {
		return this.currentFrame;
	}

	public setCurrentFrame(frame: number): void {
		const newFrame = Math.max(0, Math.min(frame, this.frameCount - 1));
		if (newFrame !== this.currentFrame) {
			this.currentFrame = newFrame;
			this.updatePageTitle();
			this.notifyFrameChange();
		}
	}

	public previousKeyframe(): void {
		if (this.currentKeyframeIndex > 0) {
			this.currentKeyframeIndex--;
			this.setCurrentFrame(this.keyframes[this.currentKeyframeIndex]);
		}
	}

	public nextKeyframe(): void {
		if (this.currentKeyframeIndex < this.keyframes.length - 1) {
			this.currentKeyframeIndex++;
			this.setCurrentFrame(this.keyframes[this.currentKeyframeIndex]);
		}
	}

	public getCurrentKeyframe(): number {
		return this.keyframes[this.currentKeyframeIndex];
	}

	public setKeyframes(keyframes: number[]): void {
		this.keyframes = [...keyframes].sort((a, b) => a - b);
		this.updateCurrentKeyframeIndex();
	}

	public addKeyframe(frame: number): void {
		if (!this.keyframes.includes(frame)) {
			this.keyframes.push(frame);
			this.keyframes.sort((a, b) => a - b);
			this.updateCurrentKeyframeIndex();
		}
	}

	private updateCurrentKeyframeIndex(): void {
		let closestIndex = 0;
		let minDistance = Math.abs(this.keyframes[0] - this.currentFrame);

		for (let i = 1; i < this.keyframes.length; i++) {
			const distance = Math.abs(this.keyframes[i] - this.currentFrame);
			if (distance < minDistance) {
				minDistance = distance;
				closestIndex = i;
			}
		}

		this.currentKeyframeIndex = closestIndex;
	}

	public startEncoding(): void {
		this.isEncoding = true;
		console.log("Starting encoding...");

		if (this.events.onEncodingStart) {
			this.events.onEncodingStart();
		}
	}

	public isEncodingActive(): boolean {
		return this.isEncoding;
	}

	public setEncodingComplete(): void {
		this.isEncoding = false;
		console.log("Encoding complete!");

		if (this.events.onEncodingComplete) {
			this.events.onEncodingComplete();
		}
	}

	public setEncodingProgress(frame: number): void {
		const percentage = Math.floor((frame / this.frameCount) * 100);
		console.log(
			`Encoding: ${percentage}% (Frame: ${frame}/${this.frameCount})`,
		);
		this.updatePageTitle(frame);

		if (this.events.onEncodingProgress) {
			this.events.onEncodingProgress(frame, this.frameCount);
		}
	}

	private updatePageTitle(frame: number = this.currentFrame): void {
		document.title = this.isEncoding
			? `Encoding Frame: ${frame}`
			: `Frame: ${frame}`;
	}

	private notifyFrameChange(): void {
		if (this.events.onFrameChange) {
			this.events.onFrameChange(this.currentFrame);
		}
	}

	/**
	 * Called when animation loops back to the start
	 */
	private notifyFrameLoop(): void {
		// This could be extended with a specific frame loop event if needed
		console.log("Animation loop completed");
	}

	public getFrameCount(): number {
		return this.frameCount;
	}

	public getFPS(): number {
		return this.fps;
	}

	public setFPS(fps: number): void {
		this.fps = fps;
	}

	public setFrameCount(count: number): void {
		this.frameCount = count;
		if (this.currentFrame >= this.frameCount) {
			this.currentFrame = 0;
		}
	}
}
