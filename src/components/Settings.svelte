<script lang="ts">
	import Button from './Button.svelte';
	import * as Tabs from '$components/tabs';
	import { modelsController } from '$getFromPieces/Models.svelte';

	let { menuClosed = $bindable() } = $props();
	let models: any[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);
	menuClosed = false;

	let sortedModels = $derived([...models].sort((a, b) => a.name.localeCompare(b.name)));

	let claudeModels = $derived(
		sortedModels.filter((model) => model.name.toLowerCase().includes('claude'))
	);
	let geminiModels = $derived(
		sortedModels.filter((model) => model.name.toLowerCase().includes('gemini'))
	);
	let gptModels = $derived(
		sortedModels.filter((model) => model.name.toLowerCase().includes('gpt'))
	);

	async function loadModels() {
		try {
			const modelData = await modelsController.getModelsWithSchemas();
			models = modelData;

			if (!modelsController.selectedModel) {
				await modelsController.fallbackToModel(models);
			}

			loading = false;
		} catch (err) {
			error = 'Failed to load models. Is Pieces OS running?';
			loading = false;
		}
	}

	function handleChange(modelId: string) {
		modelsController.setSelectedModel(modelId);
		menuClosed = true;
	}

	$effect(() => {
		loadModels();
	});
</script>

<div class="flex h-[65vh] flex-col">
	{#if loading}
		<p class="text-center">Loading models...</p>
	{:else if error}
		<p class="text-center text-red-500">{error}</p>
	{:else}
		<Tabs.Root value="claude" class="flex flex-1 flex-col">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="claude">Claude</Tabs.Trigger>
				<Tabs.Trigger value="gemini">Gemini</Tabs.Trigger>
				<Tabs.Trigger value="gpt">ChatGPT</Tabs.Trigger>
			</Tabs.List>

			<div class="min-h-0 flex-1 overflow-y-auto">
				<Tabs.Content value="claude" class="h-full">
					{#each claudeModels as model (model.id)}
						<Button
							class="block w-full bg-transparent text-black hover:bg-neutral-500 hover:text-white"
							onclick={() => handleChange(model.id)}
						>
							{model.name}
						</Button>
					{/each}
				</Tabs.Content>

				<Tabs.Content value="gemini" class="h-full">
					{#each geminiModels as model (model.id)}
						<Button
							class="block w-full bg-transparent text-black hover:bg-neutral-500 hover:text-white"
							onclick={() => handleChange(model.id)}
						>
							{model.name}
						</Button>
					{/each}
				</Tabs.Content>

				<Tabs.Content value="gpt" class="h-full">
					{#each gptModels as model (model.id)}
						<Button
							class="block w-full bg-transparent text-black hover:bg-neutral-500 hover:text-white"
							onclick={() => handleChange(model.id)}
						>
							{model.name}
						</Button>
					{/each}
				</Tabs.Content>
			</div>
		</Tabs.Root>
	{/if}

	<div class="bg-slate-800 text-center text-neutral-200">
		<p class="w-full p-[3vh]">
			{models.find((m) => m.id === modelsController.selectedModel)?.name}
		</p>
	</div>
</div>
