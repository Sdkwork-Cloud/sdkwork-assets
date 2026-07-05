import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  Grid3X3,
  Heart,
  Image,
  Mic,
  Music,
  Upload,
  Video,
  Waves,
} from 'lucide-react';
import type { AssetGalleryTab, AssetGalleryType } from './types';

export interface AssetGalleryTabOption {
  id: AssetGalleryTab;
  labelKey: string;
  icon: LucideIcon;
}

export interface AssetGalleryTypeOption {
  key: AssetGalleryType | 'all';
  labelKey: string;
  icon: LucideIcon;
}

export const ASSET_GALLERY_TAB_OPTIONS: readonly AssetGalleryTabOption[] = [
  { id: 'created', labelKey: 'galleryTab_created', icon: Archive },
  { id: 'uploaded', labelKey: 'galleryTab_uploaded', icon: Upload },
  { id: 'favorite', labelKey: 'galleryTab_favorite', icon: Heart },
] as const;

export const ASSET_GALLERY_TYPE_OPTIONS: readonly AssetGalleryTypeOption[] = [
  { key: 'all', labelKey: 'galleryType_all', icon: Grid3X3 },
  { key: 'image', labelKey: 'galleryType_image', icon: Image },
  { key: 'video', labelKey: 'galleryType_video', icon: Video },
  { key: 'speech', labelKey: 'galleryType_speech', icon: Mic },
  { key: 'sound', labelKey: 'galleryType_sound', icon: Waves },
  { key: 'music', labelKey: 'galleryType_music', icon: Music },
] as const;

export const ASSET_GALLERY_TYPE_ICON_MAP: Record<AssetGalleryType, LucideIcon> = {
  image: Image,
  video: Video,
  speech: Mic,
  sound: Waves,
  music: Music,
};
