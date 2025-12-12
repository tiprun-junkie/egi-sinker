<script lang="ts" generics="T extends { id: number; maker: string; name: string; weight: string }">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	export let items: T[] = [];
	export let selectedId: number | null = null;
	export let placeholder: string = '選択してください';

	let isOpen = false;
	let root: HTMLDivElement;

	$: selectedItem = items.find((item) => item.id === selectedId);

	function selectItem(id: number) {
		selectedId = id;
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			if (isOpen && root && !root.contains(event.target as Node)) {
				isOpen = false;
			}
		}

		document.addEventListener('mousedown', handleClickOutside);

		return () => document.removeEventListener('mousedown', handleClickOutside);
	});
</script>

<div class="relative" bind:this={root}>
	<button
		on:click={toggleDropdown}
		class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-left flex justify-between items-center"
		aria-haspopup="true"
		aria-expanded={isOpen}
	>
		{#if selectedItem}
			<div class="font-semibold text-gray-800 break-words">
				<span class="block sm:inline text-xs sm:text-base text-gray-500 sm:text-gray-800"
					>{selectedItem.maker}</span
				>
				{selectedItem.name} ({selectedItem.weight})
			</div>
		{:else}
			<span class="text-gray-500">{placeholder}</span>
		{/if}
		<!-- Chevron Icon -->
		<svg
			class="w-5 h-5 text-gray-400 ml-2 transform transition-transform duration-200"
			class:rotate-180={isOpen}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	{#if isOpen}
		<ul
			role="listbox"
			transition:slide={{ duration: 200 }}
			class="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-[40vh] rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
		>
			{#each items as item (item.id)}
				<li
					role="option"
					aria-selected={selectedId === item.id}
					tabindex="0"
					on:click={() => selectItem(item.id)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							selectItem(item.id);
						}
					}}
					class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
					class:bg-indigo-600={selectedId === item.id}
					class:text-white={selectedId === item.id}
				>
					{item.maker}
					{item.name} ({item.weight})
				</li>
			{/each}
		</ul>
	{/if}
</div>
