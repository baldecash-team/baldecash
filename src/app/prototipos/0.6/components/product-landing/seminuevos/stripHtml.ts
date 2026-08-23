/**
 * Limpia HTML crudo que llega desde BD (el editor rich-text del admin guarda
 * HTML aunque el campo se use como texto plano en el front). Se usa en los 4
 * campos de FAQ que vienen de BD: title, subtitle, question y answer.
 *
 * No usa dangerouslySetInnerHTML — eso inyectaría el HTML de BD en la página.
 * En cambio, quita las etiquetas y decodifica las entidades más comunes para
 * dejar texto plano listo para renderizar como children de React.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return '';

  const withoutTags = input.replace(/<[^>]*>/g, '');

  const ENTITIES: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  const withoutEntities = withoutTags.replace(
    /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g,
    (match) => ENTITIES[match] ?? match
  );

  return withoutEntities.replace(/\s+/g, ' ').trim();
}
