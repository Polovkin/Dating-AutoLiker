<script lang="ts">
    import AppButton from "../components/AppButton.svelte";
    import {onMount} from "svelte";
    import {executeInActiveTab} from "../helpers/tab.helpers";
    import LoggerService from "../services/logger.service";


    const clickButtonOnPage = async () => {

    };

    onMount(async () => {
        const href = await executeInActiveTab(() => window.location.href);
        LoggerService.info(`🌐 Active tab href: ${href}`);
    })
</script>

<div class="container mx-auto p-4">
    <AppButton onclick={clickButtonOnPage}>
        Start
    </AppButton>
</div>

<style>

</style>
