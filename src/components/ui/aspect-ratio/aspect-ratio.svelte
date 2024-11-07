<script lang="ts">
	import { AspectRatio as AspectRatioPrimitive } from "bits-ui";

	type $$Props = AspectRatioPrimitive.Props;

	interface Props {
		ratio?: $$Props["ratio"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { ratio = 4 / 3, children, ...rest }: Props = $props();
</script>

<AspectRatioPrimitive.Root {ratio} {...rest}>
	{@render children?.()}
</AspectRatioPrimitive.Root>
