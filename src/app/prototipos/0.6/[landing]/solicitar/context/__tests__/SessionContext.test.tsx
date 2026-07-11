import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from '../SessionContext';

function Probe() {
  const { sessionUuid, isInitialized } = useSession();
  return <div data-testid="uuid">{sessionUuid ?? 'null'}:{String(isInitialized)}</div>;
}

describe('SessionProvider fixedSessionId', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ session_uuid: 'x', session_id: 1 }) })
    ) as unknown as typeof fetch;
  });

  it('usa el fixedSessionId como sessionUuid y NO llama fetch de session', async () => {
    render(
      <SessionProvider fixedSessionId="tok_abc123">
        <Probe />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('uuid').textContent).toBe('tok_abc123:true');
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sin fixedSessionId conserva el comportamiento actual (llama fetch)', async () => {
    render(
      <SessionProvider landingSlug="home">
        <Probe />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
