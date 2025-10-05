/// <reference types="svelte" />
/// <reference types="vite/client" />

// Chrome Extension API types
declare global {
  interface Window {
    chrome?: {
      runtime: {
        sendMessage: (message: any, callback?: (response: any) => void) => void;
        onMessage: {
          addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void | boolean) => void;
        };
        lastError?: {
          message: string;
        };
      };
    };
  }
}

export {};
