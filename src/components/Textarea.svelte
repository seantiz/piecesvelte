<script lang="ts">
	interface TextareaProps {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		rows?: number;
		maxlength?: number;
		id?: string;
		name?: string;
		class?: string;
		onkeydown?: (event: KeyboardEvent) => void;
		oninput?: (event: Event) => void;
		onblur?: (event: FocusEvent) => void;
		onfocus?: (event: FocusEvent) => void;
	}

	let { value = $bindable(''), ...props }: TextareaProps = $props();
	const classList = $derived(
		`p-3 rounded-md border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${props.class || ''}`
	);

	// Sync the value from parent when it changes
	$effect(() => {
		textareaValue = value || '';
	});

	let textareaValue = $state(value || '');

	// Event handlers
	function handleKeyDown(event: KeyboardEvent) {
		if (props.onkeydown) props.onkeydown(event);
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		textareaValue = target.value;
		// Update the bound value
		value = textareaValue;

		if (props.oninput) props.oninput(event);
	}

	function handleBlur(event: FocusEvent) {
		if (props.onblur) props.onblur(event);
	}

	function handleFocus(event: FocusEvent) {
		if (props.onfocus) props.onfocus(event);
	}
</script>

<textarea
	id={props.id}
	name={props.name}
	placeholder={props.placeholder}
	disabled={props.disabled}
	rows={props.rows || 3}
	maxlength={props.maxlength}
	class={classList}
	value={textareaValue}
	aria-multiline="true"
	onkeydown={handleKeyDown}
	oninput={handleInput}
	onblur={handleBlur}
	onfocus={handleFocus}
></textarea>
