/**
 * Íconos SVG del formulario posterior a la solicitud (trazo 1.9). Copiados del
 * prototipo BaldeFormulario; solo los íconos, sin las ilustraciones de ejemplo.
 */
import type React from 'react';

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Svg = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className ?? "w-5 h-5"} {...P} aria-hidden="true">{children}</svg>
);
export const Ic = {
  Upload: (p: { className?: string }) => <Svg {...p}><path d="M12 16V5m0 0-4 4m4-4 4 4" /><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" /></Svg>,
  Camera: (p: { className?: string }) => <Svg {...p}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2.5h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" /><circle cx="12" cy="13" r="3.4" /></Svg>,
  Gallery: (p: { className?: string }) => <Svg {...p}><rect x="3.5" y="5" width="17" height="14" rx="2" /><circle cx="9" cy="10" r="1.7" /><path d="m20.5 16-5-5-8 8" /></Svg>,
  Folder: (p: { className?: string }) => <Svg {...p}><path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" /></Svg>,
  Receipt: (p: { className?: string }) => <Svg {...p}><path d="M6.5 3.5h11v17l-2.75-1.8L12 20.5l-2.75-1.8-2.75 1.8z" /><path d="M9.5 8h5M9.5 11.5h5M9.5 15h3" /></Svg>,
  Doc: (p: { className?: string }) => <Svg {...p}><path d="M7 3.5h7l4.5 4.5v12.5H7z" /><path d="M14 3.5V8h4.5M10 13h5M10 16.5h5" /></Svg>,
  Pdf: (p: { className?: string }) => <Svg {...p}><path d="M7 3.5h7l4.5 4.5v12.5H7z" /><path d="M14 3.5V8h4.5" /><path d="M9.5 17v-5h2.2a1.5 1.5 0 0 1 0 3H9.5" /></Svg>,
  Phone: (p: { className?: string }) => <Svg {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.2" /><path d="M10.8 18.5h2.4" /></Svg>,
  School: (p: { className?: string }) => <Svg {...p}><path d="m2.5 9 9.5-4.5L21.5 9 12 13.5z" /><path d="M6 11v4.5c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8V11M21.5 9v5.5" /></Svg>,
  Pin: (p: { className?: string }) => <Svg {...p}><path d="M12 21s-6.5-5.7-6.5-10.3a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z" /><circle cx="12" cy="10.7" r="2.2" /></Svg>,
  Mic: (p: { className?: string }) => <Svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></Svg>,
  Stop: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>,
  Play: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" /></svg>,
  Pause: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>,
  Trash: (p: { className?: string }) => <Svg {...p}><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6" /></Svg>,
  Redo: (p: { className?: string }) => <Svg {...p}><path d="M20 11a8 8 0 1 0 2 5.3" /><path d="M20 4v7h-7" /></Svg>,
  Check: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>,
  Alert: (p: { className?: string }) => <Svg {...p}><path d="M12 9v4m0 4h.01" /><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" /></Svg>,
  Eye: (p: { className?: string }) => <Svg {...p}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="3" /></Svg>,
  Chat: (p: { className?: string }) => <Svg {...p}><path d="M4 5.5h16v11H9.5L4.5 20z" /></Svg>,
  Cal: (p: { className?: string }) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>,
  Lock: (p: { className?: string }) => <Svg {...p}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></Svg>,
  X: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>,
  Send: (p: { className?: string }) => <Svg {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></Svg>,
  Wa: (p: { className?: string }) => <Svg {...p}><path d="M4 20l1.3-3.9A8 8 0 1 1 8.2 19z" /><path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1.3-1.3 1.9.7v1.6c-3.8.6-8.4-4-7.8-7.8H10.5l.7 1.9z" /></Svg>,
  Help: (p: { className?: string }) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.6 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7M12 17h.01" /></Svg>,
  Chev: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>,
  ChevL: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>,
  ChevR: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>,
  Tel: (p: { className?: string }) => <Svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Svg>,
  Edit: (p: { className?: string }) => <Svg {...p}><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z" /><path d="m13.5 7.5 3 3" /></Svg>,
  Plus: (p: { className?: string }) => <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>,
  Video: (p: { className?: string }) => <Svg {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></Svg>,
};
