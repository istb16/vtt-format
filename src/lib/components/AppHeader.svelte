<script lang="ts">
	import { asset, resolve } from '$app/paths';

	interface Props {
		title: string;
		subtitle: string;
	}
	const { title, subtitle }: Props = $props();
</script>

<header class="tk-header">
	<a class="tk-header__home" href={resolve('/')}>
		<img class="tk-header__icon" src={asset('icon.svg')} alt="" width="32" height="32" />
		<h1 class="tk-header__name">{title}</h1>
	</a>
	<p class="subtitle">{subtitle}</p>
</header>

<style>
	.tk-header {
		flex-shrink: 0;
	}

	h1 {
		margin: 0;
	}

	.subtitle {
		margin: 0;
		min-inline-size: 0;
		font-size: 0.8125rem;
		color: var(--tk-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 600px) {
		.subtitle {
			display: none;
		}
	}
</style>
