'use client';

/**
 * ProductSpecs - Grid de especificaciones del producto
 *
 * Muestra specs en cards con iconos, agrupadas por categoria.
 * Usa los datos reales del EAV (spec_values) del API.
 *
 * Para accesorios: renderiza rawSpecs directamente con labels legibles.
 * Para laptops/celulares/tablets: renderiza specs estructuradas como antes.
 */

import React from 'react';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Wifi,
  Battery,
  Keyboard,
  Shield,
  Usb,
  Weight,
  Zap,
  Plug,
  MousePointer,
  Target,
  Bluetooth,
  type LucideIcon,
} from 'lucide-react';
import type { ProductSpecs as ProductSpecsType } from '../../../catalogo/types/catalog';

interface ProductSpecsProps {
  specs: ProductSpecsType;
  rawSpecs?: Record<string, string | number | boolean>;
  deviceType?: string;
}

interface SpecItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

// Label map for accessory raw specs
const accessorySpecLabels: Record<string, { label: string; icon: LucideIcon }> = {
  screen_size: { label: 'Pantalla', icon: Monitor },
  screen_resolution: { label: 'Resolución', icon: Monitor },
  panel_type: { label: 'Tipo de Panel', icon: Monitor },
  refresh_rate: { label: 'Tasa de Refresco', icon: Monitor },
  response_time: { label: 'Tiempo de Respuesta', icon: Zap },
  connection_type: { label: 'Conexión', icon: Plug },
  sensor_type: { label: 'Sensor', icon: MousePointer },
  dpi: { label: 'DPI', icon: Target },
  bluetooth_version: { label: 'Bluetooth', icon: Bluetooth },
  battery_capacity: { label: 'Batería', icon: Battery },
  battery_life: { label: 'Duración Batería', icon: Battery },
  weight: { label: 'Peso', icon: Weight },
  operating_system: { label: 'Sistema Operativo', icon: Monitor },
  connectivity: { label: 'Conectividad', icon: Wifi },
  ports: { label: 'Puertos', icon: Usb },
};

function formatSpecValue(key: string, value: string | number | boolean): string {
  if (key === 'weight') {
    const num = Number(value);
    if (num > 0 && num < 1) return `${Math.round(num * 1000)}g`;
    return `${num}kg`;
  }
  if (key === 'refresh_rate') return `${value}Hz`;
  if (key === 'response_time') return `${value}ms`;
  if (key === 'screen_size') return `${value}"`;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}

/** Build spec items from rawSpecs for accessories */
function buildAccessorySpecItems(rawSpecs: Record<string, string | number | boolean>): SpecItem[] {
  const items: SpecItem[] = [];

  for (const [key, value] of Object.entries(rawSpecs)) {
    if (value === '' || value === null || value === undefined) continue;

    const config = accessorySpecLabels[key];
    if (config) {
      const IconComponent = config.icon;
      items.push({
        icon: <IconComponent className="w-5 h-5" />,
        label: config.label,
        value: formatSpecValue(key, value),
      });
    } else {
      // Unknown spec key - show with generic icon and formatted key
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      items.push({
        icon: <Zap className="w-5 h-5" />,
        label,
        value: formatSpecValue(key, value),
      });
    }
  }

  return items;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ specs, rawSpecs, deviceType = 'laptop' }) => {
  // Accessories: render rawSpecs directly
  if (deviceType === 'accesorio' && rawSpecs && Object.keys(rawSpecs).length > 0) {
    const specItems = buildAccessorySpecItems(rawSpecs);

    return (
      <div>
        <h2 className="text-lg font-bold text-neutral-800 mb-4">Especificaciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-neutral-100 p-4 flex items-start gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4654CD]/5 flex items-center justify-center text-[#4654CD]">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-neutral-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Non-accessories: structured specs with optional chaining
  const specItems: SpecItem[] = [];

  if (specs.processor) {
    specItems.push({
      icon: <Cpu className="w-5 h-5" />,
      label: 'Procesador',
      value: `${specs.processor.model} (${specs.processor.cores} nucleos, ${specs.processor.speed})`,
    });
  }

  if (specs.ram) {
    specItems.push({
      icon: <MemoryStick className="w-5 h-5" />,
      label: 'Memoria RAM',
      value: `${specs.ram.size}GB ${specs.ram.type}${specs.ram.expandable ? ` (expandible a ${specs.ram.maxSize}GB)` : ''}`,
    });
  }

  if (specs.storage) {
    specItems.push({
      icon: <HardDrive className="w-5 h-5" />,
      label: 'Almacenamiento',
      value: `${specs.storage.size}GB ${specs.storage.type.toUpperCase()}${specs.storage.hasSecondSlot ? ' (2do slot disponible)' : ''}`,
    });
  }

  if (specs.display) {
    specItems.push({
      icon: <Monitor className="w-5 h-5" />,
      label: 'Pantalla',
      value: `${specs.display.size}" ${specs.display.resolution.toUpperCase()} ${specs.display.type.toUpperCase()} ${specs.display.refreshRate}Hz${specs.display.touchScreen ? ' Tactil' : ''}`,
    });
  }

  if (specs.connectivity) {
    specItems.push({
      icon: <Wifi className="w-5 h-5" />,
      label: 'Conectividad',
      value: `${specs.connectivity.wifi}, Bluetooth ${specs.connectivity.bluetooth}${specs.connectivity.hasEthernet ? ', Ethernet' : ''}`,
    });
  }

  if (specs.battery) {
    specItems.push({
      icon: <Battery className="w-5 h-5" />,
      label: 'Bateria',
      value: `${specs.battery.capacity} (~${specs.battery.life})`,
    });
  }

  // Add GPU for laptops with dedicated GPU
  if (specs.gpu?.type === 'dedicated') {
    specItems.splice(3, 0, {
      icon: <Monitor className="w-5 h-5" />,
      label: 'GPU',
      value: `${specs.gpu.brand} ${specs.gpu.model}${specs.gpu.vram ? ` ${specs.gpu.vram}GB` : ''}`,
    });
  }

  // Add ports for laptops
  if (deviceType === 'laptop' && specs.ports) {
    const portsList: string[] = [];
    if (specs.ports.usb > 0) portsList.push(`${specs.ports.usb}x USB-A`);
    if (specs.ports.usbC > 0) portsList.push(`${specs.ports.usbC}x USB-C`);
    if (specs.ports.hdmi) portsList.push('HDMI');
    if (specs.ports.thunderbolt) portsList.push('Thunderbolt');
    if (specs.ports.sdCard) portsList.push('SD Card');

    if (portsList.length > 0) {
      specItems.push({
        icon: <Usb className="w-5 h-5" />,
        label: 'Puertos',
        value: portsList.join(', '),
      });
    }
  }

  // Add keyboard for laptops
  if (deviceType === 'laptop' && specs.keyboard) {
    specItems.push({
      icon: <Keyboard className="w-5 h-5" />,
      label: 'Teclado',
      value: `${specs.keyboard.language}${specs.keyboard.backlit ? ', retroiluminado' : ''}${specs.keyboard.numericPad ? ', numerico' : ''}`,
    });
  }

  // Add security
  if (specs.security) {
    const securityFeatures: string[] = [];
    if (specs.security.fingerprint) securityFeatures.push('Huella digital');
    if (specs.security.facialRecognition) securityFeatures.push('Reconocimiento facial');
    if (specs.security.tpmChip) securityFeatures.push('TPM 2.0');
    if (securityFeatures.length > 0) {
      specItems.push({
        icon: <Shield className="w-5 h-5" />,
        label: 'Seguridad',
        value: securityFeatures.join(', '),
      });
    }
  }

  // Add weight
  if (specs.dimensions) {
    specItems.push({
      icon: <Weight className="w-5 h-5" />,
      label: 'Peso',
      value: `${specs.dimensions.weight} kg`,
    });
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-neutral-800 mb-4">Especificaciones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {specItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-neutral-100 p-4 flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4654CD]/5 flex items-center justify-center text-[#4654CD]">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-neutral-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* OS Badge */}
      {specs.os?.hasWindows && specs.os.windowsVersion && (
        <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
          <Monitor className="w-3.5 h-3.5" />
          Incluye {specs.os.windowsVersion}
        </div>
      )}
    </div>
  );
};

export default ProductSpecs;
