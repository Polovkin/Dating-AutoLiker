import Popup from './pages/Popup.svelte'
import { mount } from "svelte";
import browser from "webextension-polyfill";

mount(Popup, { target: document.body });

