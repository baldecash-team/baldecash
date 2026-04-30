// Override compartido — descripciones extendidas y specs para accesorios
// específicos que aún no las tienen en backend. Se aplica tanto en el detalle
// del producto gamer (carrusel "Complementa tu equipo" + modal) como en el
// flujo de solicitar gamer (sección "Los estudiantes también llevan...").
//
// Match por substring del `name` del accesorio (case-insensitive).

export interface AccessoryContentOverride {
  match: (nameLower: string) => boolean;
  description: string;
  specs: Array<{ label: string; value: string }>;
}

export const ACCESSORY_CONTENT_OVERRIDES: AccessoryContentOverride[] = [
  {
    match: (n) => n.includes('kraken v3'),
    description:
      'Sumérgete en el campo de batalla con sonido surround 7.1 THX que te permite escuchar cada paso enemigo. Sus drivers TriForce de 50mm separan agudos, medios y graves para audio cristalino, mientras las almohadillas de memory foam te mantienen cómodo en maratones de gaming. Iluminación RGB Chroma sincronizable con todo tu setup Razer.',
    specs: [
      { label: 'Drivers', value: '50mm TriForce Titanium' },
      { label: 'Respuesta de frecuencia', value: '12Hz - 28kHz' },
      { label: 'Impedancia', value: '32Ω' },
      { label: 'Sonido', value: 'THX Spatial Audio 7.1 Surround' },
      { label: 'Micrófono', value: 'HyperClear Cardioid con cancelación de ruido' },
      { label: 'Conectividad', value: 'USB Type-A' },
      { label: 'Iluminación', value: 'Razer Chroma RGB (16.8M colores)' },
      { label: 'Almohadillas', value: 'Memory foam + cuero sintético transpirable' },
      { label: 'Cable', value: '1.8m trenzado' },
      { label: 'Peso', value: '~285g' },
      { label: 'Compatible', value: 'PC, PS5, PS4' },
    ],
  },
  {
    match: (n) => n.includes('kraken v4'),
    description:
      'La evolución definitiva del Kraken: pantalla OLED personalizable en la copa para mostrar stats, GIFs o tu logo, triple conectividad (USB-C/Wireless/Bluetooth) para cambiar entre PC, consola y celular sin cables, y 70 horas de batería. Drivers bio-celulosa para graves profundos, almohadillas intercambiables según clima, y micrófono retráctil para calls profesionales. Es como tener 3 headsets en uno.',
    specs: [
      { label: 'Drivers', value: '50mm TriForce Bio-Cellulose' },
      { label: 'Respuesta de frecuencia', value: '20Hz - 40kHz (Hi-Res Audio)' },
      { label: 'Impedancia', value: '32Ω' },
      { label: 'Sonido', value: 'THX Spatial Audio + OLED Smart Display' },
      { label: 'Micrófono', value: 'HyperClear Super Wideband retráctil' },
      { label: 'Conectividad', value: 'USB-C + Wireless 2.4GHz + Bluetooth 5.3 (tri-mode)' },
      { label: 'Batería', value: '70 horas (sin RGB) / 40 horas (con RGB)' },
      { label: 'Latencia wireless', value: '<20ms' },
      { label: 'Iluminación', value: 'Razer Chroma RGB + OLED customizable' },
      { label: 'Almohadillas', value: 'Hybrid fabric + leatherette intercambiables' },
      { label: 'Peso', value: '~375g' },
      { label: 'Control', value: 'Botones táctiles + OLED integrado' },
      { label: 'Compatible', value: 'PC, PS5, Xbox Series, Switch, Mobile' },
    ],
  },
  {
    match: (n) => n.includes('deathadder essential'),
    description:
      'El DeathAdder ha dominado el gaming por años gracias a su forma que se funde con tu mano. Esta versión Essential mantiene esa ergonomía probada en torneos + sensor óptico preciso de 6,400 DPI, perfecto para quien busca puntería confiable sin pagar por funciones que no usará. A este precio, es literalmente regalar performance.',
    specs: [
      { label: 'Sensor', value: 'Óptico 6,400 DPI' },
      { label: 'IPS', value: '220' },
      { label: 'Aceleración', value: '30G' },
      { label: 'Switches', value: 'Mecánicos · durabilidad 10M clicks' },
      { label: 'Botones', value: '5 programables' },
      { label: 'Polling Rate', value: '1000Hz' },
      { label: 'Conectividad', value: 'USB cable 2.1m' },
      { label: 'Diseño', value: 'Ergonómico diestro' },
      { label: 'Peso', value: '~96g' },
      { label: 'Iluminación', value: 'Verde estática (no RGB)' },
      { label: 'Software', value: 'Razer Synapse 3' },
    ],
  },
  {
    match: (n) => n.includes('basilisk v3'),
    description:
      '¿FPS competitivo? Switches ópticos ultra-rápidos (70M clicks). ¿MMO? 11 botones programables. ¿Productividad? Rueda HyperScroll que alterna entre scroll libre y táctil. El Basilisk hace TODO: sensor 26K DPI ajustable al vuelo con paddle dedicado, 11 zonas RGB Chroma, y grips texturizados para sesiones intensas. Es como tener un mouse FPS y MMO en uno solo.',
    specs: [
      { label: 'Sensor', value: 'Razer Focus+ 26,000 DPI óptico' },
      { label: 'IPS', value: '650' },
      { label: 'Aceleración', value: '50G' },
      { label: 'Polling Rate', value: '1000Hz' },
      { label: 'Switches', value: 'Razer Optical Gen-3 (70M clicks)' },
      { label: 'Botones', value: '11 programables' },
      { label: 'Rueda', value: 'HyperScroll Tilt (libre o táctil)' },
      { label: 'Peso', value: '~101g (fijo, sin pesas)' },
      { label: 'Iluminación', value: 'Razer Chroma RGB · 11 zonas' },
      { label: 'Cable', value: 'SpeedFlex 1.8m' },
      {
        label: 'Extras',
        value:
          'Paddle de sensibilidad personalizable · On-board memory (5 perfiles) · Razer Synapse 3 · Grips texturizados antideslizantes',
      },
    ],
  },
  {
    match: (n) => n.includes('firefly v2'),
    description:
      'Olvida los pads aburridos: superficie rígida micro-texturizada para deslizamientos veloces + precisión quirúrgica, con 19 zonas RGB que proyectan luz alrededor de todo el pad (no solo por dentro). Se conecta por USB, sincroniza con tu setup Razer, y convierte tu zona gaming en un espectáculo visual. Hard surface significa lavable, duradero, y nunca se deforma.',
    specs: [
      { label: 'Tipo', value: 'Hard surface (plástico rígido)' },
      { label: 'Tamaño', value: '360mm × 278mm × 4.6mm (Medium)' },
      { label: 'Superficie', value: 'Micro-texturizada para velocidad + control' },
      { label: 'Base', value: 'Antideslizante con cable management' },
      {
        label: 'Iluminación',
        value: 'RGB Underglow 19 zonas Razer Chroma · visible 360° · powered by USB',
      },
      { label: 'Conectividad', value: 'USB-A para RGB' },
      {
        label: 'Extras',
        value: 'Superficie lavable · compatible con Razer Synapse · sincronización con setup RGB',
      },
    ],
  },
  {
    match: (n) => n.includes('sphex'),
    description:
      'Con solo 0.4mm de grosor, prácticamente no lo sientes bajo el teclado, pero ofrece superficie speed optimizada para sensores ópticos/láser. Base adhesiva reposicionable para llevarlo a LANs o cafés, tamaño Large (450×400mm) que cubre teclado + mouse, y resistente al agua. A S/38.50, es el pad de respaldo que todo gamer debe tener en la mochila.',
    specs: [
      { label: 'Tipo', value: 'Ultradelgado (0.4mm)' },
      { label: 'Tamaño', value: '450mm × 400mm (Large)' },
      { label: 'Superficie', value: 'Policarbonato texturizado (speed)' },
      { label: 'Base', value: 'Adhesiva reposicionable' },
      { label: 'Peso', value: '~70g' },
      { label: 'Grosor', value: '0.4mm (casi imperceptible)' },
      { label: 'Compatibilidad', value: 'Sensores ópticos y láser' },
      { label: 'Extras', value: 'Resistente al agua · fácil limpieza' },
    ],
  },
  {
    match: (n) => n.includes('tc100'),
    description:
      'Olvida el cuero que te hace sudar. La TC100 usa tela breathable que respira en verano mientras mantiene soporte ergonómico: memory foam en lumbar/cervical, reclinación hasta 160° para descansos, apoyabrazos 2D, y estructura de acero que soporta hasta 120kg. Diseño "Relaxed" menos agresivo que las racing típicas, perfecto para gaming + trabajo remoto. Corsair garantiza 2 años de durabilidad.',
    specs: [
      { label: 'Tipo', value: 'Fabric breathable (tela transpirable)' },
      { label: 'Diseño', value: 'Relaxed fit (no racing agresivo)' },
      { label: 'Estructura', value: 'Marco de acero reforzado · base de nylon de 5 puntas' },
      { label: 'Reclinación', value: '90° - 160°' },
      { label: 'Apoyabrazos', value: '2D (altura + rotación)' },
      { label: 'Pistón', value: 'Clase 4 certificado' },
      { label: 'Capacidad', value: 'Hasta 120kg' },
      { label: 'Dimensiones asiento', value: 'Ancho 53cm × Profundidad 52cm' },
      { label: 'Altura ajustable', value: 'Pistón neumático · 1.65m - 1.85m' },
      {
        label: 'Almohadillas',
        value: 'Lumbar memory foam desmontable · Cervical memory foam desmontable',
      },
      { label: 'Ruedas', value: 'Nylon 60mm' },
      { label: 'Garantía', value: '2 años Corsair' },
    ],
  },
  {
    match: (n) => n.includes('te-4072') || n.includes('te4072'),
    description:
      'Seamos honestos: a S/20 es un teclado de membrana, NO mecánico. Pero si tu presupuesto está súper apretado y quieres "el look gamer" con RGB rainbow, esto cumple. Anti-ghosting en teclas clave (WASD + flechas), iluminación colorida, y USB plug-and-play. Piénsalo como tu teclado temporal mientras ahorras para mecánicos. Durará ~1-2 años de uso casual.',
    specs: [
      { label: 'Tipo', value: 'Membrana gaming' },
      { label: 'Anti-ghosting', value: '19-26 teclas' },
      { label: 'Iluminación', value: 'RGB Rainbow (probablemente no customizable)' },
      { label: 'Conectividad', value: 'USB' },
      { label: 'Layout', value: 'Español/QWERTY' },
      { label: 'Extras', value: 'Reposamuñecas probablemente NO incluido' },
      { label: 'Durabilidad', value: '~5M pulsaciones (vs 50M mecánicos)' },
    ],
  },
  {
    match: (n) => n.includes('blackwidow v3'),
    description:
      'El teclado que puso a Razer en el mapa gaming. Switches mecánicos Green (clicky táctil como Cherry MX Blue) con 80 millones de clicks de vida, anti-ghosting total NKRO para combos complejos, RGB por tecla customizable vía Synapse, y extras pro: rueda de volumen dedicada, USB passthrough para conectar tu mouse, reposamuñecas magnético. Typing ruidoso satisfactorio que anuncia "aquí hay un gamer". Build quality sólido de 1.3kg.',
    specs: [
      {
        label: 'Switches',
        value: 'Razer Green Mechanical (clicky táctil) · activación 1.9mm · fuerza 50g · 80M clicks',
      },
      { label: 'Tipo', value: 'Full-size (104 teclas + numpad)' },
      { label: 'Anti-ghosting', value: 'N-Key Rollover (NKRO) completo' },
      { label: 'Polling Rate', value: '1000Hz' },
      { label: 'Keycaps', value: 'ABS doubleshot translúcidas' },
      { label: 'Iluminación', value: 'Razer Chroma RGB per-key (16.8M colores)' },
      { label: 'Cable', value: 'USB-A detachable · 1.8m trenzado' },
      {
        label: 'Extras',
        value:
          'Rueda de volumen dedicada · USB 2.0 passthrough · reposamuñecas magnético incluido · Razer Synapse 3 · on-board memory',
      },
      { label: 'Dimensiones', value: '448mm × 154mm × 42mm' },
      { label: 'Peso', value: '~1.3kg' },
    ],
  },
];

/**
 * Encuentra el override correspondiente por substring del nombre.
 * Devuelve `null` si no hay override para ese accesorio.
 */
export function findAccessoryOverride(name: string): AccessoryContentOverride | null {
  const nameLower = name.toLowerCase();
  return ACCESSORY_CONTENT_OVERRIDES.find((o) => o.match(nameLower)) ?? null;
}
