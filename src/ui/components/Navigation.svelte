<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let activeTab: string = 'main';

  const dispatch = createEventDispatcher();

  const tabs = [
    { id: 'main', label: 'Головна', icon: '🏠' },
    { id: 'sites', label: 'Сайти', icon: '💕' },
    { id: 'settings', label: 'Налаштування', icon: '⚙️' }
  ];

  function handleTabClick(tabId: string) {
    activeTab = tabId;
    dispatch('tabChange', { tab: tabId });
  }
</script>

<nav class="bg-white border-b border-gray-200 px-4 py-2">
  <div class="flex space-x-1">
    {#each tabs as tab}
      <button
        class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
               {activeTab === tab.id 
                 ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
        on:click={() => handleTabClick(tab.id)}
      >
        <span class="mr-1">{tab.icon}</span>
        {tab.label}
      </button>
    {/each}
  </div>
</nav>
