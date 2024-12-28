<script lang="ts">
	import '../app.pcss';
	import '../styles.css';
    import { Header, Github } from '$components'
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="app">
	<Header />

	<main>
		{@render children?.()}
	</main>

	<footer>
		<p class="text-xs">
			<span>This is the Svelte x Pieces Playground. Check out the <Github class="w-8 h-8 inline-block" /> <a href="https://github.com/pieces-app/opensource">Pieces Opensource repo</a> for more.</span>
		</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
