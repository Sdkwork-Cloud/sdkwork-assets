import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assetItemToCatalogRef,
  assetItemToMediaResource,
  assetKindToMediaKind,
  galleryTypeFromMediaKind,
  mediaKindToAssetKind,
} from './assetMapping.ts';

test('mediaKindToAssetKind maps voice and archive to catalog kinds', () => {
  assert.equal(mediaKindToAssetKind('voice'), 'audio');
  assert.equal(mediaKindToAssetKind('archive'), 'file');
  assert.equal(mediaKindToAssetKind('model'), 'model');
});

test('assetKindToMediaKind round-trips primary kinds', () => {
  assert.equal(assetKindToMediaKind('image'), 'image');
  assert.equal(assetKindToMediaKind('file'), 'archive');
});

test('assetItemToMediaResource prefers resourceSnapshot', () => {
  const resource = assetItemToMediaResource({
    assetId: 'node-1',
    driveSpaceId: 'space-1',
    driveNodeId: 'node-1',
    driveUri: 'drive://spaces/space-1/nodes/node-1',
    assetKind: 'image',
    resourceSnapshot: {
      id: 'node-1',
      kind: 'image',
      source: 'drive',
      uri: 'drive://spaces/space-1/nodes/node-1',
      width: 512,
    },
  });
  assert.equal(resource?.width, 512);
});

test('assetItemToCatalogRef maps lifecycle and source type', () => {
  const ref = assetItemToCatalogRef({
    assetId: 'node-1',
    driveSpaceId: 'space-1',
    driveNodeId: 'node-1',
    driveUri: 'drive://spaces/space-1/nodes/node-1',
    assetKind: 'video',
    sourceType: 'ai_generated',
    lifecycleStatus: 'archived',
  });
  assert.equal(ref.sourceType, 'ai_generated');
  assert.equal(ref.lifecycleState, 'archived');
});

test('galleryTypeFromMediaKind respects modality hints', () => {
  assert.equal(galleryTypeFromMediaKind('audio', 'music'), 'music');
  assert.equal(galleryTypeFromMediaKind('audio', 'sfx'), 'sound');
  assert.equal(galleryTypeFromMediaKind('voice'), 'speech');
});
