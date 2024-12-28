<script lang="ts">
  import { fly } from 'svelte/transition'
  import { browser } from '$app/environment'
  import { Button, Send, Textarea } from '$components'
  import { piecesChat } from '$getFromPieces/PiecesChat'
  import type { QGPTStreamInput } from '@pieces.app/pieces-os-client'
  import { selectedModelStore } from '../stores/selectedModel';


  let userInput = $state('')
  let chat_history: { role: 'user' | 'assistant'; content: string }[] = $state([])
  let inputHistory: string[] = []
  let historyIndex = -1

  if (browser) {
    piecesChat.connect()
  }

  async function sendChat() {
    if (!userInput.trim()) return

    // Add user message to UI
    chat_history = [...chat_history, { role: 'user', content: userInput }]
    inputHistory.push(userInput)

    // Up-arrow updated with history
    historyIndex = inputHistory.length

    const input: QGPTStreamInput = {
        question: {
            relevant: { iterable: [] },
            query: userInput,
            model: $selectedModelStore
        }
    }

    try {
      let accumulatedMessage = ''

      await piecesChat.askQGPT(input, async (newChunk) => {
        accumulatedMessage += newChunk

        if (chat_history.length > 0 && chat_history[chat_history.length - 1].role === 'assistant') {
          chat_history = [
            ...chat_history.slice(0, -1),
            {
              role: 'assistant',
              content: accumulatedMessage
            }
          ]
        } else {
          chat_history = [
            ...chat_history,
            {
              role: 'assistant',
              content: accumulatedMessage
            }
          ]
        }
        scrollToBottom()
      })

      userInput = ''
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const chatSection = document.querySelector('.chat-section')
      if (chatSection) {
        chatSection.scrollTop = chatSection.scrollHeight
      }
    })
  }

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      await sendChat()
    } else if (e.key === 'ArrowUp' && historyIndex > 0) {
      historyIndex--
      userInput = inputHistory[historyIndex]
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < inputHistory.length - 1) {
        historyIndex++
        userInput = inputHistory[historyIndex]
      } else if (historyIndex === inputHistory.length - 1) {
        historyIndex++
        userInput = ''
      }
    }
  }

  async function handleSubmit(this: HTMLFormElement) {
    const formData: FormData = new FormData(this)
    const message = formData.get('message') as string
    if (message == '') return
    userInput = message
    await sendChat()
  }
</script>

<div class="flex">
  <main class="flex-1 p-4">
    <div class="flex flex-col space-y-4">
      <form class="chat-wrapper" onsubmit={handleSubmit}>
        <div class="chat-section flex w-full flex-col space-y-2 overflow-y-auto text-sm">
          <div class="flex">
            <div in:fly={{ y: 50, duration: 400 }} class="assistant-chat">
              Hello! How can I help you today?
            </div>
          </div>

          {#each chat_history as chat}
            {#if chat.role == 'user'}
              <div class="flex justify-end">
                <div in:fly={{ y: 50, duration: 600 }} class="user-chat">
                  {#await chat.content}
                    {chat.content}
                  {:then html}
                    {@html html}
                  {/await}
                </div>
              </div>
            {:else}
              <div class="flex">
                <div in:fly={{ y: 50, duration: 600 }} class="assistant-chat">
                  {#await chat.content}
                    {chat.content}
                  {:then html}
                    {@html html}
                  {/await}
                </div>
              </div>
            {/if}
          {/each}
        </div>

        <div class="text-right">
          <Textarea
            bind:value={userInput}
            placeholder="Send your query here..."
            onkeydown={(e: KeyboardEvent) => handleKeyDown(e)}
          />
          <Button
            class="mt-5 bg-neutral-700 text-lg text-white"
            variant="outline"
            on:click={sendChat}
          >
            <Send class="h-8 w-8" />
          </Button>
        </div>
      </form>
    </div>
  </main>
</div>

<!-- svelte-ignore css_unused_selector -->

<style lang="postcss">
  .chat-wrapper {
    @apply flex max-w-6xl flex-col space-y-4 md:min-w-[28rem] lg:min-w-[32rem] xl:min-w-[36rem];
  }

  .assistant-chat {
    @apply prose prose-sm my-0 max-w-lg rounded-lg bg-neutral-700 px-4 py-2 text-white prose-code:border-gray-300 prose-pre:border prose-pre:bg-white prose-pre:font-mono;
  }

  .user-chat {
    @apply prose prose-sm my-0 max-w-xs rounded-lg bg-[#ff3e00] px-4 py-2 text-white prose-code:border-gray-300 prose-pre:border prose-pre:bg-white prose-pre:font-mono;
  }

  .chat-section {
    height: 450px;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
