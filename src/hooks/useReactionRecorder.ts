'use client';

import { useState, useRef, useCallback } from 'react';

export type RecordingStatus = 'IDLE' | 'REQUESTING' | 'RECORDING' | 'STOPPED' | 'ERROR';

interface UseReactionRecorderResult {
  status: RecordingStatus;
  videoBlob: Blob | null;
  videoUrl: string | null;
  stream: MediaStream | null;
  error: string | null;
  requestPermission: () => Promise<MediaStream | null>;
  startRecording: (stream?: MediaStream) => void;
  stopRecording: () => void;
  reset: () => void;
  lockOrientation: () => Promise<boolean>;
  unlockOrientation: () => void;
}

/**
 * Custom hook for capturing reaction videos using getUserMedia and MediaRecorder
 */
export function useReactionRecorder(): UseReactionRecorderResult {
  const [status, setStatus] = useState<RecordingStatus>('IDLE');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const maxDurationTimeout = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_DURATION_MS = 60 * 1000; // 60 seconds

  /**
   * Request camera + microphone permission and return the stream
   */
  const requestPermission = useCallback(async (): Promise<MediaStream | null> => {
    setStatus('REQUESTING');
    setError(null);

    // Check if browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('[ReactionRecorder] MediaDevices API not available (likely insecure context)');
      setError('Camera not supported in this browser or context. Please use HTTPS.');
      setStatus('ERROR');
      return null;
    }

    try {
      // Request camera with optimized mobile settings (480p is enough for reaction bubbles)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 }, // 480p is much lighter on CPU/Memory
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 } // 24fps is cinematic and lighter
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });

      setStream(mediaStream);
      setStatus('IDLE');
      return mediaStream;
    } catch (err: any) {
      console.error('[ReactionRecorder] Permission denied:', err);
      setError(err.message || 'Camera permission denied');
      setStatus('ERROR');
      return null;
    }
  }, []);

  /**
   * Start recording from the active stream
   */
  const startRecording = useCallback((currentStream?: MediaStream) => {
    const streamToUse = currentStream || stream;
    
    if (!streamToUse) {
      console.error('[ReactionRecorder] No stream available');
      return;
    }

    chunksRef.current = [];
    
    // Prefer webm but fallback to mp4 for Safari
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    // Set bitrate for better quality and smaller file size
    const recorderOptions: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: 750000, // 750 kbps is lighter and sufficient for 480p
      audioBitsPerSecond: 64000,   // 64 kbps audio is enough for speech
    };

    const recorder = new MediaRecorder(streamToUse, recorderOptions);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      setStatus('STOPPED');

      // Clear timeout if manually stopped
      if (maxDurationTimeout.current) {
        clearTimeout(maxDurationTimeout.current);
        maxDurationTimeout.current = null;
      }
    };

    recorder.onerror = (err) => {
      console.error('[ReactionRecorder] Recording error:', err);
      setError('Recording failed');
      setStatus('ERROR');
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000); // Collect data every second
    setStatus('RECORDING');

    // Auto-stop after max duration
    maxDurationTimeout.current = setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        stopRecording();
      }
    }, MAX_RECORDING_DURATION_MS);
  }, [stream]);

  /**
   * Stop the current recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, [stream]);

  /**
   * Reset all state for a fresh recording
   */
  const reset = useCallback(() => {
    // Cleanup previous session
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (maxDurationTimeout.current) {
      clearTimeout(maxDurationTimeout.current);
    }

    setStatus('IDLE');
    setVideoBlob(null);
    setVideoUrl(null);
    setStream(null);
    setError(null);
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, [stream, videoUrl]);

  /**
   * Lock screen orientation to portrait and enter fullscreen
   * Returns true on success, false if not supported or failed
   */
  const lockOrientation = useCallback(async (): Promise<boolean> => {
    try {
      // Get a fullscreen element (ideally the recording container)
      const elem = document.documentElement;

      // Enter fullscreen first (required for orientation lock)
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else {
        console.warn('[ReactionRecorder] Fullscreen not supported');
        return false;
      }

      // Wait a bit for fullscreen to activate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Lock to portrait orientation
      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('portrait');
        console.log('[ReactionRecorder] ✅ Orientation locked to portrait');
        return true;
      } else {
        console.warn('[ReactionRecorder] Screen Orientation API not supported');
        return false;
      }
    } catch (err: any) {
      console.error('[ReactionRecorder] Failed to lock orientation:', err);
      return false;
    }
  }, []);

  /**
   * Unlock orientation and exit fullscreen
   */
  const unlockOrientation = useCallback(() => {
    try {
      // Unlock orientation
      if (screen.orientation && 'unlock' in screen.orientation) {
        (screen.orientation as any).unlock();
        console.log('[ReactionRecorder] Orientation unlocked');
      }

      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (err: any) {
      console.error('[ReactionRecorder] Failed to unlock orientation:', err);
    }
  }, []);

  return {
    status,
    videoBlob,
    videoUrl,
    stream,
    error,
    requestPermission,
    startRecording,
    stopRecording,
    reset,
    lockOrientation,
    unlockOrientation,
  };
}
