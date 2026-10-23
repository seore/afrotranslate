// Records the learner saying a phrase so they can play it back against
// the reference audio. No scoring yet (Phase 4). The mic permission is
// requested here, the first time recording is needed.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

const MAX_RECORDING_MS = 6000;

export type MicPermission = 'unknown' | 'granted' | 'denied';

export function useAttemptRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { isRecording } = useAudioRecorderState(recorder);
  const playback = useAudioPlayer();
  const [attemptUri, setAttemptUri] = useState<string | null>(null);
  const [permission, setPermission] = useState<MicPermission>('unknown');
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(async () => {
    if (autoStop.current) clearTimeout(autoStop.current);
    autoStop.current = null;
    try {
      await recorder.stop();
      setAttemptUri(recorder.uri);
    } catch (error) {
      console.error('Stop recording error:', error);
    } finally {
      // Leave record mode so playback goes to the speaker, not the earpiece.
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    }
  }, [recorder]);

  const start = useCallback(async (): Promise<boolean> => {
    const { granted } = await requestRecordingPermissionsAsync();
    setPermission(granted ? 'granted' : 'denied');
    if (!granted) return false;

    try {
      setAttemptUri(null);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      autoStop.current = setTimeout(stop, MAX_RECORDING_MS);
      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      return false;
    }
  }, [recorder, stop]);

  const playAttempt = useCallback(() => {
    if (!attemptUri) return;
    playback.replace({ uri: attemptUri });
    playback.seekTo(0);
    playback.play();
  }, [attemptUri, playback]);

  const reset = useCallback(() => setAttemptUri(null), []);

  useEffect(
    () => () => {
      if (autoStop.current) clearTimeout(autoStop.current);
    },
    [],
  );

  return { isRecording, attemptUri, permission, start, stop, playAttempt, reset };
}
