"use client";

export function LoadingOverlay() {
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#fff",
				zIndex: 10,
			}}
		>
			<div style={{ textAlign: "center" }}>
				<div style={{ fontSize: "18px", marginBottom: "10px" }}>
					読み込み中...
				</div>
				<div style={{ fontSize: "12px", color: "#666" }}>
					p5.jsとライブラリを読み込んでいます...
				</div>
			</div>
		</div>
	);
}
