<script lang="ts">
  import Settings from '$components/Settings.svelte'
  import { slide } from 'svelte/transition'
  import headerimg from '$lib/images/reshead.svg'
  import Hamburger from '$components/icons/Hamburger.svelte'

  let isMenuClosed = $state(true)

  function copilotSettings() {
    isMenuClosed = !isMenuClosed
  }
</script>

<header class="relative mb-20 flex items-center justify-between bg-red-500">
  <div class="z-10"></div>

  <nav class="relative mt-2 flex w-full justify-between">
    <div class="absolute left-1/2 -translate-x-1/2 transform">
      <img src={headerimg} alt="header" class="h-24 w-72" />
    </div>

    <div class="flex w-full justify-end">
      <button class="h-24 w-24" onclick={copilotSettings}>
        <Hamburger class="h-10 w-8 fill-neutral-100" />
      </button>
    </div>

    {#if !isMenuClosed}
      <div
        class="absolute right-0 top-full h-[65vh] w-[25vw] bg-neutral-300"
        transition:slide={{ delay: 1, duration: 100 }}
      >
        <Settings bind:menuClosed={isMenuClosed} />
      </div>
    {/if}
  </nav>
</header>
