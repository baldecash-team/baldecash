import { transformConfigHref } from '../routes';

// Los hrefs que guarda el admin (NavigationLinkSelect) vienen SIN barra
// inicial: `catalogo`, `catalogo?device=laptop`, `proximamente/x`. No son
// rutas validas por si solas -- hay que anteponerles el home de la landing.
describe('transformConfigHref', () => {
  const landing = 'seminuevos';

  it('arma la ruta de la landing para un href relativo', () => {
    expect(transformConfigHref('catalogo', landing))
      .toBe('/prototipos/0.6/seminuevos/catalogo');
  });

  it('conserva el querystring', () => {
    expect(transformConfigHref('catalogo?device=laptop&brand=hp', landing))
      .toBe('/prototipos/0.6/seminuevos/catalogo?device=laptop&brand=hp');
  });

  it('conserva una ruta relativa con varios segmentos', () => {
    expect(transformConfigHref('proximamente/becas', landing))
      .toBe('/prototipos/0.6/seminuevos/proximamente/becas');
  });

  // El Footer se equivoca aca: devuelve `#faq` pelado, que desde una subpagina
  // busca el ancla en la pagina actual en vez de ir al home de la landing.
  it('antepone el home de la landing a un ancla', () => {
    expect(transformConfigHref('#faq', landing))
      .toBe('/prototipos/0.6/seminuevos#faq');
  });

  it('deja intacta una URL externa', () => {
    expect(transformConfigHref('https://baldecash.com/algo', landing))
      .toBe('https://baldecash.com/algo');
  });

  it('deja intactos tel: y mailto:', () => {
    expect(transformConfigHref('tel:+51999888777', landing)).toBe('tel:+51999888777');
    expect(transformConfigHref('mailto:hola@baldecash.com', landing))
      .toBe('mailto:hola@baldecash.com');
  });

  it('deja intacta una ruta que ya viene absoluta', () => {
    expect(transformConfigHref('/prototipos/0.6/otra-landing/catalogo', landing))
      .toBe('/prototipos/0.6/otra-landing/catalogo');
  });

  it('devuelve vacio cuando no hay href', () => {
    expect(transformConfigHref('', landing)).toBe('');
  });

  it('no duplica la barra si la landing viene con barra final', () => {
    expect(transformConfigHref('catalogo', 'seminuevos/'))
      .toBe('/prototipos/0.6/seminuevos/catalogo');
  });
});
