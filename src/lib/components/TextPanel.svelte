<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		value: string;
		placeholder?: string;
		readonly?: boolean;
		autofocus?: boolean;
		/** ファイルドロップ時に呼ばれるコールバック。未指定時はドロップ無効 */
		onFileDrop?: (text: string) => void;
		/** パネルヘッダー右側に配置するアクションボタン */
		action?: Snippet;
	}

	let {
		label,
		value = $bindable(),
		placeholder = '',
		readonly = false,
		autofocus = false,
		onFileDrop,
		action
	}: Props = $props();

	let dragging = $state(false);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (!onFileDrop) return;
		const file = e.dataTransfer?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			if (ev.target?.result) onFileDrop(ev.target.result.toString());
		};
		reader.readAsText(file);
	}
</script>

<div class="panel">
	<div class="panel-header">
		<span class="panel-label">{label}</span>
		{#if action}
			<div class="panel-actions">{@render action()}</div>
		{/if}
	</div>

	<div
		role="region"
		aria-label="{label}エリア"
		class="textarea-wrap"
		class:is-dragging={dragging && !!onFileDrop}
		ondragenter={() => (dragging = true)}
		ondragleave={() => (dragging = false)}
		ondragover={handleDragOver}
		ondrop={handleDrop}
	>
		{#if dragging && onFileDrop}
			<div class="drop-overlay">
				<svg
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
				<span>ファイルをドロップ</span>
			</div>
		{/if}
		<!-- svelte-ignore a11y_autofocus -->
		<textarea bind:value {readonly} {autofocus} {placeholder}></textarea>
	</div>
</div>

<style>
	.panel {
		background: var(--color-surface);
		border-radius: 12px;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.07),
			0 1px 2px rgba(0, 0, 0, 0.04);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 1rem;
		border-bottom: 1px solid #f1f5f9;
		background: #f8fafc;
		flex-shrink: 0;
	}

	.panel-label {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--color-text-faint);
	}

	.panel-actions {
		display: flex;
		gap: 0.5rem;
	}

	.textarea-wrap {
		flex: 1;
		position: relative;
		min-height: 0;
	}

	.textarea-wrap.is-dragging {
		outline: 2px dashed var(--color-primary);
		outline-offset: -3px;
		border-radius: 0 0 12px 12px;
	}

	.drop-overlay {
		position: absolute;
		inset: 0;
		background: rgba(240, 249, 255, 0.93);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-primary);
		pointer-events: none;
		z-index: 1;
	}

	textarea {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		padding: 1rem 1.25rem;
		border: none;
		resize: none;
		font-family: inherit;
		font-size: 0.875rem;
		line-height: 1.8;
		color: var(--color-text-body);
		background: transparent;
		outline: none;
	}

	textarea::placeholder {
		color: #cbd5e1;
	}
</style>
