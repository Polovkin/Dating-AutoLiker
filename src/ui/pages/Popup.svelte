<script lang="ts">
  import Navigation from '../components/Navigation.svelte';
  import MainPage from './MainPage.svelte';
  import SitesPage from './SitesPage.svelte';
  import SettingsPage from './SettingsPage.svelte';

  let activeTab: string = 'main';

  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tab;
  }

  function renderActivePage() {
    switch (activeTab) {
      case 'main':
        return MainPage;
      case 'sites':
        return SitesPage;
      case 'settings':
        return SettingsPage;
      default:
        return MainPage;
    }
  }
</script>

<div class="flex flex-col h-full bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 px-4 py-3">
    <div class="flex items-center">
      <div class="text-2xl mr-2">💕</div>
      <h1 class="text-lg font-semibold text-gray-800">Dating AutoLiker</h1>
    </div>
  </header>

  <!-- Navigation -->
  <Navigation {activeTab} on:tabChange={handleTabChange} />

  <!-- Main Content -->
  <main class="flex-1 overflow-hidden">
    <svelte:component this={renderActivePage()} />
  </main>
</div>
