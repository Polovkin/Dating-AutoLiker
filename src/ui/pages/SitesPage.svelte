<script lang="ts">
  import { onMount } from 'svelte';
  import { MessageService } from '@/services';
  import { MessageType } from '@/types/common.types';

  // Props from parent component
  export let isRunning: boolean = false;
  export let activeSite: string | null = null;
  export let siteLabel: string = '';
  export let messageService: MessageService;

  onMount(() => {
    console.log('🎯 SitesPage mounted with props:', { isRunning, activeSite, siteLabel });
  });

  // Reactive statements to log when props change
  $: {
    console.log('🔄 SitesPage props changed:', { isRunning, activeSite, siteLabel });
  }

  function handleStart() {
    console.log('🚀 handleStart clicked - activeSite:', activeSite);
    if (activeSite) {
      console.log('📤 Sending START_SWIPE message');
      messageService.send(MessageType.START_SWIPE, { siteId: activeSite });
    } else {
      console.log('❌ No active site to start swiping');
    }
  }

  function handleStop() {
    console.log('⏹️ handleStop clicked');
    console.log('📤 Sending STOP_SWIPE message');
    messageService.send(MessageType.STOP_SWIPE);
  }

</script>

<div class="p-4 h-full">
  {#if activeSite}
    <!-- Site detected -->
    <div class="mb-6">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <span class="text-green-600 mr-2">✅</span>
          <div>
            <h3 class="text-sm font-medium text-green-800">Сайт виявлено</h3>
            <p class="text-sm text-green-700">{siteLabel}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Control buttons -->
    <div class="space-y-3">
      {#if !isRunning}
        <button
          class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          on:click={handleStart}
        >
          <span class="mr-2">▶️</span>
          Старт
        </button>
      {:else}
        <button
          class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          on:click={handleStop}
        >
          <span class="mr-2">⏹️</span>
          Стоп
        </button>
      {/if}
    </div>

    <!-- Status indicator -->
    <div class="mt-4 p-3 rounded-lg {isRunning ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}">
      <div class="flex items-center">
        <span class="mr-2">{isRunning ? '🟡' : '⚪'}</span>
        <span class="text-sm {isRunning ? 'text-yellow-700' : 'text-gray-600'}">
          {isRunning ? 'Автоматизація активна' : 'Автоматизація зупинена'}
        </span>
      </div>
    </div>

  {:else}
    <!-- No site detected -->
    <div class="flex flex-col items-center justify-center h-full text-center">
      <div class="text-6xl mb-4">💔</div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">Сайт не виявлено</h3>
      <p class="text-sm text-gray-600 mb-4">
        Відкрийте підтримуваний дейтинг-сайт для початку роботи
      </p>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full mb-4">
        <h4 class="text-sm font-medium text-blue-800 mb-2">Підтримувані сайти:</h4>
        <ul class="text-xs text-blue-700 space-y-1">
          <li>• Tinder (tinder.com)</li>
          <li>• Badoo (badoo.com)</li>
        </ul>
      </div>
      
    </div>
  {/if}
</div>
