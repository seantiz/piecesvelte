<script>
	import Settings from '$lib/components/LLMsettings.svelte';
	import { slide } from 'svelte/transition';
	import headerimg from '$lib/images/reshead.svg';
	import Hamburger from '$lib/components/icons/Hamburger.svelte';

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
		<Hamburger class="w-10 h-12" />
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
</style>
