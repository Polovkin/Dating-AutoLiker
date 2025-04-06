<script lang="ts">
    import AppButton from "../components/AppButton.svelte";
    import {onMount} from "svelte";
    import {executeInActiveTab} from "../helpers/tab.helpers";
    import LoggerService from "../services/logger.service";
    import {DatingSiteEntity} from "../entity/dating-site.entity";
    import {writable} from "svelte/store";


    let currentSite = writable(new DatingSiteEntity())

    const clickButtonOnPage = async () => {

    };

    onMount(async () => {
        const href = await executeInActiveTab(() => window.location.href);

        if (!href) {
            LoggerService.error("🌐 No active tab found");
            return;
        }

        currentSite.set(new DatingSiteEntity(href));
    })
</script>

<div class="container mx-auto p-4">
    <p>{$currentSite.name}</p>
    <AppButton onclick={clickButtonOnPage}>
        Start
    </AppButton>
</div>

<style>

</style>
