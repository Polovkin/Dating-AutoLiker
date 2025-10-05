<script lang="ts">
  import { onMount } from 'svelte';
  import { MessageService } from '@/services';
  import { MessageType } from '@/types/common.types';

  let isRunning = false;
  let activeSite: string | null = null;
  let siteLabel: string = '';
  let messageService: MessageService;

  onMount(() => {
    messageService = MessageService.getInstance();
    
    // Listen for site ready message
    messageService.on(MessageType.SITE_READY, (payload) => {
      activeSite = payload?.siteId || null;
      siteLabel = payload?.siteLabel || '';
    });

    // Listen for status updates
    messageService.on(MessageType.STATUS_UPDATE, (payload) => {
      isRunning = payload?.isRunning || false;
      activeSite = payload?.activeSite || null;
    });

    // Setup direct chrome runtime listener for SITE_READY
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === MessageType.SITE_READY) {
        activeSite = message.payload?.siteId || null;
        siteLabel = message.payload?.siteLabel || '';
      }
      
      if (message.type === MessageType.STATUS_UPDATE) {
        isRunning = message.payload?.isRunning || false;
        activeSite = message.payload?.activeSite || null;
      }
    });

    // Request current status with delay to ensure background is ready
    setTimeout(() => {
      try {
        messageService.send(MessageType.GET_STATUS);
      } catch (error) {
        console.error('Failed to send GET_STATUS:', error);
      }
    }, 500);
    
    // Also request status via direct chrome runtime
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Direct GET_STATUS failed:', chrome.runtime.lastError.message);
        } else {
          // Update state if we have active site
          if (response?.activeSite) {
            activeSite = response.activeSite;
            isRunning = response.isRunning || false;
            siteLabel = response.siteLabel || '';
          }
        }
      });
    }, 1000);
  });

  function handleStart() {
    if (activeSite) {
      messageService.send(MessageType.START_SWIPE, { siteId: activeSite });
    }
  }

  function handleStop() {
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
      
      <!-- Test button for manual injection -->
      <button
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
        on:click={handleTest}
      >
        <span class="mr-2">🧪</span>
        Тест ін'єкції
      </button>
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
