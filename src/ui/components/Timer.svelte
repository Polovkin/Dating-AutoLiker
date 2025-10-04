<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import browser from "webextension-polyfill";
    import { MessageType } from "@/types/common.types";
    import type { TimerState } from "@/types/common.types";

    // Props
    export let defaultDuration: number = 300; // 5 minutes default

    // Timer state
    const timerState = writable<TimerState>({
        isRunning: false,
        isPaused: false,
        duration: 0,
        elapsed: 0
    });

    // Timer display
    const timerDisplay = writable("05:00");

    // Message listener for timer updates
    let messageListener: ((message: any) => void) | null = null;

    // Format time as MM:SS
    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Start timer
    const startTimer = async () => {
        try {
            // Get current tab ID
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tabId = tabs[0]?.id;
            
            if (!tabId) {
                console.error('No active tab found');
                return;
            }
            
            await browser.runtime.sendMessage({
                type: MessageType.TIMER_START,
                target: 'background',
                payload: { 
                    duration: defaultDuration,
                    tabId: tabId
                }
            });
            console.log('Timer start message sent for tab:', tabId);
        } catch (error) {
            console.error('Failed to start timer:', error);
        }
    };

    // Helper function to get current tab ID
    const getCurrentTabId = async (): Promise<number | null> => {
        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            return tabs[0]?.id || null;
        } catch (error) {
            console.error('Failed to get current tab:', error);
            return null;
        }
    };

    // Pause timer
    const pauseTimer = async () => {
        try {
            const tabId = await getCurrentTabId();
            if (!tabId) return;
            
            await browser.runtime.sendMessage({
                type: MessageType.TIMER_PAUSE,
                target: 'background',
                payload: { tabId }
            });
            console.log('Timer pause message sent for tab:', tabId);
        } catch (error) {
            console.error('Failed to pause timer:', error);
        }
    };

    // Stop timer
    const stopTimer = async () => {
        try {
            const tabId = await getCurrentTabId();
            if (!tabId) return;
            
            await browser.runtime.sendMessage({
                type: MessageType.TIMER_STOP,
                target: 'background',
                payload: { tabId }
            });
            console.log('Timer stop message sent for tab:', tabId);
        } catch (error) {
            console.error('Failed to stop timer:', error);
        }
    };

    // Resume timer (continue from where it was paused)
    const resumeTimer = async () => {
        try {
            const tabId = await getCurrentTabId();
            if (!tabId) return;
            
            await browser.runtime.sendMessage({
                type: MessageType.TIMER_RESUME,
                target: 'background',
                payload: { tabId }
            });
            console.log('Timer resume message sent for tab:', tabId);
        } catch (error) {
            console.error('Failed to resume timer:', error);
        }
    };

    // Get current status
    const getStatus = async () => {
        try {
            const tabId = await getCurrentTabId();
            if (!tabId) return;
            
            await browser.runtime.sendMessage({
                type: MessageType.GET_STATUS,
                target: 'background',
                payload: { tabId }
            });
            console.log('Status request sent for tab:', tabId);
        } catch (error) {
            console.error('Failed to get status:', error);
        }
    };

    onMount(() => {
        console.log('Timer component mounted');
        
        // Set up message listener for timer updates
        messageListener = (message: any) => {
            console.log('Received message:', message);
            
            if (message.type === MessageType.TIMER_TICK) {
                timerState.set(message.payload);
                
                // Update timer display
                const remaining = message.payload.duration - message.payload.elapsed;
                timerDisplay.set(formatTime(Math.max(0, remaining)));
                console.log('Timer tick:', message.payload);
            } else if (message.type === MessageType.STATUS_UPDATE && message.timer) {
                timerState.set(message.timer);
                
                // Update timer display
                const remaining = message.timer.duration - message.timer.elapsed;
                timerDisplay.set(formatTime(Math.max(0, remaining)));
                console.log('Status update:', message.timer);
            }
        };

        browser.runtime.onMessage.addListener(messageListener);
        
        // Get initial status
        getStatus();
    });

    onDestroy(() => {
        if (messageListener) {
            browser.runtime.onMessage.removeListener(messageListener);
        }
    });
</script>

<div class="timer-container">
    <!-- Timer Display -->
    <div class="timer-display">
        <div class="timer-time">
            {$timerDisplay}
        </div>
        <div class="timer-status">
            {#if $timerState.isRunning}
                🟢 Таймер працює
            {:else if $timerState.isPaused}
                🟡 Таймер на паузі
            {:else}
                ⚪ Таймер зупинений
            {/if}
        </div>
    </div>

    <!-- Timer Controls -->
    <div class="timer-controls">
        {#if !$timerState.isRunning && !$timerState.isPaused}
            <!-- Start button when timer is stopped -->
            <button class="btn btn-primary btn-full" on:click={startTimer}>
                ▶️ Запустити таймер
            </button>
        {:else if $timerState.isRunning}
            <!-- Pause button when timer is running -->
            <div class="btn-group">
                <button class="btn btn-secondary" on:click={pauseTimer}>
                    ⏸️ Пауза
                </button>
                <button class="btn btn-danger" on:click={stopTimer}>
                    ⏹️ Стоп
                </button>
            </div>
        {:else if $timerState.isPaused}
            <!-- Resume/Stop buttons when timer is paused -->
            <div class="btn-group">
                <button class="btn btn-primary" on:click={resumeTimer}>
                    ▶️ Продовжити
                </button>
                <button class="btn btn-danger" on:click={stopTimer}>
                    ⏹️ Стоп
                </button>
            </div>
        {/if}
    </div>

    <!-- Timer Progress -->
    {#if $timerState.duration > 0}
        <div class="timer-progress">
            <div class="progress-bar">
                <div 
                    class="progress-fill" 
                    style="width: {($timerState.elapsed / $timerState.duration) * 100}%"
                ></div>
            </div>
            <div class="progress-text">
                Прогрес: {$timerState.elapsed}с / {$timerState.duration}с
            </div>
        </div>
    {/if}
</div>

<style>
    .timer-container {
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        min-width: 320px;
        max-width: 400px;
        color: white;
    }

    .timer-display {
        text-align: center;
        margin-bottom: 24px;
    }

    .timer-time {
        font-size: 3.5rem;
        font-weight: 700;
        font-family: 'Courier New', monospace;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: 2px;
    }

    .timer-status {
        font-size: 1rem;
        opacity: 0.9;
        font-weight: 500;
    }

    .timer-controls {
        margin-bottom: 20px;
    }

    .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .btn:active {
        transform: translateY(0);
    }

    .btn-primary {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
    }

    .btn-secondary {
        background: linear-gradient(135deg, #FF9800, #F57C00);
        color: white;
    }

    .btn-danger {
        background: linear-gradient(135deg, #f44336, #d32f2f);
        color: white;
    }

    .btn-full {
        width: 100%;
    }

    .btn-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .timer-progress {
        margin-top: 16px;
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        border-radius: 4px;
        transition: width 0.3s ease;
        box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
    }

    .progress-text {
        text-align: center;
        font-size: 0.875rem;
        opacity: 0.8;
    }
</style>
