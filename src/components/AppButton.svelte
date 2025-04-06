<script lang="ts">
    const props = $props();
</script>

<button {...props}
        class="bg-rose-500 cursor-pointer text-white rounded px-4 py-2 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50">
    {@render props.children?.()}
</button>
