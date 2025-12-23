'use client';

/**
 * ConvenioFooterV6 - Footer con App Download CTA
 * Version: V6 - Promociona descarga de app móvil
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Smartphone, Apple, Play } from 'lucide-react';
import { ConvenioFooterProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioFooterV6: React.FC<ConvenioFooterProps> = ({ convenio }) => {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* App Download Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4654CD] to-[#03DBD0] flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 font-['Baloo_2']">
                  Descarga nuestra app
                </h3>
                <p className="text-neutral-400 text-sm">
                  Gestiona tus pagos y sigue tu pedido desde tu celular
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <Button
                className="bg-white text-neutral-900 font-medium cursor-pointer hover:bg-neutral-100 transition-colors"
                startContent={<Apple className="w-5 h-5" />}
              >
                App Store
              </Button>
              <Button
                className="bg-white text-neutral-900 font-medium cursor-pointer hover:bg-neutral-100 transition-colors"
                startContent={<Play className="w-5 h-5" />}
              >
                Google Play
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo */}
          <div>
            <img
              src={BALDECASH_LOGO}
              alt="BaldeCash"
              className="h-8 mb-4"
            />
            <p className="text-neutral-400 text-sm">
              Financiamiento para estudiantes
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Cómo funciona</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Catálogo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Convenios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Libro de reclamaciones</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
          <p>© 2024 Balde K S.A.C. • Convenio exclusivo {convenio.nombreCorto}</p>
        </div>
      </div>
    </footer>
  );
};

export default ConvenioFooterV6;
