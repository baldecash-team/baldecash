'use client';

/**
 * PortsDisplay - Visual Laptop Ports Layout (basado en V1)
 * Shows ports organized by position with a visual representation.
 *
 * SpecSheetDownload - Separate component for downloading spec sheet PDF
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import {
  Usb,
  Monitor,
  Headphones,
  CreditCard,
  Laptop,
  HelpCircle,
  Download,
  Check,
  Loader2,
  Network,
  Zap,
  Cable,
} from 'lucide-react';
import { PortsDisplayProps, ProductPort, SpecSheetDownloadProps } from '../../../types/detail';
import { generateSpecSheetPDF } from '../../../utils/generateSpecSheetPDF';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

const iconMap: Record<string, React.ElementType> = {
  Usb,
  Monitor,
  Headphones,
  CreditCard,
  Laptop,
  HelpCircle,
  Network,
  Zap,
  Cable,
};

/**
 * SpecSheetDownload - Component for downloading spec sheet PDF
 * Rendered outside the ports card, below it
 */
export const SpecSheetDownload: React.FC<SpecSheetDownloadProps> = ({
  specs = [],
  ports = [],
  productId = '',
  productName,
  productBrand,
  productImage,
  productUrl,
  description,
  shortDescription,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const analytics = useAnalytics();

  const handleDownloadPDF = async () => {
    if (isGenerating) return;
    analytics.trackSpecSheetDownload({ product_id: productId });
    setIsGenerating(true);
    try {
      await generateSpecSheetPDF({
        productName: productName || 'Producto',
        productBrand: productBrand || '',
        productImage,
        productUrl: productUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
        specs,
        ports,
        description,
        shortDescription,
        generatedDate: new Date(),
      });

      // Mostrar feedback de éxito
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full p-4 bg-gradient-to-r from-[rgba(var(--color-primary-rgb),0.05)] to-[rgba(var(--color-primary-rgb),0.1)] rounded-2xl border border-[rgba(var(--color-primary-rgb),0.2)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 font-['Asap',_sans-serif]">Ficha Técnica</h4>
            <p className="text-sm text-neutral-600 hidden sm:block">Descarga todas las especificaciones en PDF</p>
          </div>
        </div>
        <Button
          className={`w-full sm:w-auto px-6 cursor-pointer transition-all ${
            downloadSuccess
              ? 'bg-green-500 text-white'
              : 'bg-[var(--color-primary)] text-white hover:opacity-90'
          }`}
          startContent={
            isGenerating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : downloadSuccess
              ? <Check className="w-4 h-4" />
              : <Download className="w-4 h-4" />
          }
          onPress={handleDownloadPDF}
          isDisabled={isGenerating}
        >
          {isGenerating ? 'Generando...' : downloadSuccess ? 'Descargado' : 'Descargar PDF'}
        </Button>
      </div>
    </div>
  );
};

export const PortsDisplay: React.FC<PortsDisplayProps> = ({
  ports,
}) => {
  const leftPorts = ports.filter(p => p.position === 'left');
  const rightPorts = ports.filter(p => p.position === 'right');
  const backPorts = ports.filter(p => p.position === 'back');
  const bottomPorts = ports.filter(p => p.position === 'bottom');

  const renderPort = (port: ProductPort, index: number) => {
    const IconComponent = iconMap[port.icon] || HelpCircle;
    return (
      <div
        key={index}
        className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 rounded-lg border border-neutral-200 min-h-[40px]"
      >
        <IconComponent className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
        <span className="text-sm font-medium text-neutral-700 break-words">{port.name}</span>
        {port.count > 1 && (
          <span className="text-xs text-neutral-500 flex-shrink-0">×{port.count}</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.10)] flex items-center justify-center">
          <Usb className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Puertos y Conectividad</h3>
          <p className="text-sm text-neutral-500">Distribución de puertos en el equipo</p>
        </div>
      </div>

      {/* Visual Layout */}
      <div className="relative flex items-start justify-center gap-4">
        {/* Left Side */}
        <div className="flex flex-col gap-2 items-end sm:items-end flex-1 sm:flex-none sm:min-w-[140px]">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Izquierda</span>
          {leftPorts.map((port, idx) => renderPort(port, idx))}
        </div>

        {/* Laptop Visual - Hidden on mobile */}
        <div className="hidden sm:flex flex-shrink-0 w-32 h-24 bg-neutral-100 rounded-lg items-center justify-center relative mt-6 border border-neutral-200">
          <Laptop className="w-12 h-12 text-neutral-400" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[rgba(var(--color-primary-rgb),0.30)] rounded-r" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[rgba(var(--color-primary-rgb),0.30)] rounded-l" />
          {backPorts.length > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[rgba(var(--color-primary-rgb),0.30)] rounded-b" />
          )}
        </div>

        {/* Right Side */}
        <div className="flex flex-col gap-2 items-start flex-1 sm:flex-none sm:min-w-[140px]">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Derecha</span>
          {rightPorts.map((port, idx) => renderPort(port, idx))}
        </div>
      </div>

      {/* Back Ports (if any) */}
      {backPorts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Parte trasera</span>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {backPorts.map((port, idx) => renderPort(port, idx))}
          </div>
        </div>
      )}

      {/* Bottom Ports (if any) */}
      {bottomPorts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Parte inferior</span>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {bottomPorts.map((port, idx) => renderPort(port, idx))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 bg-[rgba(var(--color-primary-rgb),0.10)] text-[var(--color-primary)] rounded-full text-xs font-medium">
            {ports.reduce((acc, p) => acc + p.count, 0)} puertos totales
          </span>
          <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
            {leftPorts.reduce((acc, p) => acc + p.count, 0)} izquierda • {rightPorts.reduce((acc, p) => acc + p.count, 0)} derecha{bottomPorts.length > 0 ? ` • ${bottomPorts.reduce((acc, p) => acc + p.count, 0)} inferior` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortsDisplay;
