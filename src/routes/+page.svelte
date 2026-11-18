<script lang="ts">
	import { convert } from '#lib/vtt.js';
	import AppHeader from '#lib/components/AppHeader.svelte';
	import ConvertButton from '#lib/components/ConvertButton.svelte';
	import TextPanel from '#lib/components/TextPanel.svelte';

	let inText = $state('');
	let outText = $state('');
	let copied = $state(false);
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	// 出力が変わったら「コピー済み」表示を解除する
	function resetCopied() {
		clearTimeout(copiedTimer);
		copied = false;
	}

	function handleConvert() {
		outText = convert(inText);
		resetCopied();
	}

	function handleClear() {
		inText = '';
		outText = '';
		resetCopied();
	}

	async function handleCopy() {
		const text = outText;
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error('クリップボードへのコピーに失敗しました', err);
			return;
		}
		// コピー完了までに出力が変わっていたら「コピー済み」にしない
		if (outText !== text) return;
		copied = true;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => (copied = false), 2000);
	}

	function handleFileDrop(text: string) {
		inText = text;
		handleConvert();
	}
</script>

<div class="app">
	<AppHeader title="VTT TEXT FORMATTER" subtitle="字幕テキストを読みやすい文章形式に変換" />

	<main>
		<div class="workspace">
			<TextPanel
				label="入力"
				bind:value={inText}
				placeholder="VTT テキストを貼り付けるか、ファイルをドロップしてください"
				autofocus
				onFileDrop={handleFileDrop}
			>
				{#snippet action()}
					<button class="btn-ghost" onclick={handleClear}>クリア</button>
				{/snippet}
			</TextPanel>

			<ConvertButton onclick={handleConvert} />

			<TextPanel
				label="出力"
				bind:value={outText}
				placeholder="変換後のテキストがここに表示されます"
				readonly
			>
				{#snippet action()}
					<button class="btn-ghost" class:is-copied={copied} onclick={handleCopy}>
						{#if copied}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							コピー済み
						{:else}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
							</svg>
							コピー
						{/if}
					</button>
				{/snippet}
			</TextPanel>
		</div>
	</main>

	<footer class="tk-footer">
		<a href="https://tk3.biz/">tk3.biz</a>
	</footer>
</div>

<style>
	/* ── Layout ── */
	.app {
		min-block-size: 100dvh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
		padding: 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.workspace {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1rem;
		min-height: 0;
	}

	/* ── Ghost button (used in panel action snippets) ── */
	.btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: none;
		border: 1px solid var(--tk-line);
		border-radius: 6px;
		padding: 0.25rem 0.6rem;
		font-size: 0.73rem;
		cursor: pointer;
		color: var(--tk-muted);
		font-family: inherit;
		line-height: 1.4;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.btn-ghost:hover {
		background: var(--tk-surface);
		color: var(--tk-ink);
		border-color: var(--tk-muted);
	}

	.btn-ghost.is-copied {
		background: var(--tk-surface);
		border-color: var(--tk-green);
		color: var(--tk-green);
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		main {
			padding: 1rem;
			overflow-y: auto;
			flex: none;
		}

		.workspace {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
			flex: none;
			gap: 0.75rem;
		}

		:global(.panel) {
			height: 42vh;
		}
	}
</style>
