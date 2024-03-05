<script lang='ts'>
    let selectedOption = '';
  
    function handleChange(event: Event) {
      const target = event.target as HTMLInputElement;
      selectedOption = target.value;
    }
  </script>
  
  <div>
    <label>
      <input type="radio" bind:group={selectedOption} value="Option 1" on:change={handleChange}>
      Option 1
    </label>
    <label>
      <input type="radio" bind:group={selectedOption} value="Option 2" on:change={handleChange}>
      Option 2
    </label>
    <label>
      <input type="radio" bind:group={selectedOption} value="Option 3" on:change={handleChange}>
      Option 3
    </label>
  </div>
  
  <p>Selected option: {selectedOption}</p>