export interface CropPresetDefinition {
  name: string;
  slug: string;
  width: number;
  height: number;
  fit: 'cover' | 'contain' | 'inside' | 'outside';
  isDefault?: boolean;
}

export const DEFAULT_CROP_PRESETS: CropPresetDefinition[] = [
  { name: 'Thumbnail', slug: 'thumbnail', width: 300, height: 300, fit: 'cover', isDefault: true },
  { name: 'Card', slug: 'card', width: 600, height: 400, fit: 'cover', isDefault: true },
  { name: 'Medium', slug: 'medium', width: 1200, height: 800, fit: 'cover', isDefault: true },
  { name: 'Hero', slug: 'hero', width: 1920, height: 1080, fit: 'cover', isDefault: true },
  { name: 'Social', slug: 'social', width: 1200, height: 630, fit: 'cover', isDefault: false },
  { name: 'Square', slug: 'square', width: 800, height: 800, fit: 'cover', isDefault: false },
  { name: 'Portrait', slug: 'portrait', width: 800, height: 1200, fit: 'cover', isDefault: false },
  { name: 'Landscape', slug: 'landscape', width: 1600, height: 900, fit: 'cover', isDefault: false },
];
