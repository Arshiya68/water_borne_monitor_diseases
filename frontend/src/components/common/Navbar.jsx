import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Droplet, Menu, X, User, Settings, LogOut, BarChart3, Map, Home, ClipboardList, Bell, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 15000) // Poll every 15s
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/alerts')
      setNotifications(response.data)
      const lastViewed = localStorage.getItem('last_viewed_alerts') || 0
      const count = response.data.filter(n => new Date(n.created_at).getTime() > Number(lastViewed)).length
      setUnreadCount(count)
    } catch (err) {
      console.error('Error fetching alerts:', err)
    }
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      localStorage.setItem('last_viewed_alerts', Date.now().toString())
      setUnreadCount(0)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  if (!user) return null

  const getRoleColor = (role) => {
    switch (role) {
      case 'villager': return 'bg-blue-100 text-blue-800'
      case 'asha_worker': return 'bg-purple-100 text-purple-800'
      case 'official': return 'bg-green-100 text-green-800'
      case 'admin': return 'bg-slate-100 text-slate-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      villager: 'Villager',
      asha_worker: 'ASHA Worker',
      official: 'Health Official',
      admin: 'Admin',
    }
    return labels[role] || role
  }

  const dashboardPath = `/${user.role === 'asha_worker' ? 'asha' : user.role}`

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <Link to={dashboardPath} className="flex items-center space-x-2 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-slate-900 hidden sm:inline">WaterGuard</span>
            </Link>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to={dashboardPath}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-1 ${
                  isActive(dashboardPath)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/map"
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-1 ${
                  isActive('/map')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Map</span>
              </Link>

              <Link
                to="/analysis"
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-1 ${
                  isActive('/analysis')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>

              <Link
                to="/reports"
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-1 ${
                  isActive('/reports')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Reports</span>
              </Link>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center space-x-3">
              {/* User Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold hidden sm:inline-block ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-lg hover:bg-slate-100 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-900">Notifications</span>
                      <span className="text-xs text-blue-600 font-semibold">{notifications.length} total</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-500 text-sm">
                          No health alerts for your location
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 transition flex items-start space-x-3 text-left">
                            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              n.risk_level === 'High' ? 'text-rose-500' :
                              n.risk_level === 'Medium' ? 'text-amber-500' :
                              'text-emerald-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 capitalize">
                                {n.village || n.district || 'Broadcast'} Alert
                              </p>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-3">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button */}
              <Link
                to="/profile"
                className="p-2 rounded-lg hover:bg-slate-100 transition"
                title="Profile"
              >
                <User className="w-5 h-5 text-slate-700" />
              </Link>

              {/* Settings Button */}
              <Link
                to="/settings"
                className="p-2 rounded-lg hover:bg-slate-100 transition"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-slate-700" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-100 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-red-600" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-700" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-slate-200 pt-4">
              <Link
                to={dashboardPath}
                className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/map"
                className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Map
              </Link>
              <Link
                to="/analysis"
                className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Analytics
              </Link>
              <Link
                to="/reports"
                className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Reports
              </Link>
              <Link
                to="/profile"
                className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}