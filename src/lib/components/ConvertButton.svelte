<script lang="ts">
	interface Props {
		onclick: () => void;
	}
	const { onclick }: Props = $props();
</script>

<div class="col">
	<button class="btn" {onclick}>
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="9 18 15 12 9 6" />
		</svg>
		<span>変換</span>
	</button>
</div>

<style>
	.col {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn {
		background: linear-gradient(160deg, var(--color-primary), var(--color-accent));
		color: white;
		border: none;
		border-radius: 14px;
		padding: 1.1rem 0.8rem;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		font-family: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		transition:
			transform 0.18s,
			box-shadow 0.18s;
		box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
	}

	.btn:hover {
		transform: scale(1.07);
		box-shadow: 0 6px 20px rgba(14, 165, 233, 0.45);
	}

	.btn:active {
		transform: scale(0.96);
		box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
	}

	@media (max-width: 768px) {
		.btn {
			flex-direction: row;
			padding: 0.875rem 2rem;
			width: 100%;
			justify-content: center;
			border-radius: 10px;
			gap: 0.5rem;
		}
	}
</style>
