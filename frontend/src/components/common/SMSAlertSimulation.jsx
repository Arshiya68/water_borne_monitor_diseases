import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function SMSAlertSimulation() {
  const [sentAlerts, setSentAlerts] = useState([
    {
      id: 1,
      recipient: 'Ward 3 - All Residents',
      message: '⚠️ HEALTH ALERT: 5 diarrhea cases reported in your area. Boil water before drinking. Seek medical help if symptoms appear.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'delivered',
      recipientCount: 342,
      deliveredCount: 338,
    },
    {
      id: 2,
      recipient: 'All ASHA Workers',
      message: '📢 ACTION REQUIRED: Verify reports in Ward 2. Check water sources and collect samples. Reply with updates.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'delivered',
      recipientCount: 12,
      deliveredCount: 12,
    },
    {
      id: 3,
      recipient: 'Health Officials',
      message: '🚨 OUTBREAK WARNING: Typhoid risk at 72% in your district. Deploy response teams and increase surveillance.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'delivered',
      recipientCount: 8,
      deliveredCount: 8,
    },
  ])

  const [newAlert, setNewAlert] = useState({
    recipient: 'all-residents',
    message: '',
    priority: 'normal',
  })

  const handleSendAlert = () => {
    if (!newAlert.message.trim()) {
      alert('Please enter a message')
      return
    }

    const alert = {
      id: sentAlerts.length + 1,
      recipient: newAlert.recipient === 'all-residents' ? 'All Residents' : 'Selected Group',
      message: newAlert.message,
      timestamp: new Date(),
      status: 'delivered',
      recipientCount: newAlert.recipient === 'all-residents' ? 2847 : 450,
      deliveredCount: newAlert.recipient === 'all-residents' ? 2834 : 445,
    }

    setSentAlerts([alert, ...sentAlerts])
    setNewAlert({ recipient: 'all-residents', message: '', priority: 'normal' })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return '✅'
      case 'sent':
        return '📤'
      case 'pending':
        return '⏳'
      default:
        return '❓'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900'
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900'
      case 'normal':
        return 'bg-blue-100 border-blue-300 text-blue-900'
      default:
        return 'bg-slate-100 border-slate-300 text-slate-900'
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2 mb-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <span>SMS Alert Center</span>
        </h3>
        <p className="text-slate-600">Send critical health alerts and emergency notifications to the community via SMS</p>
      </div>

      {/* Compose Alert */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-slate-900 mb-4">📤 Compose New Alert</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Recipient Group</label>
            <select
              value={newAlert.recipient}
              onChange={(e) => setNewAlert({ ...newAlert, recipient: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all-residents">All Residents (2,847 people)</option>
              <option value="asha-workers">ASHA Workers (12 people)</option>
              <option value="officials">Health Officials (8 people)</option>
              <option value="parents">Parents Group (534 people)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Priority Level</label>
            <div className="flex gap-3">
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setNewAlert({ ...newAlert, priority: level.value })}
                  className={`px-4 py-2 rounded-lg font-bold border-2 transition ${
                    newAlert.priority === level.value
                      ? `border-blue-600 ${getPriorityColor(level.value)}`
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Message ({newAlert.message.length}/160 characters)
            </label>
            <textarea
              value={newAlert.message}
              onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value.slice(0, 160) })}
              placeholder="Type your health alert message here..."
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
              rows="4"
            />
            <p className="text-xs text-slate-500 mt-2">
              💡 Keep message short and clear for SMS. Use emojis and numbers for quick understanding.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendAlert}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Alert via SMS</span>
            </button>
            <button
              onClick={() => setNewAlert({ recipient: 'all-residents', message: '', priority: 'normal' })}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-bold hover:border-slate-400 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Alert Templates */}
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-4">📋 Quick Alert Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Disease Outbreak',
              template:
                '⚠️ HEALTH ALERT: Multiple cases reported in your area. Symptoms: diarrhea, vomiting. Use boiled water. See doctor if affected.',
            },
            {
              title: 'Water Contamination',
              template: '🚨 WATER ALERT: Contamination detected in local supply. Use alternative sources or boil water for 5 mins. Stay hydrated.',
            },
            {
              title: 'Safe Water Available',
              template: '✅ GOOD NEWS: Safe water distribution started at Ward 1. Free distribution 9-6pm. Bring containers.',
            },
            {
              title: 'Preventive Health Tip',
              template: '💡 HEALTH TIP: Wash hands before eating & after toilet. Drink only boiled/filtered water. Prevent water-borne diseases.',
            },
          ].map((template, idx) => (
            <button
              key={idx}
              onClick={() => setNewAlert({ ...newAlert, message: template.template })}
              className="p-4 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <p className="font-bold text-slate-900">{template.title}</p>
              <p className="text-sm text-slate-600 mt-2">{template.template}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sent Alerts History */}
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-4">📨 Alert History (Last 24 Hours)</h4>
        <div className="space-y-4">
          {sentAlerts.map((alert) => (
            <div key={alert.id} className="bg-slate-50 border-2 border-slate-300 rounded-lg p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl">{getStatusIcon(alert.status)}</span>
                    <h5 className="font-bold text-slate-900">{alert.recipient}</h5>
                  </div>
                  <p className="text-slate-700 font-mono text-sm bg-white rounded p-3 my-2">{alert.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-white rounded">
                <div>
                  <p className="text-xs text-slate-600">Sent To</p>
                  <p className="font-bold text-slate-900">{alert.recipientCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Delivered</p>
                  <p className="font-bold text-green-600">{alert.deliveredCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Success Rate</p>
                  <p className="font-bold text-slate-900">
                    {Math.round((alert.deliveredCount / alert.recipientCount) * 100)}%
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Sent {alert.timestamp.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Integration Info */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="font-bold text-purple-900 mb-3">📱 About SMS Alerts</h4>
        <ul className="space-y-2 text-sm text-purple-900">
          <li>✓ Alerts reach 95%+ of residents within 2 minutes</li>
          <li>✓ Works on all mobile phones without internet</li>
          <li>✓ Critical for rural areas with low connectivity</li>
          <li>✓ Integrates with local telecom providers</li>
          <li>✓ Real-time delivery tracking and confirmation</li>
          <li>✓ Supports 10+ languages for better comprehension</li>
        </ul>
      </div>
    </div>
  )
}
