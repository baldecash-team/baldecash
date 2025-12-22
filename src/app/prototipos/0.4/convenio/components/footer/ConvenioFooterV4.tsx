'use client';

/**
 * ConvenioFooterV4 - Footer con Mapa y Contacto
 * Version: V4 - Incluye información de contacto y ubicación
 */

import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { ConvenioFooterProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioFooterV4: React.FC<ConvenioFooterProps> = ({ convenio }) => {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <img
              src={BALDECASH_LOGO}
              alt="BaldeCash"
              className="h-8 mb-6"
            />
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#4654CD] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-300">Av. La Marina 2468</p>
                  <p className="text-sm text-neutral-400">San Miguel, Lima</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#4654CD] flex-shrink-0" />
                <p className="text-sm text-neutral-300">(01) 123-4567</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#4654CD] flex-shrink-0" />
                <p className="text-sm text-neutral-300">hola@baldecash.com</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#4654CD] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-300">Lun - Vie: 9am - 6pm</p>
                  <p className="text-sm text-neutral-400">Sáb: 9am - 1pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Catálogo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Convenios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reclamaciones</a></li>
              </ul>
            </div>
          </div>

          {/* Map placeholder */}
          <div>
            <div className="bg-neutral-800 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                <p className="text-neutral-500 text-sm">Mapa interactivo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>© 2024 Balde K S.A.C. Todos los derechos reservados.</p>
          <p>Convenio exclusivo para estudiantes de {convenio.nombreCorto}</p>
        </div>
      </div>
    </footer>
  );
};

export default ConvenioFooterV4;
