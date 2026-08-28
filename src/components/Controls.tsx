"use client";

interface ControlsProps {
	isPlaying: boolean;
	isDrawerOpen: boolean;
	onTogglePlayback: () => void;
	onToggleDrawer: () => void;
}

export function Controls({
	isPlaying,
	isDrawerOpen,
	onTogglePlayback,
	onToggleDrawer,
}: ControlsProps) {
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: "10px" }}>
			<legend>操作</legend>
			<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
				<button
					type="button"
					onClick={onTogglePlayback}
					style={{ padding: "4px 12px", fontSize: "13px" }}
				>
					{isPlaying ? "Pause" : "Play"}
				</button>
				<button
					type="button"
					onClick={onToggleDrawer}
					style={{ padding: "4px 12px", fontSize: "13px" }}
				>
					{isDrawerOpen ? "設定を閉じる" : "Edit Code"}
				</button>
			</div>
		</fieldset>
	);
}
