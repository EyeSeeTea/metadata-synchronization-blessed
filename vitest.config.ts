/// <reference types="vitest" />
import { defineConfig } from "vite";
import { loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            react(),
            nodePolyfills({
                globals: {
                    Buffer: true,
                    global: true,
                    process: true,
                },
            }),
        ],
        define: {
            __dirname: JSON.stringify("/"),
            __filename: JSON.stringify("/"),
            global: "globalThis",
            "process.env": env,
        },
        test: {
            globals: true,
            environment: "jsdom",
            setupFiles: ["./src/tests/setup.ts"],
            css: false,
            pool: "forks",
            testTimeout: 30000,
        },
    };
});
