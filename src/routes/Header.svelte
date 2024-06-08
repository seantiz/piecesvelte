<script>
	import Settings from '$lib/components/LLMsettings.svelte';
	import { slide } from 'svelte/transition';
	import headerimg from '$lib/images/reshead.svg';

	let showMenu = false;

	function copilotSettings() {
    showMenu = !showMenu;
  }

</script>

<header class="flex relative justify-between items-center pb-10">
	<div class="z-10">
	</div>

	<nav>
		<img src={headerimg} alt="Svelte and Pieces OS" />
	</nav>

	<button class="w-24 h-24" on:click={copilotSettings}>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
		  <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
		</svg>
	  </button>

	  {#if showMenu}
	  <div class="absolute top-20 right-5 w-[25vw] h-[80vh] bg-orange-200" transition:slide={{ delay: 1, duration: 50 }}>
		<Settings />
	  </div>
	{/if}

</header>

<style>
	nav img {
  		width: 20em;
  		height: auto;
		padding-top: 2em;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}
</style>
