import { OUTPUT_CONFIG } from "../config";
import { EditorManager } from "./001_EditorManager";

export class VideoEncoder {
	private p5: any;
	private editorManager: EditorManager;
	private buffer: any;
	private encodingFrame: number = 0;
	private zip: any;
	private encodingStartTime: number = 0;
	private isFinalizingZip: boolean = false;

	constructor(p5Instance: any, editorManager: EditorManager) {
		this.p5 = p5Instance;
		this.editorManager = editorManager;
	}

	public async encodeFrames(): Promise<void> {
		if (this.isFinalizingZip) {
			return;
		}

		if (this.encodingFrame === 0) {
			this.initializeEncoding();
		}

		await this.processCurrentFrame();
		this.editorManager.setEncodingProgress(this.encodingFrame);

		if (this.encodingFrame >= this.editorManager.getFrameCount() - 1) {
			this.isFinalizingZip = true;
			setTimeout(() => this.finalizeZip(), 100);
			return;
		}

		this.encodingFrame++;
	}

	private initializeEncoding(): void {
		this.buffer = this.p5.createGraphics(
			this.p5.width,
			this.p5.height,
			this.p5.P2D,
		);
		this.buffer.pixelDensity(1);
		this.buffer.colorMode(this.p5.RGB, 255, 255, 255, 255);
		this.zip = new (window as any).JSZip();
		this.encodingStartTime = Date.now();
		this.encodingFrame = 0;
		this.isFinalizingZip = false;
	}

	private async processCurrentFrame(): Promise<void> {
		this.buffer.clear();
		(window as any).animationFunctions.drawCurrentAnimation(
			this.buffer,
			this.encodingFrame,
		);

		const frameImage = this.buffer.get();
		const dataUrl = frameImage.canvas.toDataURL("image/png");
		const base64Data = dataUrl.split(",")[1];
		const filename = `frame_${this.encodingFrame
			.toString()
			.padStart(5, "0")}.png`;
		this.zip.file(filename, base64Data, { base64: true });
	}

	private async finalizeZip(): Promise<void> {
		try {
			const zipBlob = await this.zip.generateAsync({
				type: "blob",
				compression: "DEFLATE",
				compressionOptions: { level: 5 },
			});

			const date = new Date(this.encodingStartTime);
			const timestamp = `${date.getFullYear()}${(date.getMonth() + 1)
				.toString()
				.padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${date
				.getHours()
				.toString()
				.padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
				.getSeconds()
				.toString()
				.padStart(2, "0")}`;

			const filename = OUTPUT_CONFIG.getOutputFilename(timestamp);

			const url = URL.createObjectURL(zipBlob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			link.style.display = "none";
			document.body.appendChild(link);

			link.click();

			setTimeout(() => {
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
				this.resetEncoder();
			}, 1000);
		} catch (error) {
			this.resetEncoder();
			throw error;
		}
	}

	private resetEncoder(): void {
		this.editorManager.setEncodingComplete();
		this.encodingFrame = 0;
		this.isFinalizingZip = false;
		this.zip = null;
		this.buffer = null;
	}
}
