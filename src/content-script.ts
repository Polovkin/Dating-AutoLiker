import { ContentScriptService } from '@/services';

// Immediate log to confirm script loads
console.log('🚀 Dating AutoLiker Content Script loaded on:', window.location.href);

// Initialize content script service
const contentScriptService = ContentScriptService.getInstance();
contentScriptService.initialize();
