/**
 * BAL-5367: la marca de «Probar en la web» decide si el envío se simula y
 * manda la cabecera que ws2 rechaza.
 */
import {
  cabecerasDeVistaDePrueba, esVistaDePrueba, guardarVistaDePrueba, leerVistaDePrueba,
  marcarSembrada, salirDeVistaDePrueba, sembrarTerminosDePrueba,
} from '../vistaDePrueba';
import { armarEquipoDePrueba, cardDelEquipo } from '../equipoDePrueba';
import type { CatalogProduct } from '../../[landing]/catalogo/types/catalog';

const vigente = { slug: 'home', token: 'tok', venceEn: Date.now() + 60_000, sembrar: true };

describe('vistaDePrueba', () => {
  beforeEach(() => localStorage.clear());

  it('BAL-5381: siembra términos y privacidad (no promociones) y Salir los borra', () => {
    guardarVistaDePrueba(vigente);
    sembrarTerminosDePrueba('home');
    expect(localStorage.getItem('baldecash-home-wizard-acceptTerms')).toBe('true');
    expect(localStorage.getItem('baldecash-home-wizard-acceptPrivacy')).toBe('true');
    expect(localStorage.getItem('baldecash-home-wizard-acceptPromos')).toBe('false');
    salirDeVistaDePrueba();
    expect(localStorage.getItem('baldecash-home-wizard-acceptTerms')).toBeNull();
    expect(localStorage.getItem('baldecash-home-wizard-acceptPrivacy')).toBeNull();
  });

  it('vigente: simula en su landing y manda la cabecera', () => {
    guardarVistaDePrueba(vigente);
    expect(esVistaDePrueba('home')).toBe(true);
    expect(esVistaDePrueba('otra')).toBe(false);
    expect(cabecerasDeVistaDePrueba()).toEqual({ 'X-Vista-Previa': 'tok' });
  });

  it('vencida: se borra con los datos de prueba de esa landing', () => {
    localStorage.setItem('baldecash-wizard-home-data', '{"document_number":{"value":"99999901"}}');
    localStorage.setItem('baldecash-home-solicitar-selected-product', '{}');
    localStorage.setItem('baldecash-wizard-otra-data', '{}');
    guardarVistaDePrueba({ ...vigente, venceEn: Date.now() - 1 });
    expect(leerVistaDePrueba('home')).toBeNull();
    expect(cabecerasDeVistaDePrueba()).toEqual({});
    expect(localStorage.getItem('baldecash-wizard-home-data')).toBeNull();
    expect(localStorage.getItem('baldecash-home-solicitar-selected-product')).toBeNull();
    expect(localStorage.getItem('baldecash-wizard-otra-data')).toBe('{}');
  });

  it('sembrar se hace una sola vez y «Salir» la quita', () => {
    guardarVistaDePrueba(vigente);
    marcarSembrada();
    expect(leerVistaDePrueba('home')?.sembrar).toBe(false);
    salirDeVistaDePrueba();
    expect(esVistaDePrueba('home')).toBe(false);
  });

  it('una marca rota no cuenta', () => {
    localStorage.setItem('baldecash-vista-de-prueba', '{"slug":1}');
    expect(esVistaDePrueba()).toBe(false);
  });
});

describe('equipoDePrueba', () => {
  const card = (over: Partial<CatalogProduct>) => ({
    id: '684', slug: 'lenovo', name: 'Lenovo', displayName: 'Laptop Lenovo', brand: 'Lenovo',
    thumbnail: 't.png', images: ['i.png'], price: 2500, quotaMonthly: 150, condition: 'nueva',
    ...over,
  } as unknown as CatalogProduct);
  const equipo = { product_id: 684, combo_id: 7, variant_id: 901, term: 24, initial: 10, frequency: 'quincenal' };

  it('elige la card del mismo combo', () => {
    const cards = [card({}), card({ comboId: 7, displayName: 'Con mouse' })];
    expect(cardDelEquipo(cards, equipo)?.displayName).toBe('Con mouse');
    expect(cardDelEquipo(cards, { ...equipo, combo_id: null })?.displayName).toBe('Laptop Lenovo');
    expect(cardDelEquipo(cards, { ...equipo, combo_id: 99 })).toBeUndefined();
  });

  it('lleva el plazo, la inicial y la frecuencia del link, sin planes (la cuota la pide el wizard)', () => {
    const p = armarEquipoDePrueba(card({ comboId: 7 }), equipo);
    expect(p).toMatchObject({ id: '684', term: 24, months: 12, initialPercent: 10, paymentFrequency: 'quincenal',
      variantId: '901', comboId: 7, image: 'i.png' });
    expect(p.paymentPlans).toBeUndefined();
  });
});
