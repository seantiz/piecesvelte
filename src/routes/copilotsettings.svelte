<script lang='ts'>
  import ModelController from './modelsController'
  import { ModelFoundationEnum } from '@pieces.app/pieces-os-client';
  import Pieces from '@pieces.app/pieces-os-client';
  
  let selectedOption = '';

  const modelController = new ModelController();
  let models: Pieces.Model[] = [];

  modelController.models.then((result) => {
    models = result.iterable.filter(model => 
      model.foundation === ModelFoundationEnum.Gpt35 ||
      model.foundation === ModelFoundationEnum.Gpt4 ||
      model.foundation === ModelFoundationEnum.Gemini
    );
  });
  
    function handleChange(event: Event) {
      const target = event.target as HTMLInputElement;
      selectedOption = target.value;
    }
  </script>
  
  <div>
   {#each models as model (model.id)}
   <label>
    <input type="radio" bind:group={selectedOption} value={model.id} on:change={handleChange}>
    {model.name}
  </label>
  {/each}
  </div>
  
  <p>Selected option: {selectedOption}</p>