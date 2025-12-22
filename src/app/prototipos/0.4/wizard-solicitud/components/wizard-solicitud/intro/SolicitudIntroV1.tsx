'use client';

/**
 * SolicitudIntroV1 - Intro dinamico
 * Responde a config.headerVersion, heroVersion, ctaVersion
 * Cada seccion tiene 6 variantes visuales MUY DIFERENCIABLES
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Clock, Shield, CheckCircle, ArrowRight, Zap, Star, Sparkles, MessageCircle, Rocket, Gift, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WizardSolicitudConfig, SelectedProduct } from '../../../types/wizard-solicitud';

const BALDI_IMAGE = 'https://storage.googleapis.com/storage.botmaker.com/public/res/baldecash/20231006-v5kUqtWC54hBNKGTh66ZRy1bd7T2-KU0KM-.png';
const LOGO_URL = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

interface SolicitudIntroV1Props {
  config: WizardSolicitudConfig;
  selectedProduct?: SelectedProduct;
  onStart: () => void;
}

// ============================================
// B.1 HEADER VARIANTS - MUY DIFERENCIABLES
// ============================================

// V1: Ultra minimalista - Solo texto centrado
const HeaderV1 = () => (
  <div className="px-4 py-6 bg-white">
    <p className="text-center text-sm font-medium text-neutral-500 uppercase tracking-widest">
      Solicitud de financiamiento
    </p>
  </div>
);

// V2: Producto prominente con fondo de color
const HeaderV2 = ({ product }: { product: SelectedProduct }) => (
  <div className="bg-gradient-to-r from-[#4654CD] to-[#5B68E3] px-4 py-4">
    <div className="max-w-lg mx-auto flex items-center gap-4">
      <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-lg p-2">
        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain" />
      </div>
      <div className="text-white">
        <p className="font-bold text-lg">{product.name}</p>
        <p className="text-white/80 text-sm">S/{product.monthlyQuota}/mes x {product.months} meses</p>
      </div>
    </div>
  </div>
);

// V3: Steps progress con iconos
const HeaderV3 = ({ product }: { product: SelectedProduct }) => (
  <div className="bg-white border-b-2 border-[#4654CD]/10 px-4 py-3">
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-2">
        <img src={LOGO_URL} alt="BaldeCash" className="h-6 object-contain" />
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((step, i) => (
            <React.Fragment key={step}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-[#4654CD] text-white' : 'bg-neutral-200 text-neutral-400'
              }`}>
                {step}
              </div>
              {i < 3 && <div className="w-4 h-0.5 bg-neutral-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[#4654CD]/5 rounded-lg p-2">
        <img src={product.thumbnail} alt={product.name} className="w-10 h-10 object-contain" />
        <span className="text-sm font-medium text-neutral-700 truncate">{product.name}</span>
        <span className="ml-auto text-sm font-bold text-[#4654CD]">S/{product.monthlyQuota}/mes</span>
      </div>
    </div>
  </div>
);

// V4: Dark mode con acento neon
const HeaderV4 = ({ product }: { product: SelectedProduct }) => (
  <div className="bg-[#151744] px-4 py-4">
    <div className="max-w-lg mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#03DBD0]/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#03DBD0]" />
        </div>
        <div>
          <p className="text-white font-semibold">{product.name}</p>
          <p className="text-[#03DBD0] text-sm font-medium">S/{product.monthlyQuota}/mes</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white/40 text-xs">Tiempo restante</p>
        <p className="text-white font-mono">~5:00</p>
      </div>
    </div>
  </div>
);

// V5: Split moderno - logo izquierda grande, info derecha
const HeaderV5 = ({ product }: { product: SelectedProduct }) => (
  <div className="bg-white shadow-sm px-4 py-4">
    <div className="max-w-lg mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#4654CD] rounded-2xl flex items-center justify-center">
          <span className="text-white text-2xl font-black">B</span>
        </div>
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Financiamiento</p>
          <p className="font-bold text-neutral-800">BaldeCash</p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-neutral-50 rounded-xl px-3 py-2">
        <img src={product.thumbnail} alt={product.name} className="w-10 h-10 object-contain" />
        <div className="text-right">
          <p className="text-xs text-neutral-500 truncate max-w-[100px]">{product.name}</p>
          <p className="font-bold text-[#4654CD]">S/{product.monthlyQuota}</p>
        </div>
      </div>
    </div>
  </div>
);

// V6: Bold gigante centrado
const HeaderV6 = () => (
  <div className="bg-[#4654CD] px-4 py-10">
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-white/60 text-sm uppercase tracking-widest mb-2">Bienvenido a</p>
        <h1 className="text-white text-4xl md:text-5xl font-black">BaldeCash</h1>
        <p className="text-[#03DBD0] text-lg mt-2">Tu laptop a cuotas fijas</p>
      </motion.div>
    </div>
  </div>
);

// ============================================
// B.5 HERO VARIANTS - MUY DIFERENCIABLES
// ============================================

// V1: Foto del producto simple y limpia
const HeroV1 = ({ product }: { product?: SelectedProduct }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="w-72 h-56 mb-6 bg-white rounded-2xl overflow-hidden shadow-xl border border-neutral-100"
  >
    {product ? (
      <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-6" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-neutral-50">
        <span className="text-neutral-300 text-4xl">💻</span>
      </div>
    )}
  </motion.div>
);

// V2: Dashboard fintech con metricas animadas
const HeroV2 = () => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="w-80 mb-6"
  >
    {/* Card principal estilo dashboard */}
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-[#4654CD] to-[#5B68E3] px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">BaldeCash</span>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Pre-aprobado</p>
            <p className="text-[#03DBD0] font-bold">S/ 5,000</p>
          </div>
        </div>
      </div>
      {/* Metricas */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="w-10 h-10 mx-auto mb-1 bg-[#4654CD]/10 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-[#4654CD]" />
          </div>
          <p className="text-lg font-bold text-neutral-800">0%</p>
          <p className="text-xs text-neutral-500">Inicial</p>
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-10 h-10 mx-auto mb-1 bg-[#03DBD0]/10 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-[#03DBD0]" />
          </div>
          <p className="text-lg font-bold text-neutral-800">12</p>
          <p className="text-xs text-neutral-500">Cuotas</p>
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="w-10 h-10 mx-auto mb-1 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#22c55e]" />
          </div>
          <p className="text-lg font-bold text-neutral-800">24h</p>
          <p className="text-xs text-neutral-500">Respuesta</p>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

// V3: Baldi mascota con burbuja de chat
const HeroV3 = () => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="mb-6 flex items-end gap-2"
  >
    <div className="w-32 h-32 relative">
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain drop-shadow-lg" />
      </motion.div>
    </div>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
      className="bg-white rounded-2xl rounded-bl-sm shadow-lg p-4 max-w-[200px] border border-neutral-100"
    >
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-4 h-4 text-[#4654CD]" />
        <span className="text-xs text-[#4654CD] font-medium">Baldi dice:</span>
      </div>
      <p className="text-sm text-neutral-700">"Hola! Te ayudo con tu solicitud en solo 5 minutos 🎉"</p>
    </motion.div>
  </motion.div>
);

// V4: Timeline de proceso con pasos animados
const HeroV4 = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-80 mb-6"
  >
    <div className="bg-gradient-to-br from-[#151744] to-[#1e2158] rounded-2xl p-5 shadow-2xl border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[#03DBD0]/20 rounded-xl flex items-center justify-center">
          <Rocket className="w-5 h-5 text-[#03DBD0]" />
        </div>
        <div>
          <p className="text-white font-bold">Proceso Express</p>
          <p className="text-white/50 text-xs">Solo 4 pasos simples</p>
        </div>
      </div>
      {/* Timeline vertical */}
      <div className="space-y-3">
        {[
          { icon: '1', label: 'Datos personales', done: false },
          { icon: '2', label: 'Info academica', done: false },
          { icon: '3', label: 'Documentos', done: false },
          { icon: '4', label: 'Confirmacion', done: false },
        ].map((step, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-7 h-7 bg-[#4654CD] rounded-full flex items-center justify-center text-xs font-bold text-white">
              {step.icon}
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#4654CD] to-transparent" />
            <span className="text-white/70 text-sm">{step.label}</span>
          </motion.div>
        ))}
      </div>
      {/* Timer */}
      <div className="mt-4 flex items-center justify-center gap-2 bg-white/5 rounded-lg py-2">
        <Clock className="w-4 h-4 text-[#03DBD0]" />
        <span className="text-[#03DBD0] font-mono text-sm">~5:00 minutos</span>
      </div>
    </div>
  </motion.div>
);

// V5: Card con Baldi como asistente y producto destacado
const HeroV5 = ({ product }: { product?: SelectedProduct }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="w-80 mb-6"
  >
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
      {/* Top: Producto destacado */}
      {product && (
        <div className="bg-gradient-to-r from-neutral-50 to-white p-4 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-xl shadow-sm p-2 flex-shrink-0">
              <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-neutral-800 truncate">{product.name}</p>
              <p className="text-2xl font-black text-[#4654CD]">S/{product.monthlyQuota}<span className="text-sm font-normal text-neutral-500">/mes</span></p>
              <p className="text-xs text-neutral-400">x {product.months} meses</p>
            </div>
          </div>
        </div>
      )}
      {/* Bottom: Baldi como asistente */}
      <div className="p-4 bg-[#4654CD]/5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-14 h-14 flex-shrink-0"
          >
            <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain" />
          </motion.div>
          <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-[#4654CD] font-medium mb-0.5">Tu asistente Baldi</p>
            <p className="text-sm text-neutral-600">Te guiare en cada paso del proceso</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// V6: Reward unlocked - estilo celebracion/gamificado
const HeroV6 = ({ product }: { product?: SelectedProduct }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', bounce: 0.3 }}
    className="w-80 mb-6"
  >
    {/* Card principal con efecto 3D */}
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#4654CD]/20 via-[#03DBD0]/20 to-[#4654CD]/20 rounded-3xl blur-2xl" />

      {/* Card */}
      <div className="relative bg-gradient-to-br from-[#4654CD] to-[#3A47B8] rounded-2xl overflow-hidden shadow-2xl">
        {/* Confetti decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [0, 100], opacity: [1, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2 + i * 0.3,
                delay: i * 0.2,
                ease: 'linear'
              }}
              className={`absolute w-2 h-2 rounded-full ${
                i % 3 === 0 ? 'bg-[#03DBD0]' : i % 3 === 1 ? 'bg-[#22c55e]' : 'bg-white/50'
              }`}
              style={{ left: `${10 + i * 12}%`, top: '-10%' }}
            />
          ))}
        </div>

        {/* Header con icono de celebracion */}
        <div className="relative px-5 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center"
              >
                <Gift className="w-6 h-6 text-[#03DBD0]" />
              </motion.div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Oferta especial</p>
                <p className="text-white font-bold">Pre-aprobado</p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Sparkles className="w-6 h-6 text-[#03DBD0]" />
            </motion.div>
          </div>
        </div>

        {/* Producto destacado */}
        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-xl p-2 shadow-lg">
              {product ? (
                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">💻</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm truncate">{product?.name || 'Tu laptop ideal'}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">S/{product?.monthlyQuota || '149'}</span>
                <span className="text-white/60 text-sm">/mes</span>
              </div>
              <p className="text-[#03DBD0] text-xs font-medium mt-1">x {product?.months || 12} cuotas sin inicial</p>
            </div>
          </div>
        </div>

        {/* Footer con Baldi mini */}
        <div className="relative px-5 pb-4 flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-10 h-10 flex-shrink-0"
          >
            <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain" />
          </motion.div>
          <div className="flex-1 bg-white/10 rounded-full px-3 py-1.5">
            <p className="text-white/90 text-xs">Listo para ayudarte!</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// ============================================
// B.6 CTA VARIANTS - MUY DIFERENCIABLES
// ============================================

// V1: Boton simple y limpio
const CtaV1 = ({ onStart }: { onStart: () => void }) => (
  <Button
    size="lg"
    className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-semibold px-10 py-6 text-lg rounded-xl"
    endContent={<ArrowRight className="w-5 h-5" />}
    onPress={onStart}
  >
    Empezar solicitud
  </Button>
);

// V2: Boton + badges de confianza horizontales
const CtaV2 = ({ onStart }: { onStart: () => void }) => (
  <div className="w-full max-w-sm">
    <Button
      size="lg"
      className="w-full bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold py-7 text-lg rounded-xl mb-4"
      endContent={<ArrowRight className="w-5 h-5" />}
      onPress={onStart}
    >
      Empezar solicitud
    </Button>
    <div className="flex items-center justify-center gap-6 text-sm">
      <div className="flex items-center gap-1.5 text-neutral-500">
        <Shield className="w-4 h-4 text-[#22c55e]" />
        <span>Datos seguros</span>
      </div>
      <div className="w-px h-4 bg-neutral-200" />
      <div className="flex items-center gap-1.5 text-neutral-500">
        <CheckCircle className="w-4 h-4 text-[#22c55e]" />
        <span>Sin compromiso</span>
      </div>
    </div>
  </div>
);

// V3: Card completa con Baldi, tiempo estimado y boton
const CtaV3 = ({ onStart }: { onStart: () => void }) => (
  <Card className="w-full max-w-sm border-2 border-[#4654CD]/20 shadow-2xl overflow-visible">
    <CardBody className="p-0">
      <div className="relative bg-gradient-to-r from-[#4654CD]/5 to-[#03DBD0]/5 p-5 border-b border-neutral-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-full shadow-md p-1 -mt-10">
            <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-neutral-800">Solicitud express</p>
            <p className="text-sm text-neutral-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Solo 5 minutos
            </p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex gap-2 mb-4">
          {['Sin inicial', 'Cuotas fijas', '24h respuesta'].map((item, i) => (
            <span key={i} className="flex-1 text-center text-xs bg-[#22c55e]/10 text-[#22c55e] font-medium py-1.5 rounded-lg">
              {item}
            </span>
          ))}
        </div>
        <Button
          size="lg"
          className="w-full bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold py-6 rounded-xl"
          endContent={<ArrowRight className="w-5 h-5" />}
          onPress={onStart}
        >
          Comenzar ahora
        </Button>
      </div>
    </CardBody>
  </Card>
);

// V4: Boton gigante con shadow de color y efecto hover
const CtaV4 = ({ onStart }: { onStart: () => void }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Button
      size="lg"
      className="bg-gradient-to-r from-[#4654CD] to-[#5B68E3] text-white font-black px-12 py-8 text-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(70,84,205,0.5)]"
      endContent={<Zap className="w-6 h-6" />}
      onPress={onStart}
    >
      SOLICITAR AHORA
    </Button>
  </motion.div>
);

// V5: Fixed bottom sticky bar con gradiente
const CtaV5 = ({ onStart }: { onStart: () => void }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/80 backdrop-blur-sm px-4 py-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
    <div className="max-w-lg mx-auto">
      <Button
        size="lg"
        className="w-full bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold py-7 rounded-xl"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onStart}
      >
        Empezar solicitud
      </Button>
      <p className="text-center text-xs text-neutral-400 mt-2 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" /> Tus datos estan protegidos
      </p>
    </div>
  </div>
);

// V6: Boton XL fullwidth con animacion de brillo
const CtaV6 = ({ onStart }: { onStart: () => void }) => (
  <motion.div
    className="w-full max-w-md relative overflow-hidden"
    whileHover={{ scale: 1.01 }}
  >
    <Button
      size="lg"
      className="w-full bg-[#4654CD] text-white font-black py-10 text-2xl rounded-2xl relative overflow-hidden"
      onPress={onStart}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      />
      <span className="relative z-10 flex items-center gap-3">
        COMENZAR
        <ArrowRight className="w-7 h-7" />
      </span>
    </Button>
  </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const SolicitudIntroV1: React.FC<SolicitudIntroV1Props> = ({
  config,
  selectedProduct,
  onStart,
}) => {
  // Detectar si estamos en modo oscuro (Layout V4)
  const isDarkMode = config.wizardLayoutVersion === 4;

  const renderHeader = () => {
    if (!selectedProduct && ![1, 6].includes(config.headerVersion)) {
      return <HeaderV1 />;
    }
    switch (config.headerVersion) {
      case 1: return <HeaderV1 />;
      case 2: return selectedProduct ? <HeaderV2 product={selectedProduct} /> : <HeaderV1 />;
      case 3: return selectedProduct ? <HeaderV3 product={selectedProduct} /> : <HeaderV1 />;
      case 4: return selectedProduct ? <HeaderV4 product={selectedProduct} /> : <HeaderV1 />;
      case 5: return selectedProduct ? <HeaderV5 product={selectedProduct} /> : <HeaderV1 />;
      case 6: return <HeaderV6 />;
      default: return <HeaderV1 />;
    }
  };

  const renderHero = () => {
    switch (config.heroVersion) {
      case 1: return <HeroV1 product={selectedProduct} />;
      case 2: return <HeroV2 />;
      case 3: return <HeroV3 />;
      case 4: return <HeroV4 />;
      case 5: return <HeroV5 product={selectedProduct} />;
      case 6: return <HeroV6 product={selectedProduct} />;
      default: return <HeroV1 product={selectedProduct} />;
    }
  };

  const renderCta = () => {
    switch (config.ctaVersion) {
      case 1: return <CtaV1 onStart={onStart} />;
      case 2: return <CtaV2 onStart={onStart} />;
      case 3: return <CtaV3 onStart={onStart} />;
      case 4: return <CtaV4 onStart={onStart} />;
      case 5: return <CtaV5 onStart={onStart} />;
      case 6: return <CtaV6 onStart={onStart} />;
      default: return <CtaV1 onStart={onStart} />;
    }
  };

  // Modo oscuro para Layout V4
  if (isDarkMode) {
    return (
      <div className="min-h-screen bg-[#151744] text-white relative overflow-hidden flex flex-col">
        {/* Fondo con shapes solidos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#4654CD]/20" />
          <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-[#03DBD0]/10" />
          <div className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full bg-[#4654CD]/15" />
        </div>

        {/* Header dark mode */}
        <header className="relative z-10 border-b border-white/10 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <img src={LOGO_URL} alt="BaldeCash" className="h-8 object-contain brightness-0 invert" />
            {selectedProduct && (
              <div className="text-right">
                <p className="text-sm font-medium text-white/90">{selectedProduct.name}</p>
                <p className="text-xs text-[#03DBD0]">S/{selectedProduct.monthlyQuota}/mes</p>
              </div>
            )}
          </div>
        </header>

        {/* Contenido principal */}
        <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 ${config.ctaVersion === 5 ? 'pb-24' : ''}`}>
          {/* Hero dark mode */}
          <div className="w-64 h-48 mb-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
            {selectedProduct ? (
              <img src={selectedProduct.thumbnail} alt={selectedProduct.name} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center">
                <Zap className="w-12 h-12 text-[#03DBD0] mx-auto mb-2" />
                <p className="text-sm text-white/60">Tu laptop ideal</p>
              </div>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
            {[3, 5, 6].includes(config.heroVersion) ? 'Ya casi tienes tu laptop!' : 'Solicita tu laptop'}
          </h1>

          <div className="flex items-center gap-2 text-white/60 mb-6">
            <Clock className="w-4 h-4 text-[#03DBD0]" />
            <span className="text-sm">Solo 5 minutos</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md">
            {['Sin inicial', 'Cuotas fijas', 'Respuesta 24h'].map((text, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-[#03DBD0]/10 border border-[#03DBD0]/20 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#03DBD0]" />
                <span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="bg-[#03DBD0] hover:brightness-110 text-[#151744] font-bold px-8 py-6 text-lg"
            endContent={<ArrowRight className="w-5 h-5" />}
            onPress={onStart}
          >
            Empezar solicitud
          </Button>

          <div className="flex items-center gap-2 mt-6 text-xs text-white/40">
            <Shield className="w-4 h-4" />
            <span>Tus datos estan protegidos</span>
          </div>
        </div>
      </div>
    );
  }

  // Modo normal (light)
  const bgClass = [3, 5, 6].includes(config.heroVersion)
    ? 'bg-gradient-to-b from-[#4654CD]/5 to-white'
    : 'bg-neutral-50';

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col`}>
      {/* Header dinamico */}
      {renderHeader()}

      {/* Contenido principal */}
      <div className={`flex-1 flex flex-col items-center justify-center px-4 py-8 ${config.ctaVersion === 5 ? 'pb-28' : ''}`}>
        {/* Hero dinamico */}
        {renderHero()}

        {/* Titulo */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-neutral-900 mb-2">
          {[3, 5, 6].includes(config.heroVersion) ? 'Ya casi tienes tu laptop!' : 'Solicita tu laptop'}
        </h1>

        {/* Tiempo estimado */}
        <div className="flex items-center gap-2 text-neutral-600 mb-6">
          <Clock className="w-4 h-4 text-[#4654CD]" />
          <span className="text-sm">Solo 5 minutos</span>
        </div>

        {/* Beneficios */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md">
          {['Sin inicial', 'Cuotas fijas', 'Respuesta 24h'].map((text, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-[#22c55e]" />
              <span className="text-sm text-neutral-700">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA dinamico */}
        {renderCta()}

        {/* Trust (solo si CTA no lo tiene) */}
        {![2, 3, 5].includes(config.ctaVersion) && (
          <div className="flex items-center gap-2 mt-6 text-xs text-neutral-500">
            <Shield className="w-4 h-4" />
            <span>Tus datos estan protegidos</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudIntroV1;
