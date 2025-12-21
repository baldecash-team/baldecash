'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { Settings, RotateCcw, Layout, Tag, Grid3X3, Loader, Clock, MousePointerClick, Images, Maximize2, SlidersHorizontal, CreditCard, Tags } from 'lucide-react';
import { CatalogLayoutConfig, SkeletonVersion, LoadMoreVersion, LoadingDuration, ImageGalleryVersion, GallerySizeVersion, TechnicalFiltersVersion, ProductCardVersion, TagDisplayVersion, layoutVersionDescriptions, brandFilterVersionDescriptions, loadingDurationLabels, loadMoreVersionLabels, imageGalleryVersionLabels, gallerySizeVersionLabels, technicalFiltersVersionLabels, productCardVersionLabels, tagDisplayVersionLabels } from '../../types/catalog';
import { skeletonVersionLabels } from './ProductCardSkeleton';

interface CatalogSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CatalogLayoutConfig;
  onConfigChange: (config: CatalogLayoutConfig) => void;
}

export const CatalogSettingsModal: React.FC<CatalogSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const handleReset = () => {
    onConfigChange({
      layoutVersion: 1,
      brandFilterVersion: 1,
      cardVersion: 1,
      technicalFiltersVersion: 1,
      skeletonVersion: 1,
      loadMoreVersion: 1,
      loadingDuration: 'default',
      imageGalleryVersion: 1,
      gallerySizeVersion: 2,
      tagDisplayVersion: 1,
      pricingMode: 'interactive',
      defaultTerm: 24,
      defaultInitial: 10,
      productsPerRow: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
      showFilterCounts: true,
      showTooltips: true,
    });
  };

  const updateConfig = <K extends keyof CatalogLayoutConfig>(
    key: K,
    value: CatalogLayoutConfig[K]
  ) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="outside"
      backdrop="blur"
      placement="center"
      classNames={{
        base: 'bg-white my-8',
        wrapper: 'items-center justify-center py-8 min-h-full',
        backdrop: 'bg-black/50',
        header: 'border-b border-neutral-200 bg-white py-4 pr-12',
        body: 'bg-white max-h-[60vh] overflow-y-auto scrollbar-hide',
        footer: 'border-t border-neutral-200 bg-white',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-[#4654CD]" />
          </div>
          <span className="text-lg font-semibold text-neutral-800">
            Configuración del Catálogo
          </span>
        </ModalHeader>

        <ModalBody className="py-6 bg-white">
          <p className="text-sm text-neutral-600 mb-4 pb-4 border-b border-neutral-200">
            Personaliza el diseño del catálogo seleccionando diferentes versiones de layout y componentes.
          </p>

          {/* Layout Version */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Layout del Catálogo</h3>
            </div>
            <RadioGroup
              value={config.layoutVersion.toString()}
              onValueChange={(val) => updateConfig('layoutVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.layoutVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={layoutVersionDescriptions[version as keyof typeof layoutVersionDescriptions]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Brand Filter Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Filtro de Marca</h3>
            </div>
            <RadioGroup
              value={config.brandFilterVersion.toString()}
              onValueChange={(val) => updateConfig('brandFilterVersion', parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.brandFilterVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={brandFilterVersionDescriptions[version as keyof typeof brandFilterVersionDescriptions]}
                >
                  Version {version}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Card Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Estilo de Product Card</h3>
            </div>
            <RadioGroup
              value={config.cardVersion.toString()}
              onValueChange={(val) => updateConfig('cardVersion', parseInt(val) as ProductCardVersion)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {([1, 2, 3, 4, 5, 6] as ProductCardVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.cardVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={productCardVersionLabels[version].description}
                >
                  V{version} - {productCardVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Technical Filters Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Filtros Técnicos</h3>
            </div>
            <RadioGroup
              value={config.technicalFiltersVersion.toString()}
              onValueChange={(val) => updateConfig('technicalFiltersVersion', parseInt(val) as TechnicalFiltersVersion)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {([1, 2, 3] as TechnicalFiltersVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.technicalFiltersVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={technicalFiltersVersionLabels[version].description}
                >
                  V{version} - {technicalFiltersVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Skeleton Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Loader className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Animación de Carga</h3>
            </div>
            <RadioGroup
              value={config.skeletonVersion.toString()}
              onValueChange={(val) => updateConfig('skeletonVersion', parseInt(val) as SkeletonVersion)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {([1, 2, 3] as SkeletonVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.skeletonVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={skeletonVersionLabels[version].description}
                >
                  V{version} - {skeletonVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Loading Duration */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Duración de Carga</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['default', '30s', '60s'] as LoadingDuration[]).map((duration) => (
                <Button
                  key={duration}
                  variant={config.loadingDuration === duration ? 'solid' : 'bordered'}
                  className={`cursor-pointer ${
                    config.loadingDuration === duration
                      ? 'bg-[#4654CD] text-white'
                      : 'border-neutral-200 hover:border-[#4654CD]'
                  }`}
                  onPress={() => updateConfig('loadingDuration', duration)}
                >
                  {loadingDurationLabels[duration].name}
                </Button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {loadingDurationLabels[config.loadingDuration].description}
            </p>
          </div>

          {/* Load More Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Botón Cargar Más</h3>
            </div>
            <RadioGroup
              value={config.loadMoreVersion.toString()}
              onValueChange={(val) => updateConfig('loadMoreVersion', parseInt(val) as LoadMoreVersion)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {([1, 2, 3] as LoadMoreVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.loadMoreVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={loadMoreVersionLabels[version].description}
                >
                  V{version} - {loadMoreVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Image Gallery Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Images className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Galería de Imágenes</h3>
            </div>
            <RadioGroup
              value={config.imageGalleryVersion.toString()}
              onValueChange={(val) => updateConfig('imageGalleryVersion', parseInt(val) as ImageGalleryVersion)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {([1, 2, 3] as ImageGalleryVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.imageGalleryVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={imageGalleryVersionLabels[version].description}
                >
                  V{version} - {imageGalleryVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Gallery Size Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Maximize2 className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Tamaño de Galería</h3>
            </div>
            <RadioGroup
              value={config.gallerySizeVersion.toString()}
              onValueChange={(val) => updateConfig('gallerySizeVersion', parseInt(val) as GallerySizeVersion)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {([1, 2, 3] as GallerySizeVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.gallerySizeVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={gallerySizeVersionLabels[version].description}
                >
                  V{version} - {gallerySizeVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Tag Display Version */}
          <div className="mb-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Tags className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Estilo de Tags</h3>
            </div>
            <RadioGroup
              value={config.tagDisplayVersion.toString()}
              onValueChange={(val) => updateConfig('tagDisplayVersion', parseInt(val) as TagDisplayVersion)}
              classNames={{
                wrapper: 'gap-2',
              }}
            >
              {([1, 2, 3] as TagDisplayVersion[]).map((version) => (
                <Radio
                  key={version}
                  value={version.toString()}
                  classNames={{
                    base: `max-w-full w-full p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${config.tagDisplayVersion === version
                        ? 'border-[#4654CD] bg-[#4654CD]/5'
                        : 'border-neutral-200 hover:border-[#4654CD]/50'
                      }`,
                    wrapper: 'before:border-[#4654CD] group-data-[selected=true]:border-[#4654CD]',
                    labelWrapper: 'ml-2',
                    label: 'text-sm',
                    description: 'text-xs text-neutral-500',
                  }}
                  description={tagDisplayVersionLabels[version].description}
                >
                  V{version} - {tagDisplayVersionLabels[version].name}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Products Per Row */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Grid3X3 className="w-4 h-4 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Productos por Fila (Desktop)</h3>
            </div>
            <div className="flex gap-2">
              {[3, 4, 5].map((cols) => (
                <Button
                  key={cols}
                  variant={config.productsPerRow.desktop === cols ? 'solid' : 'bordered'}
                  className={`cursor-pointer ${
                    config.productsPerRow.desktop === cols
                      ? 'bg-[#4654CD] text-white'
                      : 'border-neutral-200 hover:border-[#4654CD]'
                  }`}
                  onPress={() =>
                    updateConfig('productsPerRow', {
                      ...config.productsPerRow,
                      desktop: cols as 3 | 4 | 5,
                    })
                  }
                >
                  {cols} columnas
                </Button>
              ))}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="bg-white">
          <Button
            variant="light"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
            className="cursor-pointer"
          >
            Restablecer
          </Button>
          <Button
            className="bg-[#4654CD] text-white cursor-pointer"
            onPress={onClose}
          >
            Aplicar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
