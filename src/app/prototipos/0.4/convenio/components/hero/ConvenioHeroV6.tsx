'use client';

/**
 * ConvenioHeroV6 - Hero con Carrusel de Equipos
 * Version: V6 - Muestra productos destacados con precio convenio
 */

import React, { useState } from 'react';
import { Button, Card, CardBody, Chip } from '@nextui-org/react';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ConvenioHeroProps } from '../../types/convenio';
import { productosDestacados, calcularCuotaConDescuento } from '../../data/mockConvenioData';

export const ConvenioHeroV6: React.FC<ConvenioHeroProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const productos = productosDestacados.filter((p) => p.destacado).slice(0, 4);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % productos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + productos.length) % productos.length);
  };

  return (
    <div className="bg-[#4654CD] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-white/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center text-white mb-10">
          {/* Co-branded logos */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-white/95 rounded-lg px-3 py-2">
              <img
                src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
                alt="BaldeCash"
                className="h-8 object-contain"
              />
            </div>
            <span className="text-white/70 text-xl font-light">×</span>
            <div className="bg-white/95 rounded-lg px-3 py-2">
              <img
                src={convenio.logo}
                alt={convenio.nombre}
                className="h-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.parentElement!.style.display = 'none';
                }}
              />
            </div>
          </div>

          <Chip
            radius="sm"
            classNames={{
              base: 'px-3 py-1 h-auto mb-4',
              content: 'text-white text-xs font-medium',
            }}
            style={{ backgroundColor: convenio.colorPrimario }}
          >
            {convenio.descuentoCuota}% de descuento exclusivo
          </Chip>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-['Baloo_2']">
            Equipos destacados para {convenio.nombreCorto}
          </h1>

          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Todos los precios incluyen tu descuento por convenio. Elige el equipo que mejor
            se adapte a tus necesidades.
          </p>
        </div>

        {/* Products carousel */}
        <div className="relative">
          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors hidden md:flex"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productos.map((producto, index) => {
              const cuotaConDescuento = calcularCuotaConDescuento(
                producto.cuotaMensual,
                convenio.descuentoCuota
              );
              const ahorro = producto.cuotaMensual - cuotaConDescuento;

              return (
                <Card
                  key={producto.id}
                  className="bg-white cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                  isPressable
                >
                  <CardBody className="p-4">
                    {/* Discount badge */}
                    <Chip
                      size="sm"
                      radius="sm"
                      classNames={{
                        base: 'absolute top-2 left-2 z-10 px-2 py-0.5 h-auto',
                        content: 'text-white text-xs font-medium',
                      }}
                      style={{ backgroundColor: convenio.colorPrimario }}
                    >
                      -{convenio.descuentoCuota}%
                    </Chip>

                    {/* Product image */}
                    <div className="relative mb-4">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-32 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop';
                        }}
                      />
                    </div>

                    {/* Product info */}
                    <p className="text-xs text-neutral-500 mb-1">{producto.marca}</p>
                    <h3 className="font-semibold text-neutral-800 text-sm mb-3 line-clamp-2">
                      {producto.nombre}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-3 h-3 fill-amber-400 text-amber-400"
                        />
                      ))}
                      <span className="text-xs text-neutral-500 ml-1">(4.8)</span>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <p className="text-neutral-400 line-through text-sm">
                        S/{producto.cuotaMensual}/mes
                      </p>
                      <p className="text-xl font-bold text-[#4654CD] font-['Baloo_2']">
                        S/{cuotaConDescuento}/mes
                      </p>
                      <Chip
                        size="sm"
                        radius="sm"
                        classNames={{
                          base: 'bg-[#03DBD0]/10 px-2 py-0.5 h-auto',
                          content: 'text-[#03DBD0] text-xs font-medium',
                        }}
                      >
                        Ahorras S/{ahorro}/mes
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Dots indicator (mobile) */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {productos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                  currentIndex === index ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Button
            size="lg"
            className="bg-white text-[#4654CD] font-bold rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors"
            endContent={<ArrowRight className="w-5 h-5" />}
            onPress={onVerEquipos}
          >
            Ver todos los equipos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConvenioHeroV6;
