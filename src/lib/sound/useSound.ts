import { useState, useEffect, useCallback } from 'react';
import { audioManager, playSound } from './audioManager';
import { SoundType } from './sounds';

export function useSound() {
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMuted());

  useEffect(() => {
    // Keep local React state synchronized with central audioManager mute state
    const unsubscribe = audioManager.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const toggleMute = useCallback(() => {
    return audioManager.toggleMute();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    audioManager.setMuted(muted);
  }, []);

  const play = useCallback((type: SoundType, options?: { volumeMultiplier?: number }) => {
    playSound(type, options);
  }, []);

  return {
    isMuted,
    toggleMute,
    setMuted,
    playSound: play,
  };
}
