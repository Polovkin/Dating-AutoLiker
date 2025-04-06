import Popup from './pages/Popup.svelte'
import { mount } from "svelte";
import LoggerService from "./services/logger.service";

mount(Popup, { target: document.body });

LoggerService.info("popup script running...")

