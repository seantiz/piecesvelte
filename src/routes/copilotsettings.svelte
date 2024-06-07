<script lang='ts'>
  import ModelController from './modelsController'
  import { ModelFoundationEnum } from '@pieces.app/pieces-os-client';
  import Pieces from '@pieces.app/pieces-os-client';
  import { selectedModelStore } from './selectedModel';
  
  let selectedOption = '';
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
   <label>
    <input type="radio" bind:group={$selectedModelStore} value={model.name} on:change={handleChange}>
    {model.name}
  </label>
  {/each}
  </div>
  
  <p>Selected option: {$selectedModelStore}</p>