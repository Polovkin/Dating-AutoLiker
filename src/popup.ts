import Popup from '@/ui/pages/Popup.svelte'
import { mount } from "svelte";

// Initialize the popup application
const app = document.getElementById('app');
if (app) {
    mount(Popup, { target: app });
}

// Initialize MessageService for popup
import { MessageService } from '@/services';
import { MessageType } from '@/types/common.types';

const messageService = MessageService.getInstance();
console.log('🔗 MessageService initialized for popup');

// Send initial message to trigger auto-detection
setTimeout(() => {
    try {
        messageService.send(MessageType.GET_STATUS);
        console.log('📤 Sent GET_STATUS via MessageService');
    } catch (error) {
        console.error('❌ Failed to send GET_STATUS:', error);
    }
}, 100);

