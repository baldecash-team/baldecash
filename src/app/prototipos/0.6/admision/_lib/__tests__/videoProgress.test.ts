import {
  loadProgress,
  saveProgress,
  clearProgress,
  RESUME_WINDOW_MS,
} from '../videoProgress';

const KEY = (token: string) => `admision:video:progress:${token}`;

describe('admision/videoProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('save→load roundtrip returns the saved index', () => {
    saveProgress('tok-1', 2);
    expect(loadProgress('tok-1')).toEqual({ index: 2 });
  });

  it('returns null when there is no progress for the token', () => {
    expect(loadProgress('missing')).toBeNull();
  });

  it('expired entry returns null and clears the stale key', () => {
    const now = 1_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);
    saveProgress('tok-2', 1);

    // Advance time beyond the resume window.
    jest.spyOn(Date, 'now').mockReturnValue(now + RESUME_WINDOW_MS);
    expect(loadProgress('tok-2')).toBeNull();
    // Stale key was removed.
    expect(localStorage.getItem(KEY('tok-2'))).toBeNull();
  });

  it('entry just inside the window still loads', () => {
    const now = 5_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);
    saveProgress('tok-3', 3);

    jest.spyOn(Date, 'now').mockReturnValue(now + RESUME_WINDOW_MS - 1);
    expect(loadProgress('tok-3')).toEqual({ index: 3 });
  });

  it('clearProgress removes the entry', () => {
    saveProgress('tok-4', 1);
    clearProgress('tok-4');
    expect(loadProgress('tok-4')).toBeNull();
    expect(localStorage.getItem(KEY('tok-4'))).toBeNull();
  });

  it('malformed JSON returns null', () => {
    localStorage.setItem(KEY('tok-5'), 'not-json{');
    expect(loadProgress('tok-5')).toBeNull();
  });

  it('missing updatedAt / index is treated as invalid → null', () => {
    localStorage.setItem(KEY('tok-6'), JSON.stringify({ foo: 'bar' }));
    expect(loadProgress('tok-6')).toBeNull();
  });
});
