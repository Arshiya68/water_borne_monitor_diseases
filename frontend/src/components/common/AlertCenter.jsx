import { AlertCircle, Bell, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getAlerts } from '../../services/features'

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await getAlerts()
        const mappedAlerts = (response.data || []).map((alert) => ({
          id: alert.id,
          type: alert.risk_level === 'High' ? 'warning' : alert.risk_level === 'Medium' ? 'info' : 'success',
          title: alert.message?.split(':')[0] || 'Alert',
          message: alert.message || '',
          recommendation: alert.message,
          timestamp: new Date(alert.created_at),
          read: false,
        }))
        setAlerts(mappedAlerts)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const dismissAlert = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'success':
        return '✅'
      default:
        return '📢'
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-300 text-orange-900'
      case 'info':
        return 'bg-blue-50 border-blue-300 text-blue-900'
      case 'success':
        return 'bg-green-50 border-green-300 text-green-900'
      default:
        return 'bg-slate-50 border-slate-300 text-slate-900'
    }
  }

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <span>Alert Center</span>
          {unreadCount > 0 && (
            <span className="ml-2 px-3 py-1 bg-red-600 text-white text-sm rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No active alerts</p>
            <p className="text-slate-500 text-sm mt-1">Your community is currently safe</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border-2 p-5 transition ${getAlertColor(alert.type)} ${
                !alert.read ? 'ring-2 ring-offset-2 ring-blue-400' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                    <h4 className="font-bold text-lg">{alert.title}</h4>
                    {!alert.read && <span className="px-2 py-1 bg-red-600 text-white text-xs rounded font-bold">NEW</span>}
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <div className="bg-white/50 rounded p-2 text-sm font-medium mb-2">
                    💡 Recommendation: {alert.recommendation}
                  </div>
                  <p className="text-xs opacity-75">
                    {alert.timestamp.toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="ml-4 p-2 hover:bg-white/30 rounded-lg transition"
                  title="Dismiss alert"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
