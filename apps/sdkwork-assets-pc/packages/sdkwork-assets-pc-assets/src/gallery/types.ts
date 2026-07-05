export type {
  AssetGalleryType,
  DriveAssetKind,
  DriveAssetItemLike,
  DriveAssetSourceType,
} from '@sdkwork/assets-core';

export {
  assetItemToCatalogRef,
  assetItemToMediaResource,
  assetKindToMediaKind,
  galleryTypeFromMediaKind,
  mediaKindToAssetKind,
  readAssetItemDeliveryUrl,
} from '@sdkwork/assets-core';

export type AssetGallerySource = 'created' | 'uploaded' | 'favorite';

export type AssetGalleryTab = AssetGallerySource;

export type AssetGallerySort = 'date' | 'name';

export type AssetGalleryViewMode = 'grid' | 'masonry';

export interface AssetGalleryItem {
  id: string;
  type: import('@sdkwork/assets-core').AssetGalleryType;
  thumbnailUrl?: string;
  assetUrl?: string;
  duration?: string;
  title?: string;
  createdAt: Date;
  size?: string;
  source?: AssetGallerySource;
}
