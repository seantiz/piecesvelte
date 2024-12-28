<script lang='ts'>
    import Button from '$components/ui/button/button.svelte';
    import { modelsController } from '$getFromPieces/Models.svelte';

    let { menuClosed = $bindable() } = $props()
    let models: any[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);
    menuClosed = false

    let sortedModels = $derived(
        [...models].sort((a, b) => a.name.localeCompare(b.name))
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
      error = 'Failed to load models';
      loading = false;
      console.error('Error loading models:', err);
    }
  }

  function handleChange(modelId: string) {
    console.log('Setting model ID:', modelId);
    modelsController.setSelectedModel(modelId);
    menuClosed = true
}

 $effect(() => {loadModels()});
  </script>

<div>
    {#if loading}
      <p class="text-center">Loading models...</p>
    {:else if error}
      <p class="text-center text-red-500">{error}</p>
    {:else}
    {#each sortedModels as model (model.id)}
    <Button
        class="block bg-transparent text-black hover:bg-neutral-500 hover:text-white w-full"
        onclick={() => handleChange(model.id)}
    >
        {model.name}
    </Button>
{/each}
    {/if}
  </div>

  <div class="h-auto bg-slate-800 text-neutral-200 text-center">
    {#if modelsController.selectedModel === ''}
        <p class="w-full p-[3vh]">
            Pick any model above
        </p>
    {:else}
        <p class="w-full p-[3vh]">
            {models.find(m => m.id === modelsController.selectedModel)?.name}
        </p>
    {/if}
</div>

