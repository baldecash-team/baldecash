import { admissionEvents } from '../events';
import type { TrackingEvent } from '../../../services/eventsApi';

describe('admision/events · track (granular video events)', () => {
  it('emits the exact event_type through the sink with the token', () => {
    const calls: { sessionId: string; events: TrackingEvent[] }[] = [];
    const ev = admissionEvents('tok-1', (sessionId, events) => calls.push({ sessionId, events }));

    ev.track('video_permission_location_denied');

    expect(calls).toHaveLength(1);
    expect(calls[0].sessionId).toBe('tok-1');
    expect(calls[0].events[0].event_type).toBe('video_permission_location_denied');
    expect(calls[0].events[0].properties?.token).toBe('tok-1');
  });

  it('forwards key props like question_index on recording_started', () => {
    const calls: TrackingEvent[] = [];
    const ev = admissionEvents('tok-2', (_s, events) => calls.push(...events));

    ev.track('video_recording_started', { question_index: 1 });

    const evt = calls.find((e) => e.event_type === 'video_recording_started');
    expect(evt).toBeDefined();
    expect(evt!.properties?.question_index).toBe(1);
    expect(evt!.properties?.token).toBe('tok-2');
  });

  it('forwards question_index and total_questions on question_shown', () => {
    const calls: TrackingEvent[] = [];
    const ev = admissionEvents('tok-3', (_s, events) => calls.push(...events));

    ev.track('video_question_shown', { question_index: 0, total_questions: 3 });

    const evt = calls.find((e) => e.event_type === 'video_question_shown');
    expect(evt).toBeDefined();
    expect(evt!.properties?.question_index).toBe(0);
    expect(evt!.properties?.total_questions).toBe(3);
  });

  it('never throws even if the sink throws (fire-and-forget)', () => {
    const ev = admissionEvents('tok-4', () => {
      throw new Error('network down');
    });
    expect(() => ev.track('video_success_shown')).not.toThrow();
  });
});
