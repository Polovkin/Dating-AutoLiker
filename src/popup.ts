import Popup from './pages/Popup.svelte'
import { mount } from "svelte";
import browser from "webextension-polyfill";

const app = document.getElementById('app');
if (app) {
    mount(Popup, { target: app });
}

