'use client';

/**
 * ConvenioFooterV3 - Footer con Newsletter
 * Version: V3 - Incluye suscripción a newsletter
 */

import React, { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { Mail, ArrowRight } from 'lucide-react';
import { ConvenioFooterProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioFooterV3: React.FC<ConvenioFooterProps> = ({ convenio }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold mb-2 font-['Baloo_2']">
                Recibe ofertas exclusivas
              </h3>
              <p className="text-neutral-400 text-sm">
                Suscríbete y recibe descuentos especiales para estudiantes de {convenio.nombreCorto}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-neutral-400" />}
                classNames={{
                  base: 'flex-1',
                  inputWrapper: 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700',
                  input: 'text-white placeholder:text-neutral-500',
                }}
              />
              <Button
                className="bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3] transition-colors"
                onPress={handleSubscribe}
                isIconOnly={false}
              >
                {subscribed ? '¡Suscrito!' : <ArrowRight className="w-5 h-5" />}
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
          <p>© 2024 Balde K S.A.C. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default ConvenioFooterV3;
