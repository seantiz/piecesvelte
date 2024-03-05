<script>
	import '../app.pcss';
	import Header from './Header.svelte';
	import './styles.css';
</script>

<div class="app">
	<Header></Header>

	<main>
		<slot />
	</main>

	<footer>
		<p>Check out the <a href="https://github.com/pieces-app/opensource">Pieces Opensource repo</a> for more.</p>
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

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
