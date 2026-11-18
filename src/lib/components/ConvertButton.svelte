<script lang="ts">
	interface Props {
		onclick: () => void;
	}
	const { onclick }: Props = $props();
</script>

<div class="col">
	<button class="tk-btn btn" {onclick}>
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

	/* 色は .tk-btn のまま。入力と出力のあいだに縦に置くため、形だけを変える */
	.btn {
		flex-direction: column;
		gap: 0.45rem;
		min-block-size: 0;
		padding: 1.1rem 0.8rem;
		border-radius: 14px;
		font-size: 0.8rem;
		letter-spacing: 0.02em;
	}

	@media (prefers-reduced-motion: no-preference) {
		.btn {
			transition:
				filter 0.15s,
				transform 0.18s;
		}

		.btn:hover {
			transform: scale(1.07);
		}

		.btn:active {
			transform: scale(0.96);
		}
	}

	@media (max-width: 768px) {
		.btn {
			flex-direction: row;
			padding: 0.875rem 2rem;
			inline-size: 100%;
			border-radius: 10px;
			gap: 0.5rem;
		}
	}
</style>
