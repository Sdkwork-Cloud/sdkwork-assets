import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test('sdk family smoke test covers composed facade exports', () => {
  const facade = readFileSync(
    "sdks/sdkwork-assets-app-sdk/sdkwork-assets-app-sdk-typescript/src/index.ts",
    "utf8",
  );
  assert.match(facade, /composed\/operations/);
});

test("assets app SDK assembly points at sdkwork-assets app authority", () => {
  const assembly = JSON.parse(readFileSync("sdks/sdkwork-assets-app-sdk/sdk-manifest.json", "utf8"));
  assert.equal(assembly.sdkOwner, "sdkwork-assets");
  assert.equal(assembly.apiAuthority, "sdkwork-assets-app-api");
  assert.equal(assembly.discoverySurface.apiPrefix, "/app/v3/api");
  assert.equal(assembly.packageName, "@sdkwork/assets-app-sdk");
});

test("assets app SDK composed facade re-exports generated transport", () => {
  const facade = readFileSync(
    "sdks/sdkwork-assets-app-sdk/sdkwork-assets-app-sdk-typescript/src/index.ts",
    "utf8",
  );
  assert.match(facade, /generated\/server-openapi\/src\/index/);
  assert.doesNotMatch(facade, /sdkwork-assets-app-sdk-generated-typescript/);
});
