import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";
import webExtension, {readJsonFile} from "vite-plugin-web-extension";
// @ts-ignore
import tailwindcss from '@tailwindcss/vite'
import path from "path";

function generateManifest() {
    const manifest = readJsonFile("src/manifest.json");
    const pkg = readJsonFile("package.json");
    return {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        ...manifest,
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        tailwindcss(),
        webExtension({
            manifest: generateManifest,
            watchFilePaths: ["package.json", "manifest.json"],
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@/services": path.resolve(__dirname, "./src/services"),
            "@/types": path.resolve(__dirname, "./src/types"),
            "@/utils": path.resolve(__dirname, "./src/utils"),
            "@/ui": path.resolve(__dirname, "./src/ui"),
        },
    },
});
