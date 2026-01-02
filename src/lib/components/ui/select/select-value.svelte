<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		placeholder?: string;
		children?: Snippet;
		class?: string;
	}

	let { placeholder, children, class: className }: Props = $props();
</script>

<span data-slot="select-value" class={className}>
	{#if children}
		{@render children()}
	{:else if placeholder}
		<span class="text-muted-foreground">{placeholder}</span>
	{/if}
</span>

