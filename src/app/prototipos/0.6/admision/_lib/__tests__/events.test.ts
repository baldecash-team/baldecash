import { admissionEvents } from '../events';
import type { TrackingEvent } from '../../../services/eventsApi';

describe('admision/events', () => {
  it('emits admission_link_open with the token as session id', () => {
    const calls: { sessionId: string; events: TrackingEvent[] }[] = [];
    const ev = admissionEvents('tok-1', (sessionId, events) => calls.push({ sessionId, events }));

    ev.linkOpen();

    expect(calls).toHaveLength(1);
    expect(calls[0].sessionId).toBe('tok-1');
    expect(calls[0].events[0].event_type).toBe('admission_link_open');
    expect(calls[0].events[0].properties?.token).toBe('tok-1');
  });

  it('stageExit emits a numeric duration_ms after a stageEnter', () => {
    const calls: TrackingEvent[] = [];
    const ev = admissionEvents('tok-2', (_s, events) => calls.push(...events));

    ev.stageEnter('code');
    ev.stageExit('code');

    const exit = calls.find((e) => e.event_type === 'admission_stage_exit');
    expect(exit).toBeDefined();
    expect(exit!.properties?.stage).toBe('code');
    expect(typeof exit!.properties?.duration_ms).toBe('number');
    expect(exit!.properties!.duration_ms as number).toBeGreaterThanOrEqual(0);
  });

  it('stageExit without a prior stageEnter still emits duration_ms 0', () => {
    const calls: TrackingEvent[] = [];
    const ev = admissionEvents('tok-3', (_s, events) => calls.push(...events));

    ev.stageExit('intro');

    const exit = calls.find((e) => e.event_type === 'admission_stage_exit');
    expect(exit!.properties?.duration_ms).toBe(0);
  });

  it('completed emits admission_completed', () => {
    const calls: TrackingEvent[] = [];
    const ev = admissionEvents('tok-4', (_s, events) => calls.push(...events));

    ev.completed();

    expect(calls.some((e) => e.event_type === 'admission_completed')).toBe(true);
  });
});
