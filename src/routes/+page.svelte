<script lang="ts">
	import { fly } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { Button, Send, Textarea } from '$components';
	import {
		piecesChat,
		modelsController,
		conversationsController,
		type QGPTStreamInput
	} from '$getFromPieces';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let userInput = $state('');
	let isNewConversation = $state(false);
	let chat_history: { role: 'user' | 'assistant'; content: string }[] = $state([]);
	let inputHistory: string[] = [];
	let historyIndex = -1;
	let currentConversationId = $derived(conversationsController.getSelectedConversation());

	let loadingHistory = $state(false);

	let initialMessage = $state<{ role: 'user' | 'assistant'; content: string }>();

	async function scopeLoadedChats(history: any[]): Promise<any[]> {
		return await Promise.all(
			history.map(async (entry) => ({
				...entry,
				content: DOMPurify.sanitize(await marked.parse(entry.content), { RETURN_DOM: false })
			}))
		);
	}

	async function loadConversationHistory(id: string) {
		if (!id) return;
		loadingHistory = true;
		try {
			const history = await conversationsController.getConversationHistory(id);

			const scopedChat = await scopeLoadedChats(history);

			// If we have an initial message and this is the first load, prepend it
			if (initialMessage && scopedChat.length === 0) {
				chat_history = [initialMessage, ...scopedChat];
			} else {
				chat_history = scopedChat;
			}
			scrollToBottom();
		} catch (error) {
			chat_history = initialMessage ? [initialMessage] : [];
		} finally {
			loadingHistory = false;
		}
	}

	if (browser) {
		piecesChat.connect();
		modelsController.fallbackToModel();
	}

	async function sendChat() {
		if (!userInput.trim()) return;

		const userMessage = { role: 'user' as const, content: userInput };

		if (chat_history.length === 0) {
			initialMessage = userMessage;
		}

		chat_history = [...chat_history, { role: 'user', content: userInput }];
		inputHistory.push(userInput);
		historyIndex = inputHistory.length;

		try {
			if (!currentConversationId) {
				const newConversation = await conversationsController.createConversation();
				isNewConversation = true;
				conversationsController.setSelectedConversation(newConversation.id);
			}

			const input: QGPTStreamInput = {
				question: {
					relevant: { iterable: [] },
					query: userInput,
					model: modelsController.selectedModel
				},
				conversation: conversationsController.getSelectedConversation()
			};

			let accumulatedMessage = '';
			await piecesChat.askQGPT(input, async (wsOnMessageChunk) => {
				accumulatedMessage += wsOnMessageChunk;

				try {
					if (
						chat_history.length > 0 &&
						chat_history[chat_history.length - 1].role === 'assistant'
					) {
						chat_history = [
							...chat_history.slice(0, -1),
							{ role: 'assistant', content: await marked.parse(accumulatedMessage) }
						];
					} else {
						chat_history = [
							...chat_history,
							{ role: 'assistant', content: await marked.parse(accumulatedMessage) }
						];
					}
					scrollToBottom();
				} catch (error) {
					console.error('Error parsing markdown:', error);
					// Fallback to raw text if parsing fails
					chat_history = [...chat_history, { role: 'assistant', content: accumulatedMessage }];
				}
				scrollToBottom();
			});

			userInput = '';
		} catch (error) {
			console.error(error);
		}
	}

	async function startNewConversation() {
		try {
			const newConversation = await conversationsController.createConversation();
			isNewConversation = true; // Set flag
			conversationsController.setSelectedConversation(newConversation.id);
			chat_history = [];
			userInput = '';
		} catch (error) {
			console.error('Error creating new conversation:', error);
		}
	}

	async function saveSelectedConversation() {
		try {
			const conversationId = conversationsController.getSelectedConversation();

			const filename = prompt('Please enter a filename to export');
			if (!filename) return;

			const response = await fetch('/api/exportConversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ conversationId, filename })
			});

			const data = await response.json();

			if (!data.success) {
				console.error('Failed to export chat', data.message);
			}
		} catch (error) {
			console.error('Error while exporting the chat:', error);
		}
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
			userInput = '';
		} else if (e.key === 'ArrowUp' && historyIndex > 0) {
			historyIndex--;
			userInput = inputHistory[historyIndex];
		} else if (e.key === 'ArrowDown') {
			if (historyIndex < inputHistory.length - 1) {
				historyIndex++;
				userInput = inputHistory[historyIndex];
			} else if (historyIndex === inputHistory.length - 1) {
				historyIndex++;
				userInput = '';
			}
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const formData: FormData = new FormData(e.target as HTMLFormElement);
		const message = formData.get('message') as string;
		if (message === '') return;
		userInput = message;
		await sendChat();
	}

	$effect(() => {
		if (currentConversationId && !isNewConversation) {
			loadConversationHistory(currentConversationId);
		}
		isNewConversation = false;
	});
</script>

<div class="flex">
	<main class="flex-1 p-4">
		<div class="flex flex-col space-y-4">
			<form class="chat-wrapper" onsubmit={handleSubmit}>
				<div class="chat-section flex w-full flex-col space-y-2 overflow-y-auto text-sm">
					{#if loadingHistory}
						<div class="flex justify-center">
							<p>Loading conversation history...</p>
						</div>
					{:else}
						{#if chat_history.length === 0 && !isNewConversation && !currentConversationId}
							<div class="flex">
								<div in:fly={{ y: 50, duration: 400 }} class="assistant-chat">
									Hello! How can I help you today?
								</div>
							</div>
						{/if}

						{#each chat_history as chat}
							{#if chat.role == 'user'}
								<div class="flex justify-end">
									<div in:fly={{ y: 50, duration: 600 }} class="user-chat">
										{@html chat.content}
									</div>
								</div>
							{:else}
								<div class="flex">
									<div in:fly={{ y: 50, duration: 600 }} class="assistant-chat chat-message">
										{@html chat.content}
									</div>
								</div>
							{/if}
						{/each}
					{/if}
				</div>

				<div class="text-right">
					<Textarea
						class="inputarea"
						name="message"
						bind:value={userInput}
						placeholder="Send your query here..."
						onkeydown={(e: KeyboardEvent) => handleKeyDown(e)}
					/>
					<div class="mt-5 flex items-center justify-between">
						<Button class="inputbutton" onclick={startNewConversation}>Start New Chat</Button>
						<Button
							class="inputbutton"
							disabled={!currentConversationId}
							onclick={saveSelectedConversation}
						>
							Export Chat
						</Button>
						<Button class="inputbutton" type="submit" onclick={sendChat}>
							<Send class="h-8 w-8" />
						</Button>
					</div>
				</div>
			</form>
		</div>
	</main>
</div>
