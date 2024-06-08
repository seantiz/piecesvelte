<script lang='ts'>
  import ModelController from '../../apis/modelsController'
  import { ModelFoundationEnum } from '@pieces.app/pieces-os-client';
  import Pieces from '@pieces.app/pieces-os-client';
  import { selectedModelStore } from '../../stores/selectedModel';
  import Button from '$lib/components/ui/button/button.svelte';
  
  let models: Pieces.Model[] = [];

  const modelController = new ModelController();

  modelController.models.then((result) => {
    models = result.iterable.filter(model => 
      model.foundation === ModelFoundationEnum.Gpt35 ||
      model.foundation === ModelFoundationEnum.Gpt4 ||
      model.foundation === ModelFoundationEnum.Gemini

      
    );
  });

  selectedModelStore.subscribe(value => console.log(value));
  
    function handleChange(modelId: string) {
      selectedModelStore.set(modelId);
    }
  </script>
  
  <div>
    {#each models.sort((a, b) => a.name.localeCompare(b.name)) as model (model.name)}
    <Button 
       class="block bg-transparent text-black hover:bg-neutral-500 hover:text-white w-full" 
       on:click={() => handleChange(model.name)}
     >
       {model.name.replace("Chat Model", "").replace("(Gemini)", "Google Gemini")}
     </Button>
 {/each}
  </div>
  
  <div class="h-auto bg-slate-800 text-neutral-200 text-center">
    {#if $selectedModelStore == ''}<p class="w-full p-[3vh]">
      Pick any model above
    </p>
    {:else}
    <p class="w-full p-[3vh]">
      {$selectedModelStore}
    </p>
    {/if}
  </div>