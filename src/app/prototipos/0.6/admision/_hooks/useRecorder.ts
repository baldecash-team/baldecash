'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { baseContentType } from '../_lib/videoTypes';

export function detectRecordingSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== 'undefined' &&
    'MediaRecorder' in window
  );
}

export function pickRecorderMime(): string {
  const prefs = ['video/mp4', 'video/webm'] as const;
  for (const m of prefs) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return 'video/webm';
}

export interface RecorderState {
  canRecord: boolean;
  requesting: boolean;
  stream: MediaStream | null;
  isRecording: boolean;
  recSeconds: number;
  previewUrl: string | null;
  previewBlob: Blob | null;
  playing: boolean;
}

export interface RecorderActions {
  requestCamera: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  reRecord: () => void;
  getFile: (index: number) => File | null;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  stopStream: () => void;
}

export interface RecorderRefs {
  liveVideoRef: React.RefObject<HTMLVideoElement | null>;
  playbackVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export type UseRecorderReturn = RecorderState & RecorderActions & RecorderRefs;

export function useRecorder(): UseRecorderReturn {
  const canRecord = detectRecordingSupport();

  const [requesting, setRequesting] = useState(false);
  const [stream, setStreamState] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    const el = liveVideoRef.current;
    if (el) el.srcObject = stream ?? null;
  }, [stream]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const stopStream = useCallback(() => {
    setStreamState((s) => {
      if (s) s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return null;
    });
  }, []);

  const requestCamera = useCallback(async () => {
    setRequesting(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStreamState(s);
      streamRef.current = s;
    } finally {
      setRequesting(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    const currentStream = streamRef.current;
    if (!currentStream) return;
    chunksRef.current = [];
    const baseMime = pickRecorderMime();
    const mr = new MediaRecorder(currentStream, { mimeType: baseMime });

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'video/webm' });
      setPlaying(false);
      setPreviewBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      previewUrlRef.current = url;
    };

    mr.start(200);
    recorderRef.current = mr;
    setIsRecording(true);
    setRecSeconds(0);
    timerRef.current = setInterval(() => setRecSeconds((n) => n + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    const mr = recorderRef.current;
    if (mr && mr.state !== 'inactive') mr.stop();
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  const reRecord = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setPreviewBlob(null);
    chunksRef.current = [];
    setPlaying(false);
    stopStream();
  }, [stopStream]);

  const getFile = useCallback(
    (index: number): File | null => {
      if (!previewBlob) return null;
      const baseMime = baseContentType(previewBlob.type || 'video/webm');
      const ext = baseMime.includes('mp4') ? 'mp4' : 'webm';
      return new File([previewBlob], `clip-${index + 1}.${ext}`, { type: baseMime });
    },
    [previewBlob]
  );

  return {
    canRecord,
    requesting,
    stream,
    isRecording,
    recSeconds,
    previewUrl,
    previewBlob,
    playing,
    requestCamera,
    startRecording,
    stopRecording,
    reRecord,
    getFile,
    setPlaying,
    stopStream,
    liveVideoRef,
    playbackVideoRef,
  };
}
