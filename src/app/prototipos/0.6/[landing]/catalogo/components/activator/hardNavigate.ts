/**
 * Full-page navigation. Its own module purely so tests can mock the seam —
 * jsdom 20 makes window.location.assign non-configurable.
 */
export function hardNavigate(url: string): void {
  window.location.assign(url);
}
