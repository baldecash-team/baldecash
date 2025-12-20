# Component Patterns - BaldeCash Web 3.0

Patrones de código aprobados para componentes comunes.

---

## 1. Patrón: Botones

> **IMPORTANTE**: Los botones NUNCA deben tener esquinas completamente rectas.
> Usar siempre `radius="md"` en NextUI o `rounded-lg` en Tailwind.

```tsx
// Botón Primario
<Button
  radius="md"
  className="bg-[#4654CD] text-white font-semibold hover:bg-[#3A45B0]"
  size="lg"
>
  Lo quiero
</Button>

// Botón Secundario
<Button
  radius="md"
  variant="bordered"
  className="border-[#4654CD] text-[#4654CD]"
>
  Ver detalles
</Button>

// Botón Ghost
<Button radius="md" variant="light" className="text-[#4654CD]">
  Regresar
</Button>

// Botón con icono
<Button
  radius="md"
  className="bg-[#4654CD] text-white"
  startContent={<ShoppingCart className="w-4 h-4" />}
>
  Agregar
</Button>

// Con Tailwind puro (si no usas NextUI)
<button className="rounded-lg bg-[#4654CD] text-white px-6 py-3">
  Botón
</button>
```

---

## 2. Patrón: Cards de Producto

```tsx
<Card className="border border-neutral-200 hover:border-[#4654CD]/50 transition-colors">
  <CardBody className="p-4">
    {/* Badges */}
    <div className="absolute top-2 left-2 flex gap-1">
      <Chip size="sm" className="bg-[#22c55e] text-white">
        Ahorras S/200
      </Chip>
    </div>
    
    {/* Imagen */}
    <img src={image} alt={name} className="w-full h-40 object-contain mb-4" />
    
    {/* Contenido */}
    <h3 className="font-semibold text-neutral-800 line-clamp-2 mb-2">
      {displayName}
    </h3>
    
    {/* CUOTA PROMINENTE */}
    <p className="text-2xl font-bold text-[#4654CD]">S/{lowestQuota}/mes</p>
    <p className="text-sm text-neutral-500">Precio total: S/{price}</p>
    
    {/* CTA */}
    <Button className="w-full mt-4 bg-[#4654CD] text-white font-semibold">
      Lo quiero
    </Button>
  </CardBody>
</Card>
```

---

## 3. Patrón: Inputs con Validación

```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-neutral-700">
    {label}
    {!required && <span className="text-neutral-400 ml-1">(Opcional)</span>}
  </label>
  
  <Input
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    placeholder={placeholder}
    classNames={{
      inputWrapper: `
        border-2 transition-colors
        ${error ? 'border-[#ef4444] bg-[#ef4444]/5' : ''}
        ${isValid ? 'border-[#22c55e]' : ''}
        ${isFocused ? 'border-[#4654CD]' : 'border-neutral-300'}
      `,
    }}
    endContent={
      <>
        {isValid && <Check className="w-5 h-5 text-[#22c55e]" />}
        {error && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
      </>
    }
  />
  
  {error && (
    <p className="text-sm text-[#ef4444] flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {error}
    </p>
  )}
</div>
```

---

## 4. Patrón: Progress Steps

```tsx
<div className="flex items-center justify-between w-full">
  {steps.map((step, index) => {
    const isCompleted = completedSteps.includes(index);
    const isCurrent = currentStep === index;
    
    return (
      <React.Fragment key={step.id}>
        <button
          onClick={() => isCompleted && onStepClick(index)}
          disabled={!isCompleted}
          className={`
            w-10 h-10 rounded-full font-semibold transition-all
            ${isCompleted ? 'bg-[#22c55e] text-white' : ''}
            ${isCurrent ? 'bg-[#4654CD] text-white ring-4 ring-[#4654CD]/20' : ''}
            ${!isCompleted && !isCurrent ? 'bg-neutral-200 text-neutral-500' : ''}
          `}
        >
          {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
        </button>
        
        {index < steps.length - 1 && (
          <div className={`flex-1 h-1 mx-2 rounded ${
            isCompleted ? 'bg-[#22c55e]' : 'bg-neutral-200'
          }`} />
        )}
      </React.Fragment>
    );
  })}
</div>
```

---

## 5. Patrón: Filtros

```tsx
// Rango de precio con slider
<div className="space-y-4">
  <div className="flex justify-between text-sm">
    <span>S/{minPrice}</span>
    <span>S/{maxPrice}</span>
  </div>
  <Slider
    minValue={0}
    maxValue={10000}
    step={100}
    value={[priceRange.min, priceRange.max]}
    onChange={setPriceRange}
    classNames={{
      track: 'bg-neutral-200',
      filledTrack: 'bg-[#4654CD]',
      thumb: 'bg-[#4654CD] border-2 border-white shadow-md',
    }}
  />
</div>

// Checkbox de filtro
<Checkbox
  isSelected={isSelected}
  onValueChange={onChange}
  classNames={{
    wrapper: 'group-data-[selected=true]:border-[#4654CD]',
    icon: 'text-[#4654CD]',
  }}
>
  <span className="flex items-center justify-between w-full">
    {label}
    <span className="text-neutral-400 text-sm">({count})</span>
  </span>
</Checkbox>
```

---

## 6. Patrón: Tooltips para Specs

```tsx
import { Tooltip } from '@nextui-org/react';
import { HelpCircle } from 'lucide-react';

const specTooltips = {
  ram: 'La RAM determina cuántas apps puedes tener abiertas. 8GB es suficiente para estudios, 16GB para diseño o gaming.',
  ssd: 'El SSD es el almacenamiento. 256GB para lo básico, 512GB si guardas muchos archivos.',
  gpu: 'La tarjeta gráfica. "Integrada" para estudios, "Dedicada" para diseño o gaming.',
  processor: 'El cerebro de la laptop. i5/Ryzen 5 para estudios, i7/Ryzen 7 para tareas pesadas.',
};

<Tooltip content={specTooltips.ram} placement="top">
  <span className="flex items-center gap-1 cursor-help">
    8GB RAM
    <HelpCircle className="w-4 h-4 text-neutral-400" />
  </span>
</Tooltip>
```

---

## 7. Patrón: Badges

```tsx
// Badge de descuento (verde)
<Chip size="sm" className="bg-[#22c55e] text-white font-medium">
  Ahorras S/200
</Chip>

// Badge de stock bajo (amarillo)
<Chip size="sm" className="bg-[#f59e0b] text-white font-medium">
  Últimas 3 unidades
</Chip>

// Badge nuevo (azul primario)
<Chip size="sm" className="bg-[#4654CD] text-white font-medium">
  Nuevo
</Chip>

// Badge popular (outline)
<Chip size="sm" variant="bordered" className="border-[#4654CD] text-[#4654CD]">
  Popular
</Chip>

// Badge convenio
<Chip size="sm" color="success" variant="flat">
  Convenio
</Chip>
```

---

## 8. Patrón: Modal de Configuración (Preview System)

```tsx
<Modal isOpen={isOpen} onClose={onClose} size="lg">
  <ModalContent>
    <ModalHeader>Configuración del Preview</ModalHeader>
    <ModalBody>
      <div className="space-y-6">
        {/* Versión de componente */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Versión del Hero
          </label>
          <RadioGroup
            orientation="horizontal"
            value={config.heroVersion}
            onValueChange={(v) => setConfig({ ...config, heroVersion: v })}
          >
            <Radio value="1">V1 - Minimalista</Radio>
            <Radio value="2">V2 - Con ilustración</Radio>
            <Radio value="3">V3 - Video background</Radio>
          </RadioGroup>
        </div>
        
        {/* Toggle de feature */}
        <div className="flex items-center justify-between">
          <span>Mostrar social proof</span>
          <Switch
            isSelected={config.showSocialProof}
            onValueChange={(v) => setConfig({ ...config, showSocialProof: v })}
            classNames={{
              wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
            }}
          />
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button variant="light" onPress={onClose}>Cancelar</Button>
      <Button className="bg-[#4654CD] text-white" onPress={onApply}>
        Aplicar
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

---

## 9. Patrón: Estados de Carga

```tsx
// Skeleton para card
<Card className="border border-neutral-200">
  <CardBody className="p-4">
    <Skeleton className="w-full h-40 rounded-lg mb-4" />
    <Skeleton className="w-3/4 h-4 rounded mb-2" />
    <Skeleton className="w-1/2 h-6 rounded mb-2" />
    <Skeleton className="w-full h-10 rounded mt-4" />
  </CardBody>
</Card>

// Spinner en botón
<Button 
  isLoading 
  spinner={<Spinner size="sm" color="white" />}
  className="bg-[#4654CD] text-white"
>
  Procesando...
</Button>
```

---

## 10. Patrón: Mensajes de Feedback

```tsx
// Éxito
<div className="flex items-center gap-2 p-4 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg">
  <CheckCircle className="w-5 h-5 text-[#22c55e]" />
  <span className="text-[#22c55e]">¡Guardado correctamente!</span>
</div>

// Error
<div className="flex items-center gap-2 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
  <AlertCircle className="w-5 h-5 text-[#ef4444]" />
  <span className="text-[#ef4444]">Hubo un problema. Intenta de nuevo.</span>
</div>

// Warning
<div className="flex items-center gap-2 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
  <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
  <span className="text-[#f59e0b]">Revisa los campos marcados.</span>
</div>

// Info
<div className="flex items-center gap-2 p-4 bg-[#4654CD]/10 border border-[#4654CD]/20 rounded-lg">
  <Info className="w-5 h-5 text-[#4654CD]" />
  <span className="text-[#4654CD]">Datos obtenidos de RENIEC</span>
</div>
```

---

## 11. Patrón: Responsive Breakpoints

```tsx
// Mobile-first approach
<div className="
  grid 
  grid-cols-1          // Mobile: 1 columna
  sm:grid-cols-2       // Tablet: 2 columnas
  lg:grid-cols-3       // Desktop: 3 columnas
  xl:grid-cols-4       // Large: 4 columnas
  gap-4
">
  {products.map(product => <ProductCard key={product.id} {...product} />)}
</div>

// Ocultar en móvil
<div className="hidden md:block">
  {/* Solo visible en desktop */}
</div>

// Solo móvil
<div className="md:hidden">
  {/* Solo visible en móvil */}
</div>
```

---

## 12. Patrón: Animaciones con Framer Motion

> **Principio clave**: Una animación bien orquestada en page load crea más impacto
> que múltiples micro-interacciones dispersas. Priorizar calidad sobre cantidad.

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Fade in al montar
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>

// Stagger children - RECOMENDADO para catálogo
<motion.ul
  variants={{
    show: { transition: { staggerChildren: 0.1 } }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      {item.content}
    </motion.li>
  ))}
</motion.ul>

// Micro-interacción en hover (sutil)
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Click me
</motion.button>

// Transición entre loading y contenido
<AnimatePresence mode="wait">
  {isLoading ? (
    <motion.div
      key="skeleton"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Skeleton />
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Content />
    </motion.div>
  )}
</AnimatePresence>

// Page transition para wizard steps
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    {stepContent}
  </motion.div>
</AnimatePresence>
```

---

## 13. Patrón: Celebración de Aprobación

```tsx
import confetti from 'canvas-confetti';

// Confetti sutil para aprobación (NO exagerado)
const celebrateApproval = () => {
  confetti({
    particleCount: 50,        // Sutil, no exagerado
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#4654CD', '#03DBD0', '#22c55e'],  // Colores de marca
    disableForReducedMotion: true  // Accesibilidad
  });
};

// Componente de resultado aprobado
export const ApprovalResult = () => {
  useEffect(() => {
    celebrateApproval();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-center">
        ¡Felicidades, {userName}!
      </h1>
    </motion.div>
  );
};
```

---

## 14. Patrón: Subrayado Ondulado (Headlines)

> **OBLIGATORIO**: Todos los títulos principales (H1) en Hero Banners y secciones CTA
> deben usar el subrayado ondulado SVG en color Aqua (#03DBD0) para destacar
> la última palabra clave.

```tsx
// Subrayado ondulado para headlines - ESTILO OFICIAL
<h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
  <span className="text-neutral-900">{headline.split(' ').slice(0, -1).join(' ')} </span>
  <span className="text-[#4654CD] relative inline-block">
    {headline.split(' ').slice(-1)[0]}
    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" fill="none">
      <path d="M2 8C30 4 70 4 98 8" stroke="#03DBD0" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </span>
</h1>

// Variante para texto estático (sin split dinámico)
<h2 className="text-3xl md:text-4xl font-bold">
  ¿Listo para tu{' '}
  <span className="text-[#4654CD] relative inline-block">
    nuevo equipo
    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
      <path d="M2 8C50 4 150 4 198 8" stroke="#03DBD0" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </span>
  ?
</h2>

// Para fondos oscuros (mismo SVG, contraste natural)
<h1 className="text-white">
  Empieza tu carrera con la{' '}
  <span className="relative inline-block">
    herramienta correcta
    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
      <path d="M2 8C50 4 150 4 198 8" stroke="#03DBD0" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </span>
</h1>
```

### Especificaciones del SVG

| Propiedad | Valor | Notas |
|-----------|-------|-------|
| `viewBox` | `0 0 100 12` (corto) o `0 0 200 12` (largo) | Ajustar según longitud del texto |
| `stroke` | `#03DBD0` | Color Aqua de marca |
| `strokeWidth` | `4` | Grosor consistente |
| `strokeLinecap` | `round` | Extremos redondeados |
| `position` | `absolute -bottom-2` | Debajo del texto |

### ❌ NO usar estos estilos alternativos

```tsx
// ❌ NO: Subrayado punteado CSS
<span className="border-b-[3px] border-dashed border-[#03DBD0]">texto</span>

// ❌ NO: Marcador resaltador
<span className="bg-[#03DBD0]/30 -skew-x-3">texto</span>

// ❌ NO: Underline nativo
<span className="underline decoration-[#03DBD0]">texto</span>

// ❌ NO: Border sólido
<span className="border-b-4 border-[#03DBD0]">texto</span>
```

---

## 15. Patrón: Espaciado y Composición

```tsx
// Layout con jerarquía clara - UN elemento dominante
<section className="py-16 px-4">
  {/* Headline dominante */}
  <h1 className="text-4xl md:text-5xl font-bold mb-4">
    Tu laptop te espera
  </h1>

  {/* Texto secundario con espacio generoso */}
  <p className="text-lg text-neutral-600 mb-8 max-w-xl">
    Financia en cuotas que se ajustan a ti
  </p>

  {/* CTA con espacio respirable */}
  <div className="mt-12">
    <Button size="lg">Ver laptops</Button>
  </div>
</section>

// Grid con espacio negativo generoso
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* gap-8 en lugar de gap-4 para más respiro */}
</div>

// Asimetría controlada
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-7">Contenido principal</div>
  <div className="col-span-5">Contenido secundario</div>
</div>
```
