import Popup from './ui/pages/Popup.svelte'
import {mount} from "svelte";

const app = document.getElementById('app');
if (app) {
    mount(Popup, { target: app });
}

