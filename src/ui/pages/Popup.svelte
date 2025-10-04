<script lang="ts">
    import Timer from "../components/Timer.svelte";
</script>

<div class="container mx-auto p-4">
    <Timer defaultDuration={300} />
</div>

<style>
    .container {
        min-width: 300px;
        max-width: 400px;
    }
</style>
