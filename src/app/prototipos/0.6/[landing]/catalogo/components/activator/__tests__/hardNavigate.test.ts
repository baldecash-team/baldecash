/**
 * hardNavigate — navigation seam test (BAL-2637).
 *
 * jsdom 20's Location members (`assign`, `replace`, `reload`) are
 * `[LegacyUnforgeable]` (see node_modules/jsdom/lib/jsdom/living/generated/Location.js:324-327),
 * so `jest.spyOn(window.location, 'assign')` and
 * `Object.defineProperty(window.location, 'assign', ...)` both throw
 * `TypeError: Cannot redefine property`. This test reassigns the whole
 * `window.location` object (configurable at the `Window` level) instead —
 * a test-local workaround that does not touch the seam's own runtime code.
 */
import { hardNavigate } from '../hardNavigate';

describe('hardNavigate', () => {
  it('calls window.location.assign(url) exactly once', () => {
    const assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });

    hardNavigate('/family-farm-cosechador/catalogo');

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith('/family-farm-cosechador/catalogo');
  });
});
