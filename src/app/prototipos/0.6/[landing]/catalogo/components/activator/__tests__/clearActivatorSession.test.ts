import { clearActivatorSession } from '../clearActivatorSession';

const LANDING = 'family-farm-cosechador';

describe('clearActivatorSession', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('removes the saved DNI so the next client does not inherit it', () => {
    localStorage.setItem(`baldecash-dni-${LANDING}`, '70020010');

    clearActivatorSession(LANDING);

    expect(localStorage.getItem(`baldecash-dni-${LANDING}`)).toBeNull();
  });

  it('removes the wizard session uuid so tracking does not carry over', () => {
    localStorage.setItem(`baldecash-${LANDING}-wizard-session-uuid`, 'uuid-abc');

    clearActivatorSession(LANDING);

    expect(localStorage.getItem(`baldecash-${LANDING}-wizard-session-uuid`)).toBeNull();
  });

  it('still clears the VIP token that gates access to the landing', () => {
    localStorage.setItem(`baldecash-vip-token-${LANDING}`, 'token-abc');
    localStorage.setItem(`baldecash-vip-name-${LANDING}`, '{"firstName":"Rosa"}');

    clearActivatorSession(LANDING);

    expect(localStorage.getItem(`baldecash-vip-token-${LANDING}`)).toBeNull();
    expect(localStorage.getItem(`baldecash-vip-name-${LANDING}`)).toBeNull();
  });

  it('removes the browsing activity so the next client starts clean', () => {
    localStorage.setItem(`baldecash-${LANDING}-compare`, '["1","2"]');
    localStorage.setItem(`baldecash-${LANDING}-wishlist`, '["3"]');
    localStorage.setItem(`baldecash-${LANDING}-cart`, '["4"]');
    localStorage.setItem(`baldecash-${LANDING}-solicitar-selected-product`, '{"id":"5"}');

    clearActivatorSession(LANDING);

    expect(localStorage.getItem(`baldecash-${LANDING}-compare`)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-wishlist`)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-cart`)).toBeNull();
    expect(localStorage.getItem(`baldecash-${LANDING}-solicitar-selected-product`)).toBeNull();
  });

  it('keeps the onboarding tour state so it does not reappear for every client', () => {
    const tourState = '{"hasSeenWelcome":true,"hasCompletedTour":false,"currentStep":0}';
    localStorage.setItem(`baldecash-${LANDING}-onboarding-catalog`, tourState);

    clearActivatorSession(LANDING);

    expect(localStorage.getItem(`baldecash-${LANDING}-onboarding-catalog`)).toBe(tourState);
  });

  it('leaves another landing\'s keys untouched', () => {
    localStorage.setItem('baldecash-dni-otra-landing', '11112222');
    localStorage.setItem('baldecash-otra-landing-wizard-session-uuid', 'uuid-otra');
    localStorage.setItem('baldecash-otra-landing-wishlist', '["9"]');
    localStorage.setItem('baldecash-otra-landing-solicitar-selected-product', '{"id":"9"}');

    clearActivatorSession(LANDING);

    expect(localStorage.getItem('baldecash-dni-otra-landing')).toBe('11112222');
    expect(localStorage.getItem('baldecash-otra-landing-wizard-session-uuid')).toBe('uuid-otra');
    expect(localStorage.getItem('baldecash-otra-landing-wishlist')).toBe('["9"]');
    expect(localStorage.getItem('baldecash-otra-landing-solicitar-selected-product')).toBe('{"id":"9"}');
  });

  it('does not throw when storage access fails', () => {
    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = () => {
      throw new Error('storage unavailable');
    };

    expect(() => clearActivatorSession(LANDING)).not.toThrow();

    Storage.prototype.removeItem = original;
  });
});
