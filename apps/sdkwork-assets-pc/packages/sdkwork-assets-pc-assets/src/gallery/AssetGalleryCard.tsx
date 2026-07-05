import { useState } from 'react';
import { FileText, MoreHorizontal, Music, Play } from 'lucide-react';
import { ASSET_GALLERY_TYPE_ICON_MAP } from './assetGalleryConfig';
import type { AssetGalleryItem } from './types';

export interface AssetGalleryCardProps {
  asset: AssetGalleryItem;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  masonry?: boolean;
}

export function AssetGalleryCard({
  asset,
  isSelected,
  onSelect,
  onPreview,
  masonry = false,
}: AssetGalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const TypeIcon = ASSET_GALLERY_TYPE_ICON_MAP[asset.type] || FileText;
  const thumbnailSource = asset.thumbnailUrl || asset.assetUrl || '';

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0a0a0a]'
          : 'hover:ring-2 hover:ring-white/20'
      } ${masonry ? '' : 'aspect-[4/3]'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(event) => {
        if (event.shiftKey || event.metaKey || event.ctrlKey) {
          onSelect();
        } else {
          onPreview();
        }
      }}
    >
      <div className={`playground-image-canvas relative w-full ${masonry ? '' : 'h-full'}`}>
        <img
          src={thumbnailSource}
          alt={asset.title || 'Asset'}
          className={`w-full object-cover ${masonry ? 'w-full' : 'h-full'}`}
          loading="lazy"
        />

        {isHovered ? (
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 backdrop-blur-sm transition-opacity">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPreview();
              }}
              className="rounded-full bg-white/20 p-3 backdrop-blur-sm transition-all hover:bg-white/30"
            >
              {asset.type === 'video' ? (
                <Play className="h-6 w-6 fill-white text-white" />
              ) : asset.type === 'music' || asset.type === 'sound' ? (
                <Music className="h-6 w-6 text-white" />
              ) : (
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelect();
              }}
              className={`rounded-full p-3 backdrop-blur-sm transition-all ${
                isSelected ? 'bg-cyan-400 text-black' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isSelected ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <MoreHorizontal className="h-5 w-5" />
              )}
            </button>
          </div>
        ) : null}

        {asset.duration ? (
          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {asset.duration}
          </div>
        ) : null}

        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-lg bg-black/60 p-1.5 backdrop-blur-sm">
            <TypeIcon className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
      </div>

      {!masonry && asset.title ? (
        <div className="bg-[#151515] p-3">
          <p className="truncate text-sm text-gray-300">{asset.title}</p>
          {asset.size ? <p className="mt-1 text-xs text-gray-500">{asset.size}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
