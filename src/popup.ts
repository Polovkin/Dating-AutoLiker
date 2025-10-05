import Popup from '@/ui/pages/Popup.svelte'
import { mount } from "svelte";

// Initialize the popup application
const app = document.getElementById('app');
if (app) {
    mount(Popup, { target: app });
}

