import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess({})],

  kit: {
    adapter: adapter(),
    alias: {
      $components: './src/components',
      $getFromPieces: './src/getFromPieces',
      $stores: './src/stores'
    }
  },
  onwarn: (warning, handler) => {
    const { code } = warning
    if (code === 'css-unused-selector') return

    handler(warning)
  }
}

export default config
