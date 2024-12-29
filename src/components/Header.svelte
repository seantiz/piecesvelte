<script lang="ts">
  import Settings from '$components/Settings.svelte'
  import Conversations from '$components/Conversations.svelte'
  import { slide } from 'svelte/transition'
  import headerimg from '$lib/images/reshead.svg'
  import Hamburger from '$components/icons/Hamburger.svelte'
  import { piecesChat } from '$getFromPieces'

  let isMenuClosed = $state(true)
  let activeTab = $state<'settings' | 'conversations'>('settings')
  let serverStatus = $state<string>('')


  function copilotSettings() {
    isMenuClosed = !isMenuClosed
  }

  async function checkStatus() {
    const rawStatusString = await piecesChat.checkConnection()
    serverStatus = rawStatusString.split(':')[0].toUpperCase()
  }

  $effect(() => {checkStatus()})
</script>

<header class="relative mb-20 flex items-center justify-between bg-red-500">
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
          class="absolute right-0 top-full h-[70vh] w-[25vw] bg-neutral-300"
          transition:slide={{ delay: 1, duration: 100 }}
        >
          <div class="h-auto bg-slate-800 text-center">
            <div class="flex items-center justify-center gap-2 p-2 border-b border-neutral-700">
              <div class="flex items-center">
                <span class="text-white">Connection</span>
                <span class="text-white ml-1">{serverStatus}</span>
              </div>
              {#if serverStatus}
                <div class="h-3 w-3 rounded-full bg-green-500"></div>
              {:else}
                <div class="h-3 w-3 rounded-full bg-red-500"></div>
              {/if}
            </div>
          </div>

          <div class="flex border-b">
            <button
              class="flex-1 p-2 {activeTab === 'settings' ? 'bg-neutral-400' : ''}"
              onclick={() => (activeTab = 'settings')}
            >
              LLMs
            </button>
            <button
              class="flex-1 p-2 {activeTab === 'conversations' ? 'bg-neutral-400' : ''}"
              onclick={() => (activeTab = 'conversations')}
            >
              Conversations
            </button>
          </div>

          {#if activeTab === 'settings'}
            <Settings bind:menuClosed={isMenuClosed} />
          {:else}
            <Conversations />
          {/if}
        </div>
      {/if}
    </nav>
  </header>
