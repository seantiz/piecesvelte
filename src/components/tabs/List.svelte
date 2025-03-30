<script lang="ts">
	interface ListProps {
		class?: string;
		children: () => any;
	}

	let { class: className = '', children }: ListProps = $props();
	let _class = $derived(`tabs-list ${className}`);
</script>

<div class={_class}>
	{@render children()}
</div>
