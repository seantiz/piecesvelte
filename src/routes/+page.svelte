<script lang="ts">
	import { fly } from 'svelte/transition'
	import { Button, Send, Textarea } from '$components'
	import {
		piecesChat,
		modelsController,
		conversationsController,
		type QGPTStreamInput
	} from '$getFromPieces'
	import { marked } from 'marked'
	import DOMPurify from 'dompurify'

	let chat = $state({
		loading: false,
		userInput: '',
		newConversation: false,
		openingMessage: {} as { role: 'user' | 'assistant'; content: string },
		history: [] as { role: 'user' | 'assistant'; content: string }[],
		inputHistory: [] as string[],
		index: -1
	})

	let currentConversationId = $derived(conversationsController.getSelectedConversation())

	// DOM Purify helper because we were getting style bleeds in the DOM
	async function scopeLoadedChats(history: any[]): Promise<any[]> {
		return await Promise.all(
			history.map(async (entry) => ({
				...entry,
				content: DOMPurify.sanitize(await marked.parse(entry.content), { RETURN_DOM: false })
			}))
		)
	}

	// The "CPU" accumulator job of our entire chat app right here
	async function sendChat() {
		if (!chat.userInput.trim()) return

		const userMessage = { role: 'user' as const, content: chat.userInput }

		if (chat.history.length === 0) {
			chat.openingMessage = userMessage
		}

		chat.history = [...chat.history, { role: 'user', content: chat.userInput }]
		chat.inputHistory.push(chat.userInput)
		chat.index = chat.inputHistory.length

		try {
			if (!currentConversationId) {
				const newConversation = await conversationsController.createConversation()
				chat.newConversation = true
				conversationsController.setSelectedConversation(newConversation.id)
			}

			const input: QGPTStreamInput = {
				question: {
					relevant: { iterable: [] },
					query: chat.userInput,
					model: modelsController.selectedModel
				},
				conversation: conversationsController.getSelectedConversation()
			}

			let accumulatedMessage = ''
			await piecesChat.askQGPT(input, async (wsOnMessageChunk) => {
				accumulatedMessage += wsOnMessageChunk

				try {
					if (
						chat.history.length > 0 &&
						chat.history[chat.history.length - 1].role === 'assistant'
					) {
						chat.history = [
							...chat.history.slice(0, -1),
							{ role: 'assistant', content: await marked.parse(accumulatedMessage) }
						]
					} else {
						chat.history = [
							...chat.history,
							{ role: 'assistant', content: await marked.parse(accumulatedMessage) }
						]
					}
					scrollToBottom()
				} catch (error) {
					console.error('Error parsing markdown:', error)
					// Fallback to raw text if parsing fails
					chat.history = [...chat.history, { role: 'assistant', content: accumulatedMessage }]
				}
				scrollToBottom()
			})

			chat.userInput = ''
		} catch (error) {
			console.error(error)
		}
	}

	// Conversation API CRUD tasks
	async function loadConversations(id: string) {
		if (!id) return
		chat.loading = true
		try {
			const history = await conversationsController.getConversationHistory(id)

			const scopedChat = await scopeLoadedChats(history)

			// If we have an initial message and this is the first load, prepend it
			if (chat.openingMessage && scopedChat.length === 0) {
				chat.history = [chat.openingMessage, ...scopedChat]
			} else {
				chat.history = scopedChat
			}
			scrollToBottom()
		} catch (error) {
			chat.history = chat.openingMessage ? [chat.openingMessage] : []
		} finally {
			chat.loading = false
		}
	}

	async function startNewConversation() {
		try {
			const newConversation = await conversationsController.createConversation()
			chat.newConversation = true
			conversationsController.setSelectedConversation(newConversation.id)
			chat.history = []
			chat.userInput = ''
		} catch (error) {
			console.error('Error creating new conversation:', error)
		}
	}

	async function saveSelectedConversation() {
		try {
			const conversationId = conversationsController.getSelectedConversation()

			const filename = prompt('Please enter a filename to export')
			if (!filename) return

			const response = await fetch('/api/exportConversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ conversationId, filename })
			})

			const data = await response.json()

			if (!data.success) {
				console.error('Failed to export chat', data.message)
			}
		} catch (error) {
			console.error('Error while exporting the chat:', error)
		}
	}

	// Chat client utilities
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
			e.preventDefault()
			await sendChat()
			chat.userInput = ''
		} else if (e.key === 'ArrowUp' && chat.index > 0) {
			chat.index--
			chat.userInput = chat.inputHistory[chat.index]
		} else if (e.key === 'ArrowDown') {
			if (chat.index < chat.inputHistory.length - 1) {
				chat.index++
				chat.userInput = chat.inputHistory[chat.index]
			} else if (chat.index === chat.inputHistory.length - 1) {
				chat.index++
				chat.userInput = ''
			}
		}
	}

	// Websocket management
	if (typeof window !== 'undefined') {
		piecesChat.connect()
		modelsController.fallbackToModel()
	}

	$effect(() => {
		if (currentConversationId && !chat.newConversation) {
			loadConversations(currentConversationId)
		}
		chat.newConversation = false
	})
</script>

<div class="flex">
	<main class="flex-1 p-4">
		<div class="flex flex-col space-y-4">
			<form
				class="chat-wrapper"
				onsubmit={async (e) => {
					e.preventDefault()
					await sendChat()
				}}
			>
				<div class="chat-section flex w-full flex-col space-y-2 overflow-y-auto text-sm">
					{#if chat.loading}
						<div class="flex justify-center">
							<p>Loading conversation history...</p>
						</div>
					{:else}
						{#if chat.history.length === 0 && !chat.newConversation && !currentConversationId}
							<div class="flex">
								<div in:fly={{ y: 50, duration: 400 }} class="assistant-chat">
									Hello! How can I help you today?
								</div>
							</div>
						{/if}

						{#each chat.history as conversation}
							{#if conversation.role == 'user'}
								<div class="flex justify-end">
									<div in:fly={{ y: 50, duration: 600 }} class="user-chat">
										{@html conversation.content}
									</div>
								</div>
							{:else}
								<div class="flex">
									<div in:fly={{ y: 50, duration: 600 }} class="assistant-chat chat-message">
										{@html conversation.content}
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
						bind:value={chat.userInput}
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
