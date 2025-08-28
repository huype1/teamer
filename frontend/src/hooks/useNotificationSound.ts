import { useState, useEffect } from 'react';
import soundUtils from '@/utils/soundUtils';

export const useNotificationSound = () => {
  const [isEnabled, setIsEnabled] = useState(soundUtils.isSoundEnabled());

  const toggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    soundUtils.setEnabled(newState);
  };

  const playSound = () => {
    soundUtils.playNotificationSound();
  };

  // Sync state with soundUtils
  useEffect(() => {
    setIsEnabled(soundUtils.isSoundEnabled());
  }, []);

  return {
    isEnabled,
    toggleSound,
    playSound
  };
};
