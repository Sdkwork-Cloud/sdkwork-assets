#!/usr/bin/env node
/**
 * SDKWork Assets SDK generation pipeline entrypoint.
 *
 * Validates the assets app-api OpenAPI contract and runs sdkgen for the
 * sdkwork-assets-app-sdk family.
 *
 * Usage:
 *   node tools/assets_sdk_generate.mjs --check
 *   node tools/assets_sdk_generate.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const APP_API = {
  path: "apis/app-api/assets/assets-app-api.openapi.json",
  sdkFamily: "sdkwork-assets-app-sdk",
  generator: "sdks/sdkwork-assets-app-sdk/bin/generate-sdk.mjs",
};

function parseArgs(argv) {
  return { check: argv.includes("--check") };
}

function validateOpenApiContract(inputPath) {
  const fullPath = resolve(repoRoot, inputPath);
  if (!existsSync(fullPath)) {
    console.error(`[sdkwork-assets] Missing OpenAPI input: ${inputPath}`);
    return false;
  }

  try {
    const content = JSON.parse(readFileSync(fullPath, "utf8"));
    if (!content.openapi) {
      console.error(`[sdkwork-assets] ${inputPath} is not a valid OpenAPI document (missing 'openapi' field)`);
      return false;
    }
    if (!content.info?.title || !content.info?.version) {
      console.error(`[sdkwork-assets] ${inputPath} is missing required info.title or info.version`);
      return false;
    }
    if (!content.paths) {
      console.error(`[sdkwork-assets] ${inputPath} is missing required paths section`);
      return false;
    }
    console.log(`[sdkwork-assets] OK: app-api (${inputPath}) -> ${content.info.title} v${content.info.version}`);
    return true;
  } catch (error) {
    console.error(`[sdkwork-assets] Failed to parse ${inputPath}: ${error.message}`);
    return false;
  }
}

function validateSdkFamily(config) {
  const sdkFamilyDir = resolve(repoRoot, "sdks", config.sdkFamily);
  if (!existsSync(sdkFamilyDir)) {
    console.warn(`[sdkwork-assets] SDK family directory not yet generated: sdks/${config.sdkFamily}`);
    return false;
  }
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log("[sdkwork-assets] Validating OpenAPI contract...");
  if (!validateOpenApiContract(APP_API.path)) {
    console.error("[sdkwork-assets] OpenAPI contract validation failed.");
    process.exit(1);
  }

  if (args.check) {
    console.log("[sdkwork-assets] Contract check passed. SDK family directory:");
    validateSdkFamily(APP_API);
    console.log("[sdkwork-assets] --check complete.");
    return;
  }

  const generatorPath = resolve(repoRoot, APP_API.generator);
  if (!existsSync(generatorPath)) {
    console.error(`[sdkwork-assets] Per-family generator not found: ${APP_API.generator}`);
    process.exit(1);
  }

  console.log(`[sdkwork-assets] Generating ${APP_API.sdkFamily} from ${APP_API.path}...`);
  const result = spawnSync(
    "node",
    [generatorPath, "--input", resolve(repoRoot, APP_API.path)],
    { cwd: repoRoot, stdio: "inherit" },
  );
  if (result.error) {
    console.error(`[sdkwork-assets] Failed to start ${APP_API.generator}: ${result.error.message}`);
    process.exit(1);
  }
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
  if (result.signal) {
    console.error(`[sdkwork-assets] ${APP_API.generator} terminated by signal ${result.signal}`);
    process.exit(1);
  }

  console.log("[sdkwork-assets] SDK generation pipeline complete.");
}

main();
