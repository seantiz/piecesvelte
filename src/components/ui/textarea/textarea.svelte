<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";

	type $$Props = HTMLTextareaAttributes;

	interface Props {
		class?: $$Props["class"];
		value?: $$Props["value"];
		[key: string]: any
	}

	let { class: className = undefined, value = $bindable(undefined), ...rest }: Props = $props();
	
</script>

<textarea
	class={cn(
		"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	onblur={bubble('blur')}
	onchange={bubble('change')}
	onclick={bubble('click')}
	onfocus={bubble('focus')}
	onkeydown={bubble('keydown')}
	onkeypress={bubble('keypress')}
	onkeyup={bubble('keyup')}
	onmouseover={bubble('mouseover')}
	onmouseenter={bubble('mouseenter')}
	onmouseleave={bubble('mouseleave')}
	onpaste={bubble('paste')}
	oninput={bubble('input')}
	{...rest}
></textarea>
