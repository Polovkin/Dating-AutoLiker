<script lang="ts">
  import { onMount } from 'svelte';
  import Navigation from '../components/Navigation.svelte';
  import MainPage from './MainPage.svelte';
  import SitesPage from './SitesPage.svelte';
  import SettingsPage from './SettingsPage.svelte';
  import { MessageService } from '@/services';
  import { MessageType } from '@/types/common.types';

  let activeTab: string = 'main';
  let messageService: MessageService;
  
  // Shared state for all pages
  let isRunning: boolean = false;
  let activeSite: string | null = null;
  let siteLabel: string = '';

  onMount(() => {
    console.log('🚀 Popup component mounted - starting site detection');
    messageService = MessageService.getInstance();
    
    // Request current status immediately when popup opens
    console.log('📤 Requesting current status from background');
    
    // Request via MessageService
    setTimeout(() => {
      try {
        messageService.send(MessageType.GET_STATUS);
        console.log('✅ GET_STATUS sent via MessageService');
      } catch (error) {
        console.error('❌ Failed to send GET_STATUS via MessageService:', error);
      }
    }, 100);
    
    // Also request via direct chrome runtime
    setTimeout(() => {
      (window as any).chrome?.runtime?.sendMessage({ type: 'GET_STATUS' }, (response: any) => {
        if ((window as any).chrome?.runtime?.lastError) {
          console.error('❌ Direct GET_STATUS failed:', (window as any).chrome.runtime.lastError.message);
        } else {
          console.log('✅ Direct GET_STATUS response:', response);
        }
      });
    }, 200);

    // Request current tab detection
    setTimeout(() => {
      console.log('🔍 Requesting current tab detection');
      (window as any).chrome?.runtime?.sendMessage({ type: 'DETECT_CURRENT_TAB' }, (response: any) => {
        if ((window as any).chrome?.runtime?.lastError) {
          console.error('❌ DETECT_CURRENT_TAB failed:', (window as any).chrome.runtime.lastError.message);
        } else {
          console.log('✅ DETECT_CURRENT_TAB response:', response);
        }
      });
    }, 300);

    // Listen for site ready messages
    messageService.on(MessageType.SITE_READY, (payload) => {
      console.log('🎯 SITE_READY received in popup via MessageService:', payload);
      activeSite = payload?.siteId || null;
      siteLabel = payload?.siteLabel || '';
      console.log('✅ Updated state - activeSite:', activeSite, 'siteLabel:', siteLabel);
    });

    // Listen for status updates
    messageService.on(MessageType.STATUS_UPDATE, (payload) => {
      console.log('📊 STATUS_UPDATE received in popup via MessageService:', payload);
      isRunning = payload?.isRunning || false;
      activeSite = payload?.activeSite || null;
      console.log('✅ Updated state - isRunning:', isRunning, 'activeSite:', activeSite);
    });

  });

  function handleTabChange(event: CustomEvent) {
    activeTab = event.detail.tab;
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
    {#if activeTab === 'sites'}
      <SitesPage {isRunning} {activeSite} {siteLabel} {messageService} />
    {:else if activeTab === 'main'}
      <MainPage />
    {:else if activeTab === 'settings'}
      <SettingsPage />
    {:else}
      <MainPage />
    {/if}
  </main>
</div>
