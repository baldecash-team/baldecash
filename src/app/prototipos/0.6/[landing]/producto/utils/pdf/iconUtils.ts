/**
 * Icon Utilities for PDF Generation
 * Converts Lucide icons to PNG base64 for use in jsPDF
 */

import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Battery,
  Wifi,
  Scale,
  Camera,
  Shield,
  Smartphone,
  Fingerprint,
  Gauge,
  Zap,
  Bluetooth,
  Settings,
  Volume2,
  Keyboard,
  Signal,
  Box,
  Laptop,
  Usb,
  Headphones,
  Cable,
  Network,
  CreditCard,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Map API icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  cpu: Cpu,
  memory: MemoryStick,
  storage: HardDrive,
  monitor: Monitor,
  battery: Battery,
  wifi: Wifi,
  scale: Scale,
  camera: Camera,
  shield: Shield,
  smartphone: Smartphone,
  fingerprint: Fingerprint,
  gauge: Gauge,
  zap: Zap,
  bluetooth: Bluetooth,
  settings: Settings,
  'volume-2': Volume2,
  volume: Volume2,
  keyboard: Keyboard,
  signal: Signal,
  laptop: Laptop,
  // Íconos para puertos
  usb: Usb,
  headphones: Headphones,
  audio: Headphones,
  cable: Cable,
  network: Network,
  ethernet: Network,
  'rj-45': Network,
  rj45: Network,
  lan: Network,
  creditcard: CreditCard,
  hdmi: Monitor,
  displayport: Monitor,
  dp: Monitor,
  'usb-c': Usb,
  thunderbolt: Zap,
  helpCircle: HelpCircle,
  help: HelpCircle,
};

// Default icon for unknown types
const defaultIcon = Box;

// Cache for generated icons to avoid re-rendering
const iconCache = new Map<string, string>();

/**
 * Converts a Lucide icon to a PNG base64 string
 * @param iconName - The icon name from the API (e.g., "cpu", "memory")
 * @param size - The size of the icon in pixels (default: 24)
 * @param color - The color of the icon (default: white for PDF badges)
 * @returns Promise<string> - The base64 PNG data URL
 */
export const getIconAsBase64 = async (
  iconName: string,
  size: number = 24,
  color: string = '#FFFFFF'
): Promise<string> => {
  const cacheKey = `${iconName}-${size}-${color}`;

  // Return cached version if available
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  const IconComponent = iconMap[iconName.toLowerCase()] || defaultIcon;

  // Render the icon to SVG string
  const svgString = renderToStaticMarkup(
    createElement(IconComponent, {
      size,
      color,
      strokeWidth: 2,
    })
  );

  // Create a data URL from the SVG
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

  // Convert SVG to PNG using canvas
  const base64 = await svgToPngBase64(svgDataUrl, size, size);

  // Cache the result
  iconCache.set(cacheKey, base64);

  return base64;
};

/**
 * Converts an SVG data URL to PNG base64
 */
const svgToPngBase64 = (svgDataUrl: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const pngBase64 = canvas.toDataURL('image/png');
      resolve(pngBase64);
    };
    img.onerror = () => reject(new Error('Failed to load SVG image'));
    img.src = svgDataUrl;
  });
};

/**
 * Pre-loads all icons used in specs to cache them
 * Call this before generating the PDF for better performance
 */
export const preloadAllIcons = async (
  iconNames: string[],
  size: number = 24,
  color: string = '#FFFFFF'
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();

  await Promise.all(
    iconNames.map(async (name) => {
      try {
        const base64 = await getIconAsBase64(name, size, color);
        // Guardar tanto el nombre original como en minúsculas para búsqueda flexible
        results.set(name, base64);
        results.set(name.toLowerCase(), base64);
      } catch (error) {
        console.error(`Failed to load icon: ${name}`, error);
      }
    })
  );

  return results;
};

/**
 * Gets all available icon names
 */
export const getAvailableIconNames = (): string[] => {
  return Object.keys(iconMap);
};
