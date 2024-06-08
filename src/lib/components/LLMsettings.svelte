<script lang='ts'>
  import ModelController from '$apis/modelsController'
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
  
    function handleChange(event: Event) {
      const target = event.target as HTMLInputElement;
      selectedModelStore.set(target.value);
    }
  </script>
  
  <div>
   {#each models as model (model.name)}
   <Button 
      class="block bg-transparent text-black hover:bg-rose-500 hover:text-white w-full" 
      on:click={() => $selectedModelStore = model.name.replace("Chat Model", "").replace("(Gemini)", "Google Gemini")}
    >
      {model.name.replace("Chat Model", "").replace("(Gemini)", "Google Gemini")}
    </Button>
  {/each}
  </div>
  
  <div class="h-auto bg-slate-800 text-neutral-200 text-center">
    <p class="w-full mt-[5vh] mr-[5vh]">
      Selected option:
    </p>
    <p class="w-full mr-[5vh] pb-[5vh]">
      {$selectedModelStore}
    </p>
  </div>