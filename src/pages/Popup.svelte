<script lang="ts">
    import AppButton from "../components/AppButton.svelte";
    import {writable} from "svelte/store";

    const counter = writable(0);

    const increment = () => {
        counter.update(n => n + 1);
    }
</script>

<div class="container mx-auto p-4">
    <button class="w-full" on:click={increment}>
        Start {$counter}
    </button>
</div>

<style>

</style>
