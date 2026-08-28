"use client";

import type { AppConfig } from "./types";
import { LANGUAGES } from "./types";

interface ConfigPanelProps {
	config: AppConfig;
	setConfig: (config: AppConfig) => void;
	code: string;
	setCode: (code: string) => void;
	onApply: () => void;
	onExportZip: () => void;
}

const inputStyle: React.CSSProperties = {
	width: "100%",
	padding: "4px 8px",
	fontSize: "13px",
	boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
	display: "block",
	fontSize: "12px",
	marginBottom: "3px",
};

const sectionHeadingStyle: React.CSSProperties = {
	fontSize: "13px",
	fontWeight: "bold",
	margin: "0 0 5px 0",
};

export function ConfigPanel({
	config,
	setConfig,
	code,
	setCode,
	onApply,
	onExportZip,
}: ConfigPanelProps) {
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "15px" }}>
			<legend>Configuration</legend>

			<div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
				{/* Language */}
				<div>
					<label style={labelStyle}>Language</label>
					<select
						value={config.language}
						onChange={(e) => setConfig({ ...config, language: e.target.value })}
						style={inputStyle}
						aria-label="Language"
					>
						{LANGUAGES.map((lang) => (
							<option key={lang.value} value={lang.value}>
								{lang.label}
							</option>
						))}
					</select>
				</div>

				{/* Dimensions */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "10px",
					}}
				>
					<div>
						<label style={labelStyle}>Width</label>
						<input
							type="number"
							value={config.width}
							onChange={(e) =>
								setConfig({ ...config, width: Number(e.target.value) })
							}
							style={inputStyle}
							aria-label="Width"
						/>
					</div>
					<div>
						<label style={labelStyle}>Height</label>
						<input
							type="number"
							value={config.height}
							onChange={(e) =>
								setConfig({ ...config, height: Number(e.target.value) })
							}
							style={inputStyle}
							aria-label="Height"
						/>
					</div>
				</div>

				{/* Font & Timing */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr 1fr",
						gap: "10px",
					}}
				>
					<div>
						<label style={labelStyle}>Font Size</label>
						<input
							type="number"
							value={config.fontSize}
							onChange={(e) =>
								setConfig({ ...config, fontSize: Number(e.target.value) })
							}
							style={inputStyle}
							aria-label="Font Size"
						/>
					</div>
					<div>
						<label style={labelStyle}>Line Height</label>
						<input
							type="number"
							value={config.lineHeight}
							onChange={(e) =>
								setConfig({
									...config,
									lineHeight: Number(e.target.value),
								})
							}
							style={inputStyle}
							aria-label="Line Height"
						/>
					</div>
					<div>
						<label style={labelStyle}>FPS</label>
						<input
							type="number"
							value={config.fps}
							onChange={(e) =>
								setConfig({ ...config, fps: Number(e.target.value) })
							}
							style={inputStyle}
							aria-label="FPS"
						/>
					</div>
					<div>
						<label style={labelStyle}>Duration (s)</label>
						<input
							type="number"
							value={config.duration}
							onChange={(e) =>
								setConfig({ ...config, duration: Number(e.target.value) })
							}
							style={inputStyle}
							aria-label="Duration (s)"
						/>
					</div>
				</div>

				{/* Background */}
				<div>
					<h4 style={sectionHeadingStyle}>Background</h4>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							fontSize: "13px",
							cursor: "pointer",
							marginBottom: "8px",
						}}
					>
						<input
							type="checkbox"
							checked={config.backgroundTransparent}
							onChange={(e) =>
								setConfig({
									...config,
									backgroundTransparent: e.target.checked,
								})
							}
						/>
						Transparent Background
					</label>
					{!config.backgroundTransparent && (
						<div
							style={{
								display: "flex",
								gap: "8px",
								alignItems: "center",
							}}
						>
							<input
								type="number"
								min={0}
								max={255}
								value={config.backgroundColor.r}
								onChange={(e) =>
									setConfig({
										...config,
										backgroundColor: {
											...config.backgroundColor,
											r: Number(e.target.value),
										},
									})
								}
								style={{
									width: "60px",
									padding: "4px 8px",
									fontSize: "13px",
								}}
								placeholder="R"
							/>
							<input
								type="number"
								min={0}
								max={255}
								value={config.backgroundColor.g}
								onChange={(e) =>
									setConfig({
										...config,
										backgroundColor: {
											...config.backgroundColor,
											g: Number(e.target.value),
										},
									})
								}
								style={{
									width: "60px",
									padding: "4px 8px",
									fontSize: "13px",
								}}
								placeholder="G"
							/>
							<input
								type="number"
								min={0}
								max={255}
								value={config.backgroundColor.b}
								onChange={(e) =>
									setConfig({
										...config,
										backgroundColor: {
											...config.backgroundColor,
											b: Number(e.target.value),
										},
									})
								}
								style={{
									width: "60px",
									padding: "4px 8px",
									fontSize: "13px",
								}}
								placeholder="B"
							/>
							<input
								type="color"
								value={`#${config.backgroundColor.r.toString(16).padStart(2, "0")}${config.backgroundColor.g.toString(16).padStart(2, "0")}${config.backgroundColor.b.toString(16).padStart(2, "0")}`}
								onChange={(e) => {
									const hex = e.target.value.replace("#", "");
									setConfig({
										...config,
										backgroundColor: {
											r: parseInt(hex.substring(0, 2), 16),
											g: parseInt(hex.substring(2, 4), 16),
											b: parseInt(hex.substring(4, 6), 16),
										},
									});
								}}
								style={{
									width: "40px",
									height: "30px",
									padding: 0,
									cursor: "pointer",
								}}
								aria-label="背景色"
							/>
						</div>
					)}
				</div>

				{/* Code */}
				<div>
					<h4 style={sectionHeadingStyle}>Code</h4>
					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						rows={15}
						spellCheck={false}
						style={{
							width: "100%",
							fontFamily: "monospace",
							fontSize: "12px",
							padding: "8px",
							boxSizing: "border-box",
							resize: "vertical",
						}}
						aria-label="Code"
					/>
				</div>

				{/* Actions */}
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<button
						type="button"
						onClick={onApply}
						style={{
							padding: "8px 16px",
							fontSize: "14px",
							width: "100%",
						}}
					>
						Apply Changes
					</button>
					<button
						type="button"
						onClick={onExportZip}
						style={{
							padding: "8px 16px",
							fontSize: "14px",
							width: "100%",
						}}
					>
						Export PNG Sequence (ZIP)
					</button>
				</div>
			</div>
		</fieldset>
	);
}
