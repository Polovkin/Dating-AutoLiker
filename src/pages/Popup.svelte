<script lang="ts">
    import AppButton from "../components/AppButton.svelte";
    import {onMount} from "svelte";

    let url: string = 'some url';

</script>

<div class="container mx-auto p-4">
    <AppButton>
        Start
    </AppButton>
    <p>Url: {url}</p>
</div>

<style>

</style>
