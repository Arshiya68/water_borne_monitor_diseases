export class NotificationService {
  static checkOutbreakThreshold = async (riskLevel, village) => {
    if (riskLevel === 'High') {
      NotificationService.sendDesktopNotification(
        'High-Risk Outbreak Detected!',
        {
          body: `Possible outbreak detected in ${village}. Immediate action required.`,
          icon: '/alert-icon.png',
          badge: '/alert-badge.png',
          tag: `outbreak-${village}`,
          requireInteraction: true,
        }
      )
      return true
    }
    return false
  }

  static sendDesktopNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported')
      return
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options)
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, options)
        }
      })
    }
  }

  static requestPermission = async () => {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  static startLiveUpdates = (callback, interval = 60000) => {
    const updateInterval = setInterval(callback, interval)
    return () => clearInterval(updateInterval)
  }
}

export class AlertManager {
  static alerts = []

  static addAlert = (alert) => {
    const newAlert = {
      id: Date.now(),
      timestamp: new Date(),
      ...alert,
    }
    AlertManager.alerts.unshift(newAlert)
    if (AlertManager.alerts.length > 50) {
      AlertManager.alerts.pop()
    }
    return newAlert
  }

  static getAlerts = () => AlertManager.alerts

  static clearAlert = (id) => {
    AlertManager.alerts = AlertManager.alerts.filter((a) => a.id !== id)
  }

  static clearAll = () => {
    AlertManager.alerts = []
  }
}