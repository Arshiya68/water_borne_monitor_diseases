import { useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Send, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AlertsPanel() {
  const [villages] = useState([
    'Nalgonda', 'Warangal', 'Hyderabad', 'Secunderabad', 'Medchal'
  ])
  const [formData, setFormData] = useState({
    village: '',
    risk_level: 'High',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [sentAlerts, setSentAlerts] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSendAlert = async (e) => {
    e.preventDefault()
    if (!formData.village) {
      toast.error('Please select a village')
      return
    }

    setSending(true)
    try {
      const response = await api.post('/alerts/trigger', {
        village: formData.village,
        risk_level: formData.risk_level,
      })

      setSentAlerts([
        {
          id: Date.now(),
          village: formData.village,
          risk_level: formData.risk_level,
          sent: response.data.sent,
          timestamp: new Date(),
        },
        ...sentAlerts,
      ])

      toast.success(`Alert sent to ${formData.village}! ${response.data.sent} people notified.`)
      setFormData({ village: '', risk_level: 'High', message: '' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send alert')
    } finally {
      setSending(false)
    }
  }

  const getMessage = () => {
    return `HEALTH ALERT [${formData.risk_level?.toUpperCase()}]: Waterborne disease outbreak detected in ${formData.village || '[village]'}. 🌊 Please boil water before drinking. 🏥 Seek medical help if experiencing symptoms. — District Health Office`
  }

  return (
    <div className="space-y-8">
      {/* Alert Info */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-200">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-orange-900 mb-2">⚠️ Send Community Health Alerts</h3>
            <p className="text-orange-800 mb-3">
              Send emergency SMS notifications to all registered villagers in selected areas. Use this feature responsibly during confirmed disease outbreaks.
            </p>
            <div className="text-sm text-orange-700 space-y-1">
              <p>✓ Alerts are sent via SMS to all villagers</p>
              <p>✓ Includes health recommendations and medical advice</p>
              <p>✓ Tracks delivery status and response rates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSendAlert} className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Send Alert</h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Village *
              </label>
              <select
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="input-field w-full"
                required
              >
                <option value="">-- Choose village --</option>
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Risk Level
              </label>
              <div className="space-y-2">
                {['Low', 'Medium', 'High'].map((level) => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="risk_level"
                      value={level}
                      checked={formData.risk_level === level}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-700 font-medium">{level} Risk</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={sending || !formData.village}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{sending ? 'Sending...' : '📢 Send Alert'}</span>
            </button>
          </form>
        </div>

        {/* Message Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Alert Message Preview</h3>
            <div className="bg-slate-900 text-white p-4 rounded-lg font-mono text-sm leading-relaxed">
              <p>{getMessage()}</p>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              📱 This message will be sent via SMS to all registered villagers
            </p>
          </div>

          {/* Alert History */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Alert History</h3>
            {sentAlerts.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No alerts sent yet</p>
            ) : (
              <div className="space-y-3">
                {sentAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.risk_level === 'High' ? 'bg-red-50 border-red-500' :
                    alert.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-green-50 border-green-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{alert.village}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {alert.sent} people notified • {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}