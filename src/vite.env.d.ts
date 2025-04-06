/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: 'development' | 'production' | undefined
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
