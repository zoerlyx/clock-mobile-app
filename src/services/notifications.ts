export class NotificationManager {
  private static permissionGranted: boolean = false;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      if (Notification.permission === 'granted') {
        this.permissionGranted = true;
        return true;
      }
      if (Notification.permission !== 'denied') {
        const result = await Notification.requestPermission();
        this.permissionGranted = result === 'granted';
        return this.permissionGranted;
      }
    } catch {
      return false;
    }
    return false;
  }

  public static sendNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported()) return null;
    try {
      if (Notification.permission === 'granted') {
        return new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          silent: false,
          requireInteraction: true,
          ...options,
        });
      }
    } catch (e) {
      console.warn('[NotificationManager] Failed to post notification:', e);
    }
    return null;
  }
}
