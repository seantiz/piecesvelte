<script lang="ts">
	import CopilotStreamController from './CopilotStreamController';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from "$lib/components/ui/textarea";
	import { readablestreamStore } from "$lib/readablestreamstore";
	import Typingindicator from "$lib/typingindicator.svelte";
	import { fly } from "svelte/transition";
	import { markdownParser } from "$lib/markdownparser";

	let userInput = '';
	let message = '';
	let isSending = false;
	let chat_history: { role: "user" | "assistant"; content: string }[] = [];

	// @ts-ignore
	let controller;

	const response = readablestreamStore();

  onMount(() => {
    controller = CopilotStreamController.getInstance();
  });

  async function sendChat() {
    isSending = true;
    // @ts-ignore
    await controller.sendMessage(userInput, (newMessage) => {
        // If the last message is from the assistant, update it
        if (chat_history.length > 0 && chat_history[chat_history.length - 1].role === 'assistant') {
            chat_history = [...chat_history.slice(0, -1), { role: 'assistant', content: newMessage }];
        } else {
            // Otherwise, add a new message
            chat_history = [...chat_history, { role: 'assistant', content: newMessage }];
        }
        isSending = false;
        scrollToBottom();
    });
    chat_history = [...chat_history, { role: 'user', content: userInput }];
    userInput = '';
    scrollToBottom();
  }

  function scrollToBottom() {
    // Wait for the next frame to ensure the new message has been rendered
    requestAnimationFrame(() => {
      const chatSection = document.querySelector('.chat-section');
      if (chatSection) {
        chatSection.scrollTop = chatSection.scrollHeight;
      }
    });
  }

	async function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await sendChat();
        }
    }

	async function handleSubmit(this: HTMLFormElement) {
        if ($response.loading) return;
        const formData: FormData = new FormData(this);
        const message = formData.get("message") as string;
        if (message == "") return;
        userInput = message;
        sendChat();
        this.reset();
    }

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main class="flex flex-col space-y-4">
    <form class="chat-wrapper" on:submit|preventDefault={handleSubmit}>
        <div class="flex flex-col space-y-2 overflow-y-auto w-full text-sm chat-section">
            <div class="flex">
                <div in:fly={{ y: 50, duration: 400 }} class="assistant-chat">
                    Hello! How can I help you today?
                </div>
            </div>

            {#each chat_history as chat}
                {#if chat.role == "user"}
                    <div class="flex justify-end">
                        <div in:fly={{ y: 50, duration: 600 }} class="user-chat">
                            {#await markdownParser(chat.content)}
                                {chat.content}
                            {:then html}
                                {@html html}
                            {/await}
                        </div>
                    </div>
                {:else}
                    <div class="flex">
                        <div in:fly={{ y: 50, duration: 600 }} class="assistant-chat">
                            {#await markdownParser(chat.content)}
                                {chat.content}
                            {:then html}
                                {@html html}
                            {/await}
                        </div>
                    </div>
                {/if}
            {/each}

            {#if $response.loading}
                <div class="flex">
                    <div in:fly={{ y: 50, duration: 600 }} class="assistant-chat">
                        <Typingindicator />
                    </div>
                </div>
            {/if}
        </div>

		<div>
	<Textarea bind:value="{userInput}" placeholder="Type your query here" on:keydown="{(e) => handleKeyDown(e)}"/>
<Button variant="outline" on:click="{sendChat}">Send</Button>
</div>
</main>

<style lang="postcss">
    .chat-wrapper {
        @apply flex flex-col space-y-4 md:min-w-[28rem] lg:min-w-[32rem] xl:min-w-[36rem] max-w-6xl;
    }

    .assistant-chat {
        @apply bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-lg my-0 prose prose-sm prose-pre:font-mono prose-pre:border prose-pre:bg-white prose-code:border-gray-300;
    }

    .user-chat {
        @apply bg-[#FF3E00] text-white rounded-lg px-4 py-2 max-w-xs my-0 prose prose-sm prose-pre:font-mono prose-pre:border prose-pre:bg-white prose-code:border-gray-300;
    }

    .chat-message {
        @apply block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6;
    }

    .chat-send {
        @apply block items-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2;
    }

	.chat-section {
        height: 500px;
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>
