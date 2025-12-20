'use client';

/**
 * ConvenioFaqV6 - Chatbot conversacional style
 * Version: V6 - FAQ en formato de conversación tipo chat
 */

import React, { useState } from 'react';
import { Card, CardBody, Button, Input } from '@nextui-org/react';
import { MessageCircle, Send, User, Bot, ChevronRight } from 'lucide-react';
import { ConvenioFaqProps } from '../../types/convenio';
import { getFaqsByConvenio } from '../../data/mockConvenioData';

export const ConvenioFaqV6: React.FC<ConvenioFaqProps> = ({
  convenio,
  faqs,
}) => {
  const faqsList = faqs || getFaqsByConvenio(convenio);
  const [selectedFaq, setSelectedFaq] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  const selectedFaqData = faqsList.find((f) => f.id === selectedFaq);

  const popularQuestions = faqsList.slice(0, 4);

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${convenio.colorPrimario}15` }}
          >
            <MessageCircle
              className="w-8 h-8"
              style={{ color: convenio.colorPrimario }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
            ¿En qué podemos ayudarte?
          </h2>
          <p className="text-neutral-600">
            Selecciona una pregunta o escríbenos directamente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Questions panel */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-500 mb-2">Preguntas frecuentes:</p>
            {popularQuestions.map((faq) => (
              <button
                key={faq.id}
                onClick={() => setSelectedFaq(faq.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedFaq === faq.id
                    ? 'border-[#4654CD] bg-[#4654CD]/5'
                    : 'border-neutral-200 hover:border-[#4654CD]/30 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-neutral-800 text-sm">
                    {faq.pregunta}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      selectedFaq === faq.id ? 'rotate-90 text-[#4654CD]' : 'text-neutral-400'
                    }`}
                  />
                </div>
              </button>
            ))}

            {/* More questions link */}
            <button
              className="w-full text-center text-sm text-[#4654CD] hover:underline cursor-pointer py-2"
              onClick={() => {
                // Could expand to show all questions
              }}
            >
              Ver más preguntas ({faqsList.length})
            </button>
          </div>

          {/* Chat panel */}
          <Card className="border border-neutral-200 h-[400px] flex flex-col">
            <CardBody className="p-0 flex flex-col h-full">
              {/* Chat header */}
              <div
                className="p-4 text-white flex items-center gap-3"
                style={{ backgroundColor: convenio.colorPrimario }}
              >
                <Bot className="w-6 h-6" />
                <div>
                  <p className="font-medium">Asistente {convenio.nombreCorto}</p>
                  <p className="text-xs text-white/70">En línea</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-neutral-50 space-y-4">
                {/* Bot greeting */}
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: convenio.colorPrimario }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
                    <p className="text-sm text-neutral-600">
                      ¡Hola! Soy tu asistente virtual. Selecciona una pregunta de la izquierda o escríbeme tu duda.
                    </p>
                  </div>
                </div>

                {/* Selected question */}
                {selectedFaqData && (
                  <>
                    {/* User question */}
                    <div className="flex gap-3 justify-end">
                      <div className="bg-[#4654CD] text-white rounded-xl rounded-tr-none p-3 max-w-[80%]">
                        <p className="text-sm">{selectedFaqData.pregunta}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-neutral-600" />
                      </div>
                    </div>

                    {/* Bot answer */}
                    <div className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: convenio.colorPrimario }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
                        <p className="text-sm text-neutral-600">{selectedFaqData.respuesta}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Chat input */}
              <div className="p-3 border-t border-neutral-100 bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe tu pregunta..."
                    value={customQuestion}
                    onValueChange={setCustomQuestion}
                    classNames={{
                      inputWrapper: 'bg-neutral-50 border-none h-10',
                      input: 'text-sm',
                    }}
                  />
                  <Button
                    isIconOnly
                    className="cursor-pointer"
                    style={{ backgroundColor: convenio.colorPrimario }}
                    onPress={() => {
                      // Would send to WhatsApp
                      window.open(`https://wa.me/51999999999?text=${encodeURIComponent(customQuestion)}`, '_blank');
                    }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </div>
                <p className="text-xs text-neutral-400 mt-2 text-center">
                  Las consultas personalizadas se envían por WhatsApp
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ConvenioFaqV6;
