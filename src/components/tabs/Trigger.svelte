<script lang="ts">
	import { getContext } from 'svelte';

	interface TabsContext {
		activeTab: string;
		setActiveTab: (value: string) => void;
	}
	interface TriggerProps {
		value: string;
		disabled?: boolean;
		class?: string;
		children: () => any;
	}

	let { value = '', disabled = false, class: className = '', children }: TriggerProps = $props();

	const tabs = getContext<TabsContext>('tabs');

	// Use $derived to make this reactive to changes in the context
	let isActive = $derived(tabs.activeTab === value);
	let _class = $derived(`
    tabs-trigger
    ${isActive ? 'tabs-trigger-active' : ''}
    ${disabled ? 'tabs-trigger-disabled' : ''}
    ${className}
  `);

	function handleClick() {
		if (!disabled) {
			tabs.setActiveTab(value);
		}
	}
</script>

<button
	class={_class}
	role="tab"
	aria-selected={isActive}
	aria-disabled={disabled}
	onclick={handleClick}
	{disabled}
>
	{@render children()}
</button>

<style>
	.tabs-trigger {
		flex: 1;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		font-weight: 500;
		border-bottom: 2px solid transparent;
		transition-property: color, background-color, border-color;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}

	.tabs-trigger-active {
		border-bottom: 2px solid #262626;
	}

	.tabs-trigger-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
