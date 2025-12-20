'use client';

/**
 * FaqSectionV6 - Chatbot Style
 * Estilo conversacional con burbujas de chat
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Avatar } from '@nextui-org/react';
import { MessageCircle, Send, HelpCircle, ChevronLeft } from 'lucide-react';
import { FaqSectionProps } from '../../../types/hero';
import { mockFaqData } from '../../../data/mockHeroData';

export const FaqSectionV6: React.FC<FaqSectionProps> = ({ data = mockFaqData }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<
    { type: 'question' | 'answer'; content: string }[]
  >([]);

  const handleQuestionClick = (item: { question: string; answer: string }) => {
    setSelectedQuestion(item.question);
    setChatHistory((prev) => [
      ...prev,
      { type: 'question', content: item.question },
      { type: 'answer', content: item.answer },
    ]);
  };

  const resetChat = () => {
    setChatHistory([]);
    setSelectedQuestion(null);
  };

  const availableQuestions = data.items.filter(
    (item) => !chatHistory.some((h) => h.content === item.question)
  );

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#4654CD] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" />
            <span>Asistente BaldeCash</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 font-['Baloo_2']">
            Tienes dudas?
          </h2>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden"
        >
          {/* Chat Header */}
          <div className="bg-[#4654CD] px-4 py-3 flex items-center gap-3">
            <Avatar
              src=""
              fallback={<HelpCircle className="w-5 h-5" />}
              classNames={{
                base: 'bg-white/20',
                fallback: 'text-white',
              }}
              size="sm"
            />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Asistente BaldeCash</p>
              <p className="text-white/70 text-xs">En linea</p>
            </div>
            {chatHistory.length > 0 && (
              <Button
                size="sm"
                radius="lg"
                variant="light"
                startContent={<ChevronLeft className="w-4 h-4" />}
                onPress={resetChat}
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                Reiniciar
              </Button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-neutral-50/50">
            {/* Welcome message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 mb-4"
            >
              <Avatar
                src=""
                fallback={<HelpCircle className="w-4 h-4" />}
                classNames={{
                  base: 'bg-[#4654CD] flex-shrink-0',
                  fallback: 'text-white',
                }}
                size="sm"
              />
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-neutral-100 max-w-[80%]">
                <p className="text-neutral-700 text-sm">
                  Hola! Soy el asistente de BaldeCash. Selecciona una pregunta para ayudarte.
                </p>
              </div>
            </motion.div>

            {/* Chat History */}
            <AnimatePresence>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-2 mb-4 ${
                    message.type === 'question' ? 'justify-end' : ''
                  }`}
                >
                  {message.type === 'answer' && (
                    <Avatar
                      src=""
                      fallback={<HelpCircle className="w-4 h-4" />}
                      classNames={{
                        base: 'bg-[#4654CD] flex-shrink-0',
                        fallback: 'text-white',
                      }}
                      size="sm"
                    />
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      message.type === 'question'
                        ? 'bg-[#4654CD] text-white rounded-tr-none'
                        : 'bg-white shadow-sm border border-neutral-100 rounded-tl-none'
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.type === 'question' ? 'text-white' : 'text-neutral-700'
                      }`}
                    >
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick Questions */}
          <div className="p-4 border-t border-neutral-200 bg-white">
            {availableQuestions.length > 0 ? (
              <>
                <p className="text-xs text-neutral-500 mb-3">
                  Preguntas sugeridas ({availableQuestions.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableQuestions.slice(0, 4).map((item) => (
                    <Button
                      key={item.id}
                      size="sm"
                      radius="lg"
                      variant="bordered"
                      onPress={() => handleQuestionClick(item)}
                      className="border-neutral-200 text-neutral-700 hover:border-[#4654CD] hover:text-[#4654CD] text-left h-auto py-2 px-3 cursor-pointer"
                    >
                      <span className="line-clamp-1 text-xs">{item.question}</span>
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-neutral-500 mb-2">
                  Has visto todas las preguntas
                </p>
                <Button
                  size="sm"
                  radius="lg"
                  variant="flat"
                  onPress={resetChat}
                  className="bg-[#4654CD]/10 text-[#4654CD] cursor-pointer"
                >
                  Empezar de nuevo
                </Button>
              </div>
            )}
          </div>

          {/* Input Area (decorativo) */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50">
            <div className="flex items-center gap-2 bg-white rounded-full border border-neutral-200 px-4 py-2">
              <input
                type="text"
                placeholder="Escribe tu pregunta..."
                disabled
                className="flex-1 bg-transparent text-sm text-neutral-400 outline-none cursor-not-allowed"
              />
              <Button
                isIconOnly
                size="sm"
                radius="full"
                isDisabled
                className="bg-[#4654CD] text-white cursor-not-allowed opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-neutral-400 text-center mt-2">
              Por ahora solo preguntas sugeridas • Pronto chat en vivo
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSectionV6;
