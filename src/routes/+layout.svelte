<script lang="ts">
  import '../app.pcss'
  import '../styles.css'
  import { Header, Github } from '$components'
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<div class="app">
  <div class="header-menu-container">
    <Header />
  </div>

  <main>
    {@render children?.()}
  </main>

  <footer>
    <p class="text-xs dark:text-slate-300">
      <span
        >This is the Svelte x Pieces Playground. Check out the <Github
          class="inline-block h-8 w-8"
        /> <a href="https://github.com/pieces-app/opensource">Pieces Opensource repo</a> for more.</span
      >
    </p>
  </footer>
</div>
