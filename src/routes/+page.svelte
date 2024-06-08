<script lang="ts">
	import { fly } from 'svelte/transition';
	import { writable } from 'svelte/store';

	import CopilotStreamController from '$apis/CopilotStreamController';

	import Button from '@/components/ui/button/button.svelte';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import Typingindicator from '@/components/Typingindicator.svelte';
	

	let userInput = '';
	let isSending = false;
	let chat_history: { role: 'user' | 'assistant'; content: string }[] = [];

	let controller = new CopilotStreamController();
	controller.connect();

	const response = writable({ loading: false, text: '' });

	async function sendChat() {
		isSending = true;
		
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
		const message = formData.get('message') as string;
		if (message == '') return;
		userInput = message;
		sendChat();
		this.reset();
	}
</script>



<main class="flex flex-col space-y-4">
	<form class="chat-wrapper" on:submit|preventDefault={handleSubmit}>
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

			{#if $response.loading}
				<div class="flex">
					<div in:fly={{ y: 50, duration: 600 }} class="assistant-chat">
						<Typingindicator />
					</div>
				</div>
			{/if}
		</div>

		<div class="text-right">
			<Textarea
				bind:value={userInput}
				placeholder="Type your query here"
				on:keydown={(e) => handleKeyDown(e)}
			/>
			<Button class="mt-5 bg-red-500 text-white" variant="outline" on:click={sendChat}>Send</Button>
		</div>
	</form>
</main>

<!-- svelte-ignore css-unused-selector -->

<style lang="postcss">
	.chat-wrapper {
		@apply flex max-w-6xl flex-col space-y-4 md:min-w-[28rem] lg:min-w-[32rem] xl:min-w-[36rem];
	}

	.assistant-chat {
		@apply prose prose-sm my-0 max-w-lg rounded-lg bg-neutral-700 px-4 py-2 text-white prose-code:border-gray-300 prose-pre:border prose-pre:bg-white prose-pre:font-mono;
	}

	.user-chat {
		@apply prose prose-sm my-0 max-w-xs rounded-lg bg-red-500 px-4 py-2 text-white prose-code:border-gray-300 prose-pre:border prose-pre:bg-white prose-pre:font-mono;
	}

	.chat-section {
		height: 450px;
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
