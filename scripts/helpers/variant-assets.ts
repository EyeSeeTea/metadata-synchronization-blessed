import * as fs from "node:fs";
import * as path from "node:path";
import { VariantKeys } from "../variants";

const variantAssetsConfig: Record<VariantKeys[number], string[]> = {
    wmr: ["wmr"],
};

const projectRoot = path.resolve(__dirname, "../..");
const publicDir = path.join(projectRoot, "public");
const variantAssetsDir = path.join(projectRoot, "variant-assets");

export function setupVariantAssets(variantName: string): void {
    const assets = variantAssetsConfig[variantName];
    if (!assets) {
        return;
    }
    for (const asset of assets) {
        const sourcePath = path.join(variantAssetsDir, asset);
        const targetPath = path.join(publicDir, asset);
        if (!fs.existsSync(sourcePath)) {
            console.warn(`Warning: Variant asset not found: ${sourcePath}`);
            continue;
        }
        // Remove existing if present
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }
        copyRecursive(sourcePath, targetPath);
        console.debug(`Copied variant asset: ${asset} -> public/${asset}`);
    }
}

export function cleanupVariantAssets(variantName: string): void {
    const assets = variantAssetsConfig[variantName];
    if (!assets) {
        return;
    }
    for (const asset of assets) {
        const targetPath = path.join(publicDir, asset);

        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
            console.debug(`Removed variant asset: public/${asset}`);
        }
    }
}

function copyRecursive(src: string, dest: string): void {
    if (!fs.existsSync(src)) {
        throw new Error(`Source path does not exist: ${src}`);
    }
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}
