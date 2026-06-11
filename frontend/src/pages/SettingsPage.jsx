import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/common/Navbar'
import toast from 'react-hot-toast'
import { Settings, Bell, Palette, LogOut, Moon, Sun, AlertCircle, Lock, Eye, Type, MapPin, RefreshCw, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('appearance')
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('normal')
  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    emergencyAlerts: true,
    nearbyOutbreaks: true,
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedFontSize = localStorage.getItem('fontSize') || 'normal'
    setTheme(savedTheme)
    setFontSize(savedFontSize)
    
    const saved = localStorage.getItem('notifications')
    if (saved) setNotifications(JSON.parse(saved))
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    // Light theme only - no dark mode
    document.documentElement.classList.remove('dark')
    toast.success(`Light theme is now active`)
  }

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize)
    const root = document.documentElement
    if (newSize === 'small') root.style.fontSize = '14px'
    else if (newSize === 'large') root.style.fontSize = '18px'
    else root.style.fontSize = '16px'
    toast.success(`Font size changed to ${newSize}`)
  }

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
    toast.success('Notification settings updated')
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center space-x-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <span>Settings</span>
          </h1>
          <p className="text-slate-600 mt-2">Customize your WaterGuard experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2 sticky top-20">
              {[
                { id: 'appearance', label: 'Appearance', icon: Palette },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'accessibility', label: 'Accessibility', icon: Eye },
                { id: 'security', label: 'Security', icon: Lock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition flex items-center space-x-2 ${
                    activeTab === id ? 'bg-blue-100 text-blue-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                    <Palette className="w-6 h-6 text-blue-600" />
                    <span>Theme</span>
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-8 rounded-lg border-2 border-blue-600 bg-blue-50 transition text-center`}
                    >
                      <Sun className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
                      <p className="font-bold text-slate-900 text-lg">Light Theme</p>
                      <p className="text-sm text-slate-600 mt-2">Clean, bright interface optimized for daytime use</p>
                      <p className="text-xs text-blue-700 mt-3 font-semibold">✓ Active</p>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                    <Type className="w-5 h-5 text-blue-600" />
                    <span>Font Size</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'small', label: 'Small', size: '14px' },
                      { id: 'normal', label: 'Normal', size: '16px' },
                      { id: 'large', label: 'Large', size: '18px' },
                    ].map(({ id, label, size }) => (
                      <button
                        key={id}
                        onClick={() => handleFontSizeChange(id)}
                        className={`p-4 rounded-lg border-2 transition text-center ${
                          fontSize === id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p style={{ fontSize: size }} className="font-semibold text-slate-900">
                          {label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <span>Notifications</span>
                </h2>

                <div className="space-y-4">
                  {[
                    { key: 'sms', label: 'SMS Alerts', description: 'Receive urgent health alerts via SMS' },
                    { key: 'email', label: 'Email Alerts', description: 'Get detailed reports via email' },
                    { key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Critical health emergency alerts' },
                    { key: 'nearbyOutbreaks', label: 'Nearby Outbreak Alerts', description: 'Alerts for outbreaks in your area' },
                  ].map(({ key, label, description }) => (
                    <label
                      key={key}
                      className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={notifications[key]}
                        onChange={() => handleNotificationChange(key)}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-600 mt-1">{description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ACCESSIBILITY TAB */}
            {activeTab === 'accessibility' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <span>Accessibility Options</span>
                </h2>

                <div className="space-y-4">
                  <p className="text-slate-600 mb-4">🔊 Voice Features: All buttons have voice descriptions. Press the volume icon to listen.</p>
                  <p className="text-slate-600">♿ Keyboard Navigation: Use Tab to navigate between elements, Enter to select.</p>
                  <p className="text-slate-600 mt-4">📱 Mobile Support: Full touch support for mobile devices.</p>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-8">
                <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6" />
                  <span>Logout</span>
                </h2>

                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout from All Devices</span>
                </button>
                <p className="text-sm text-red-700 mt-3">
                  This will log you out from all active sessions. You'll need to login again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}