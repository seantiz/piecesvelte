<script lang="ts">
	import { getContext } from 'svelte';

	interface TabsContext {
		activeTab: string;
		setActiveTab: (value: string) => void;
	}
	interface TabContentProps {
		value: string;
		class?: string;
		children: () => any;
	}
	let { value, class: className = '', children }: TabContentProps = $props();

	const tabs = getContext<TabsContext>('tabs');

	// Use regular JavaScript without runes
	function isTabActive() {
		return tabs.activeTab === value;
	}

	function getClassName() {
		return `tabs-content ${isTabActive() ? 'tabs-content-active' : 'tabs-content-inactive'} ${className}`;
	}
</script>

{#if isTabActive()}
	<div class={getClassName()} role="tabpanel">
		{@render children()}
	</div>
{/if}

<style>
	.tabs-content {
		width: 100%;
	}

	.tabs-content-inactive {
		display: none;
	}
</style>
