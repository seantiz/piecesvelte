<script lang="ts">
	import Settings from '$components/Settings.svelte';
	import { slide } from 'svelte/transition';
	import headerimg from '$lib/images/reshead.svg';
	import Hamburger from '$components/icons/Hamburger.svelte';

	let showMenu = $state(false);

	function copilotSettings() {
    showMenu = !showMenu;
  }

</script>

<header class="relative flex justify-between items-center mb-20 bg-red-500">
    <div class="z-10">
    </div>

    <nav class="flex justify-between mt-2 relative w-full">
        <div class="absolute left-1/2 transform -translate-x-1/2">

			<img src={headerimg} alt="header" class="h-24 w-72" />
        </div>

        <div class="flex justify-end w-full">
            <button class="w-24 h-24" onclick={copilotSettings}>
                <Hamburger class="w-8 h-10 fill-neutral-100" />
            </button>
        </div>

        {#if showMenu}
        <div class="absolute top-full right-0 w-[25vw] h-[65vh] bg-neutral-300" transition:slide={{ delay: 1, duration: 100 }}>
            <Settings />
        </div>
        {/if}
    </nav>
</header>