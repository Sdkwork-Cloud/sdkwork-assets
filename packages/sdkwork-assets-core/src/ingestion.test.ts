import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAiGeneratedCatalogRef, buildDriveImportPlan } from './ingestion.ts';

test('buildDriveImportPlan plans one drive item per artifact', () => {
  const plan = buildDriveImportPlan({
    batchId: 'batch-1',
    provenance: {
      modality: 'image',
      operationType: 'text_to_image',
      generationId: 'gen-1',
      scene: 'playground_image',
      provider: { providerCode: 'openai', providerUrl: 'https://example.com/a.png' },
      model: 'dall-e-3',
    },
    artifacts: [{
      index: 0,
      kind: 'image',
      fileName: 'a.png',
      mimeType: 'image/png',
      providerUrl: 'https://example.com/a.png',
    }],
  }, {
    tenantId: 'tenant-1',
    ownerSubjectType: 'user',
    ownerSubjectId: 'user-1',
    actorType: 'user',
    actorId: 'user-1',
    spaceProfile: 'ai_generated',
  });

  assert.equal(plan.items.length, 1);
  assert.match(plan.items[0]?.driveUri ?? '', /^drive:\/\/spaces\//);
  assert.equal(plan.items[0]?.uploadProfileCode, 'image');
  assert.equal(plan.items[0]?.mediaResource.source, 'drive');
  assert.equal(plan.items[0]?.mediaResource.ai?.provenance, 'generated');

  const catalog = buildAiGeneratedCatalogRef({
    index: 0,
    driveSpaceId: plan.items[0]!.driveSpaceId,
    driveNodeId: plan.items[0]!.driveNodeId,
    driveUri: plan.items[0]!.driveUri,
    mediaResource: plan.items[0]!.mediaResource,
  });
  assert.equal(catalog.sourceType, 'ai_generated');
});
