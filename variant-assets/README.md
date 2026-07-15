# Variant-Specific Assets

This directory contains assets that should only be included in specific app variants.

Each variant can have its own subdirectory containing assets that will be copied to the `public/` folder during build or development.

## How It Works

The `scripts/helpers/variant-assets.ts` module manages the copying and cleanup of variant-specific assets:

1. **During build**: Assets are copied to `public/` before the build runs and cleaned up after
2. **During development**: Assets are copied to `public/` when the dev server starts and cleaned up on exit

The configuration is defined in `variantAssetsConfig` in `scripts/helpers/variant-assets.ts`.

## Adding New Variant Assets

1. Create a subdirectory in `variant-assets/` with the name of your assets (e.g., `my-variant-files/`)
2. Add the mapping in `scripts/helpers/variant-assets.ts`:
    ```typescript
    const variantAssetsConfig: Record<string, string[]> = {
        wmr: ["wmr"],
        "my-variant": ["my-variant-files"],
    };
    ```
3. Add the public variant-specific path to `.gitignore` to prevent it from being committed:
    ```
    /public/my-variant-files
    ```
