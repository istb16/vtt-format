<script lang="ts">
	import type { Snippet } from 'svelte';
	// 共通の土台を先に、アプリ全体の CSS をあとに読み込む
	import '../styles/tk-base.css';
	import '../styles/app.css';

	const { children }: { children: Snippet } = $props();
</script>

{@render children()}
