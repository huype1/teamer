// Utility đơn giản để phát âm thanh thông báo
class SoundUtils {
  private isEnabled = true;

  constructor() {
    this.restorePreferences();
  }

  // Tạo âm thanh notification đơn giản
  private playBeep(frequency: number, duration: number) {
    if (!this.isEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Không thể phát âm thanh:', error);
    }
  }

  // Phát âm thanh notification đơn giản
  playNotificationSound() {
    if (!this.isEnabled) return;

    // Chỉ phát 1 tiếng beep đơn giản
    this.playBeep(800, 200);
  }

  // Bật/tắt âm thanh
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('notificationSoundEnabled', enabled.toString());
  }

  // Kiểm tra trạng thái âm thanh
  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Khôi phục preference từ localStorage
  private restorePreferences() {
    const saved = localStorage.getItem('notificationSoundEnabled');
    if (saved !== null) {
      this.isEnabled = saved === 'true';
    }
  }
}

// Export singleton instance
const soundUtils = new SoundUtils();

export default soundUtils;
