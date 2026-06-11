import { useState, useEffect } from 'react'
import { AlertManager, NotificationService } from '../../services/notifications'
import { X, AlertTriangle, CheckCircle, Info, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotificationCenter() {
  const [alerts, setAlerts] = useState([])
  const [showCenter, setShowCenter] = useState(false)

  useEffect(() => {
    // Update alerts every 5 seconds
    const interval = setInterval(() => {
      setAlerts(AlertManager.getAlerts())
    }, 5000)

    // Request notification permission on mount
    NotificationService.requestPermission()

    return () => clearInterval(interval)
  }, [])

  const handleClearAlert = (id) => {
    AlertManager.clearAlert(id)
    setAlerts(AlertManager.getAlerts())
  }

  const handleClearAll = () => {
    AlertManager.clearAll()
    setAlerts([])
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getAlertClass = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowCenter(!showCenter)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {alerts.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {alerts.length > 9 ? '9+' : alerts.length}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown */}
      {showCenter && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {alerts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Alerts List */}
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 border-l-4 ${getAlertClass(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{alert.title}</p>
                        <p className="text-slate-700 text-sm mt-1">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClearAlert(alert.id)}
                      className="p-1 hover:bg-slate-200 rounded transition flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}