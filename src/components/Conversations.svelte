<script lang="ts">
	import { conversationsController, type Conversation } from '$getFromPieces';
	import Button from './Button.svelte';

	let conversations: Conversation[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);
	let currentPage = $state(1);
	const itemsPerPage = 10;

	let sortedConversations = $derived(
		[...conversations].sort((a, b) => {
			const aTime = a.created.value;
			const bTime = b.created.value;
			return bTime.getTime() - aTime.getTime();
		})
	);

	let totalPages = $derived(Math.ceil(sortedConversations.length / itemsPerPage));
	let paginatedConversations = $derived(
		sortedConversations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	async function loadConversations() {
		try {
			const conversationData = await conversationsController.getAllConversations();
			conversations = conversationData;
			loading = false;
		} catch (err) {
			error = 'Failed to load conversations';
			loading = false;
			console.error('Error loading conversations:', err);
		}
	}

	function handleSelect(conversationId: string) {
		conversationsController.setSelectedConversation(conversationId);
	}

	function nextPage() {
		if (currentPage < totalPages) currentPage++;
	}

	function prevPage() {
		if (currentPage > 1) currentPage--;
	}

	$effect(() => {
		loadConversations();
	});
</script>

<div class="flex flex-col">
	{#if loading}
		<p class="text-center">Loading conversations...</p>
	{:else if error}
		<p class="text-center text-red-500">{error}</p>
	{:else}
		<div class="h-[52vh] overflow-y-auto">
			{#each paginatedConversations as conversation (conversation.id)}
				<Button
					class="block w-full bg-transparent text-black hover:bg-neutral-500 hover:text-white"
					onclick={() => handleSelect(conversation.id)}
					onkeydown={(e) => e.key === 'Enter' && handleSelect(conversation.id)}
					onkeyup={() => {}}
				>
					{conversation.name || `Conversation ${conversation.id.slice(0, 8)}...`}
				</Button>
			{/each}
		</div>

		<div class="flex items-center justify-between border-t bg-neutral-300 p-2">
			<Button
				class="px-4 {currentPage === 1 ? 'opacity-50' : ''}"
				disabled={currentPage === 1}
				onclick={prevPage}
				onkeydown={(e) => e.key === 'Enter' && currentPage > 1 && prevPage()}
				onkeyup={() => {}}
			>
				Previous
			</Button>

			<Button
				class="px-4 {currentPage === totalPages ? 'opacity-50' : ''}"
				disabled={currentPage === totalPages}
				onclick={nextPage}
				onkeydown={(e) => e.key === 'Enter' && currentPage < totalPages && nextPage()}
				onkeyup={() => {}}
			>
				Next
			</Button>
		</div>
	{/if}
</div>
