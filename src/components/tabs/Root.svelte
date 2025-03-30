<script lang="ts">
	import { setContext } from 'svelte';

	interface RootProps {
		value: string;
		class?: string;
		children: () => any;
	}

	let { value, class: className = '', children }: RootProps = $props();
	let _class = `tabs-root ${className}`;
	let activeTab = $state(value);

	function setActiveTab(newValue: string) {
		activeTab = newValue;
	}

	setContext('tabs', {
		get activeTab() {
			return activeTab;
		},
		setActiveTab
	});
</script>

<div class={_class}>
	{@render children()}
</div>
