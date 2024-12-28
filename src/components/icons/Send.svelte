<script lang="ts">
  interface Props {
    [key: string]: any
  }

  let { ...props }: Props = $props()
</script>

<svg {...props} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
  <path
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    d="m6.998 10.247l.435.76c.277.485.415.727.415.993s-.138.508-.415.992l-.435.761c-1.238 2.167-1.857 3.25-1.375 3.788c.483.537 1.627.037 3.913-.963l6.276-2.746c1.795-.785 2.693-1.178 2.693-1.832c0-.654-.898-1.047-2.693-1.832L9.536 7.422c-2.286-1-3.43-1.5-3.913-.963c-.482.537.137 1.62 1.375 3.788Z"
  />
</svg>
