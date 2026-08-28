// src/003_Resources/SoundHelper.ts
// p5.sound ライブラリの互換性問題を解決するためのヘルパー関数

/**
 * p5.soundライブラリの様々な実装に対する互換性を提供するヘルパークラス
 */
export class SoundHelper {
	/**
	 * 音声オブジェクトが特定のメソッドを持っているか安全に確認
	 */
	static hasMethod(obj: any, methodName: string): boolean {
		return obj && typeof obj[methodName] === "function";
	}

	/**
	 * 音声オブジェクトがプロパティを持っているか安全に確認
	 */
	static hasProperty(obj: any, propName: string): boolean {
		return obj && obj[propName] !== undefined;
	}

	/**
	 * 再生位置を取得する (様々な実装に対応)
	 */
	static getCurrentTime(sound: any): number {
		if (!sound) return 0;

		try {
			// 再生位置取得の様々な方法を試す
			if (this.hasMethod(sound, "currentTime")) {
				return sound.currentTime();
			}

			if (this.hasProperty(sound, "currentTime")) {
				return sound.currentTime;
			}

			if (this.hasMethod(sound, "position")) {
				return sound.position();
			}

			if (this.hasProperty(sound, "position")) {
				return sound.position;
			}

			// 特定のp5.sound実装向けのプロパティを確認
			if (this.hasProperty(sound, "_lastPos")) {
				return sound._lastPos;
			}

			if (this.hasProperty(sound, "playbackTime")) {
				return sound.playbackTime;
			}

			console.warn("Could not determine current position of sound");
			return 0;
		} catch (e) {
			console.error("Error getting current time:", e);
			return 0;
		}
	}

	/**
	 * 音声を指定した位置から再生する (様々な実装に対応)
	 */
	static playFromPosition(
		sound: any,
		position: number,
		rate: number = 1.0,
	): boolean {
		if (!sound) return false;

		try {
			// p5.soundの様々なバージョンに対応する再開方法

			// 1. jump メソッドを使用
			if (this.hasMethod(sound, "jump")) {
				sound.jump(position);
				return true;
			}

			// 2. play メソッドにパラメータを渡す
			// play(startTime, rate, amp, cuePosition)
			if (this.hasMethod(sound, "play") && sound.play.length >= 1) {
				// 一度停止
				if (this.hasMethod(sound, "stop")) {
					sound.stop();
				}

				// 再生速度を設定
				if (this.hasMethod(sound, "rate")) {
					sound.rate(rate);
				}

				// 遅延実行で信頼性を向上
				setTimeout(() => {
					try {
						sound.play(0, rate, 1.0, position);
					} catch (e) {
						console.error("Error in delayed play:", e);
						// 代替としてシンプルな再生を試みる
						if (this.hasMethod(sound, "play")) {
							sound.play();
						}
					}
				}, 50);

				return true;
			}

			// 3. cue メソッドを使用
			if (this.hasMethod(sound, "cue")) {
				sound.cue(position);
				if (this.hasMethod(sound, "play")) {
					sound.play();
				}
				return true;
			}

			// 4. 通常の再生にフォールバック
			if (this.hasMethod(sound, "play")) {
				sound.play();
				return true;
			}

			console.warn("No suitable method found to play sound from position");
			return false;
		} catch (e) {
			console.error("Error playing from position:", e);
			return false;
		}
	}

	/**
	 * 音声を一時停止する
	 */
	static pause(sound: any): boolean {
		if (!sound) return false;

		try {
			if (this.hasMethod(sound, "pause")) {
				sound.pause();
				return true;
			}

			if (this.hasMethod(sound, "stop")) {
				sound.stop();
				return true;
			}

			return false;
		} catch (e) {
			console.error("Error pausing sound:", e);
			return false;
		}
	}

	/**
	 * 音声を停止する
	 */
	static stop(sound: any): boolean {
		if (!sound) return false;

		try {
			if (this.hasMethod(sound, "stop")) {
				sound.stop();
				return true;
			}

			if (this.hasMethod(sound, "pause")) {
				sound.pause();
				return true;
			}

			return false;
		} catch (e) {
			console.error("Error stopping sound:", e);
			return false;
		}
	}

	/**
	 * 音声の関連メソッドとプロパティの診断情報を取得
	 */
	static diagnose(sound: any): any {
		if (!sound) return { available: false };

		try {
			return {
				available: true,
				methods: {
					play: this.hasMethod(sound, "play"),
					pause: this.hasMethod(sound, "pause"),
					stop: this.hasMethod(sound, "stop"),
					jump: this.hasMethod(sound, "jump"),
					cue: this.hasMethod(sound, "cue"),
					rate: this.hasMethod(sound, "rate"),
					currentTime: this.hasMethod(sound, "currentTime"),
					position: this.hasMethod(sound, "position"),
					duration: this.hasMethod(sound, "duration"),
				},
				properties: {
					currentTime: this.hasProperty(sound, "currentTime"),
					position: this.hasProperty(sound, "position"),
					_lastPos: this.hasProperty(sound, "_lastPos"),
					playbackTime: this.hasProperty(sound, "playbackTime"),
					duration: this.hasProperty(sound, "duration"),
				},
				values: {
					duration: this.hasMethod(sound, "duration")
						? sound.duration()
						: this.hasProperty(sound, "duration")
							? sound.duration
							: "unknown",
				},
			};
		} catch (e) {
			console.error("Error diagnosing sound object:", e);
			return {
				available: true,
				error: e || "Unknown error during diagnosis",
			};
		}
	}
}
