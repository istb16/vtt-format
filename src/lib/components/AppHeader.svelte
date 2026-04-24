<script lang="ts">
	interface Props {
		title: string;
		subtitle: string;
	}
	const { title, subtitle }: Props = $props();
</script>

<header>
	<div class="logo" aria-hidden="true">
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
			<rect x="1.5" y="3.5" width="15" height="11" rx="2" stroke="white" stroke-width="1.6" />
			<line x1="4" y1="8" x2="10" y2="8" stroke="white" stroke-width="1.6" stroke-linecap="round" />
			<line x1="4" y1="11.5" x2="14" y2="11.5" stroke="white" stroke-width="1.6" stroke-linecap="round" />
			<line x1="12" y1="8" x2="14" y2="8" stroke="white" stroke-width="1.6" stroke-linecap="round" />
		</svg>
	</div>
	<div>
		<h1>{title}</h1>
		<p>{subtitle}</p>
	</div>
</header>

<style>
	header {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: 0.875rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		flex-shrink: 0;
	}

	.logo {
		width: 2.25rem;
		height: 2.25rem;
		background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	h1 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--color-text);
	}

	p {
		margin: 0.1rem 0 0;
		font-size: 0.72rem;
		color: var(--color-text-faint);
	}
</style>
