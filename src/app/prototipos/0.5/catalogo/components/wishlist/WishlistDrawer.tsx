'use client';

import React from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { X, Heart, Trash2, GitCompare } from 'lucide-react';
import { CatalogProduct, calculateQuotaWithInitial } from '../../types/catalog';
import { formatMoney } from '../../../utils/formatMoney';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: CatalogProduct[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onViewProduct: (productId: string) => void;
  onAddToCompare?: (productId: string) => void;
  compareList?: string[];
  maxCompareProducts?: number;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onClearAll,
  onViewProduct,
  onAddToCompare,
  compareList = [],
  maxCompareProducts = 3,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-white m-0 rounded-none sm:rounded-l-xl sm:ml-auto sm:max-w-md h-full',
        header: 'border-b border-neutral-200 bg-white py-4',
        body: 'bg-white p-0',
        footer: 'border-t border-neutral-200 bg-white',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#4654CD] fill-[#4654CD]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-800">Mis Favoritos</h2>
            <p className="text-sm text-neutral-500 font-normal">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="px-4 py-4 overflow-y-auto">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                Sin favoritos aún
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Haz clic en el corazón de cualquier producto para agregarlo aquí
              </p>
              <Button
                variant="bordered"
                onPress={onClose}
                className="cursor-pointer"
              >
                Explorar catálogo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => {
                const { quota } = calculateQuotaWithInitial(product.price, 24, 10);
                const isInCompare = compareList.includes(product.id);
                const canAddToCompare = compareList.length < maxCompareProducts;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-neutral-50 rounded-xl p-3 flex gap-3 group"
                  >
                    {/* Product Image */}
                    <div
                      onClick={() => onViewProduct(product.id)}
                      className="w-20 h-20 rounded-lg bg-white flex-shrink-0 flex items-center justify-center p-2 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.displayName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-500">{product.brand}</p>
                      <p
                        onClick={() => onViewProduct(product.id)}
                        className="text-sm font-semibold text-neutral-800 line-clamp-2 cursor-pointer hover:text-[#4654CD] transition-colors"
                      >
                        {product.displayName}
                      </p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg font-bold text-[#4654CD]">
                          S/{formatMoney(quota)}
                        </span>
                        <span className="text-xs text-neutral-500">/mes</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        {onAddToCompare && (
                          <Button
                            size="sm"
                            variant={isInCompare ? 'solid' : 'bordered'}
                            onPress={() => onAddToCompare(product.id)}
                            isDisabled={!isInCompare && !canAddToCompare}
                            className={`cursor-pointer text-xs h-7 ${
                              isInCompare
                                ? 'bg-[#4654CD] text-white'
                                : 'border-neutral-300'
                            }`}
                            startContent={<GitCompare className="w-3 h-3" />}
                          >
                            {isInCompare ? 'En comparador' : 'Comparar'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => onRemoveProduct(product.id)}
                          className="cursor-pointer text-xs h-7 text-red-500 hover:bg-red-50"
                          startContent={<Trash2 className="w-3 h-3" />}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ModalBody>

        {products.length > 0 && (
          <ModalFooter>
            <Button
              fullWidth
              variant="light"
              onPress={onClearAll}
              className="cursor-pointer text-neutral-600 hover:text-red-500"
              startContent={<Trash2 className="w-4 h-4" />}
            >
              Limpiar favoritos
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default WishlistDrawer;
