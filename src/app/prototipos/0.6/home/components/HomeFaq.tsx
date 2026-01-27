'use client';

/**
 * HomeFaq v0.6 - Preguntas frecuentes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Percent, UserCheck, Clock, Truck, HelpCircle, CreditCard } from 'lucide-react';

interface HomeFaqProps {
  primaryColor?: string;
}

const faqs = [
  {
    id: '1',
    categoria: 'verificacion',
    pregunta: '¿Qué requisitos necesito para solicitar financiamiento?',
    respuesta: 'Solo necesitas ser estudiante universitario activo en Perú, tener tu DNI vigente y una constancia de estudios. No pedimos aval ni historial crediticio previo.',
  },
  {
    id: '2',
    categoria: 'proceso',
    pregunta: '¿Cuánto tiempo toma la aprobación?',
    respuesta: 'El proceso es 100% digital. Una vez envíes tu solicitud completa, recibirás una respuesta en menos de 24 horas hábiles.',
  },
  {
    id: '3',
    categoria: 'descuento',
    pregunta: '¿Cuál es la tasa de interés?',
    respuesta: 'Manejamos una TEA preferencial para estudiantes que varía según el plazo elegido. Puedes simular tu cuota exacta en nuestra calculadora antes de aplicar.',
  },
  {
    id: '4',
    categoria: 'pago',
    pregunta: '¿Cómo pago mis cuotas mensuales?',
    respuesta: 'Puedes pagar desde cualquier banco o billetera digital (Yape, Plin). Te enviamos recordatorios antes de cada fecha de vencimiento.',
  },
  {
    id: '5',
    categoria: 'entrega',
    pregunta: '¿Cuánto demora la entrega de mi laptop?',
    respuesta: 'Una vez aprobado tu financiamiento, coordinamos la entrega en 3-5 días hábiles para Lima. Para provincias, el tiempo varía según la ubicación.',
  },
  {
    id: '6',
    categoria: 'general',
    pregunta: '¿Qué pasa si no puedo pagar una cuota?',
    respuesta: 'Contáctanos antes de la fecha de vencimiento. Podemos evaluar opciones como reprogramación de pago. Siempre es mejor comunicarte con nosotros.',
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  descuento: Percent,
  verificacion: UserCheck,
  proceso: Clock,
  entrega: Truck,
  pago: CreditCard,
  general: HelpCircle,
};

export const HomeFaq: React.FC<HomeFaqProps> = ({ primaryColor = '#4654CD' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 md:py-24 bg-neutral-50 scroll-mt-24">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']"
            style={{ color: primaryColor }}
          >
            Preguntas frecuentes
          </h2>
          <p className="text-neutral-600">
            Resolvemos tus dudas sobre el financiamiento
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const Icon = categoryIcons[faq.categoria] || HelpCircle;
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <span className="flex-1 font-medium text-neutral-800">
                    {faq.pregunta}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pl-[4.5rem]">
                        <p className="text-neutral-600 leading-relaxed">
                          {faq.respuesta}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeFaq;
