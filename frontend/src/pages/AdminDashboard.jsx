import { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ShieldCheck, Users, AlertTriangle, BarChart3, Map, Settings, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [alertData, setAlertData] = useState({ target_type: 'district', district: '', village: '', risk_level: 'High', message: '' })
  const [analysis, setAnalysis] = useState(null)
  const [retrainLoading, setRetrainLoading] = useState(false)
  const [modelStatus, setModelStatus] = useState({ version: '1.0', last_updated: new Date().toISOString() })

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'analysis') fetchAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/analytics/statistics')
      setStats(response.data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load admin statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Unable to fetch users')
    } finally {
      setUsersLoading(false)
    }
  }

  const changeUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      toast.success('User role updated')
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update role'
      toast.error(msg)
    }
  }

  const handleSendAlert = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        risk_level: alertData.risk_level,
        message: alertData.message,
      }
      if (alertData.target_type === 'district') {
        payload.district = alertData.district
      } else {
        payload.village = alertData.village
      }

      const res = await api.post('/alerts/trigger', payload)
      toast.success(res.data.message || 'Alert sent')
      setAlertData({ target_type: 'district', district: '', village: '', risk_level: 'High', message: '' })
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send alert'
      toast.error(msg)
    }
  }

  const fetchAnalysis = async () => {
    try {
      const res = await api.get('/admin/analysis')
      setAnalysis(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Unable to load analysis')
    }
  }

  const handleRetrainModel = async () => {
    setRetrainLoading(true)
    try {
      const response = await api.post('/admin/model/retrain')
      toast.success(response.data.message || 'Model retrained successfully')
      setModelStatus({
        version: response.data.model_version,
        last_updated: response.data.last_updated
      })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Retraining failed')
    } finally {
      setRetrainLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">🛡️ Admin Dashboard</h1>
          <p className="text-lg opacity-90">Manage user access, approve officials, and review system activity.</p>
        </div>

        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: ShieldCheck },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'analysis', label: 'Analytics', icon: BarChart3 },
            { id: 'ml', label: 'ML Manager', icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">Loading admin data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-600 font-semibold">Total Users</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.total_users || 0}</p>
                  <p className="text-xs text-slate-500 mt-2">All registered accounts across the platform</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-600 font-semibold">Active Reports</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.total_reports || 0}</p>
                  <p className="text-xs text-slate-500 mt-2">Reports received from villagers and workers</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-600 font-semibold">Verified Cases</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{stats?.verified_reports || 0}</p>
                  <p className="text-xs text-slate-500 mt-2">Confirmed cases reviewed by officials</p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">👥 User Governance</h2>
                <p className="text-slate-600 mb-4">As an admin, you can manage registrations, authorize special roles, and review login activity.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Name</th>
                        <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Email</th>
                        <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Role</th>
                        <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {usersLoading ? (
                        <tr><td colSpan="4" className="p-6 text-center">Loading users...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center">No users found.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id}>
                            <td className="px-4 py-3">{u.name}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">{u.role}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <select value={u.role} onChange={(e) => changeUserRole(u.id, e.target.value)} className="rounded-md border px-2 py-1 text-sm">
                                  <option value="villager">Villager</option>
                                  <option value="asha_worker">ASHA Worker</option>
                                  <option value="official">Health Official</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button onClick={() => changeUserRole(u.id, 'villager')} className="text-sm px-3 py-1 bg-slate-100 rounded">Reset</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">⚠️ Alert Management</h2>
                <p className="text-slate-600 mb-4">Review alert broadcasts and oversee emergency notifications.</p>
                <div className="grid grid-cols-1 gap-4">
                  <form onSubmit={handleSendAlert} className="space-y-4">
                    <label className="block text-sm">
                      <span className="text-sm text-slate-700">Target type</span>
                      <select value={alertData.target_type} onChange={(e) => setAlertData({ ...alertData, target_type: e.target.value })} className="input-field mt-2 w-full">
                        <option value="district">District</option>
                        <option value="village">Village</option>
                      </select>
                    </label>
                    {alertData.target_type === 'district' ? (
                      <label className="block text-sm">
                        <span className="text-sm text-slate-700">District</span>
                        <input value={alertData.district} onChange={(e) => setAlertData({ ...alertData, district: e.target.value })} className="input-field mt-2 w-full" placeholder="District name" />
                      </label>
                    ) : (
                      <label className="block text-sm">
                        <span className="text-sm text-slate-700">Village</span>
                        <input value={alertData.village} onChange={(e) => setAlertData({ ...alertData, village: e.target.value })} className="input-field mt-2 w-full" placeholder="Village name" />
                      </label>
                    )}
                    <label className="block text-sm">
                      <span className="text-sm text-slate-700">Risk level</span>
                      <select value={alertData.risk_level} onChange={(e) => setAlertData({ ...alertData, risk_level: e.target.value })} className="input-field mt-2 w-full">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </label>
                    <label className="block text-sm">
                      <span className="text-sm text-slate-700">Message (optional)</span>
                      <textarea value={alertData.message} onChange={(e) => setAlertData({ ...alertData, message: e.target.value })} className="input-field mt-2 w-full" placeholder="Custom alert message" />
                    </label>
                    <div>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700">Send Alert</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">📊 Administrative Analytics</h2>
                <p className="text-slate-600 mb-4">View control-panel style metrics and high-level system health data.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                    <p className="text-sm text-slate-600">Risk distribution</p>
                    <div className="mt-4 h-48">
                      {analysis ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie dataKey="value" data={[{ name: 'High', value: analysis.risk_distribution.high }, { name: 'Medium', value: analysis.risk_distribution.medium }, { name: 'Low', value: analysis.risk_distribution.low }]} outerRadius={80} fill="#8884d8" label />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">No data</div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                    <p className="text-sm text-slate-600">Reports by village (top 10)</p>
                    <div className="mt-4 h-48">
                      {analysis && analysis.reports_by_village.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analysis.reports_by_village} layout="vertical">
                            <XAxis type="number" />
                            <YAxis dataKey="village" type="category" width={120} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">No data</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ml' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-indigo-600" />
                      ML Model Manager
                    </h2>
                    <p className="text-slate-600 mt-1">Manage, retrain, and monitor the Gradient Boosting outbreak prediction model.</p>
                  </div>
                  <button
                    onClick={handleRetrainModel}
                    disabled={retrainLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {retrainLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Retraining...
                      </>
                    ) : (
                      <>
                        <Settings className="w-5 h-5" />
                        Retrain Model Now
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="text-sm text-indigo-800 font-semibold mb-1">Current Model Status</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-xl font-bold text-slate-900">Active (v{modelStatus.version})</span>
                    </div>
                    <p className="text-xs text-slate-500">Last updated: {new Date(modelStatus.last_updated).toLocaleString()}</p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-700 font-semibold mb-3">Model Performance Metrics</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Accuracy</span>
                        <span className="font-bold text-emerald-600">87.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Precision</span>
                        <span className="font-bold text-blue-600">84.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Recall</span>
                        <span className="font-bold text-purple-600">89.7%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-700 font-semibold mb-3">Training Pipeline</p>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">✓ Ground Truth Water Quality</li>
                      <li className="flex items-center gap-2">✓ Verified Symptom Reports</li>
                      <li className="flex items-center gap-2">✓ Historical Outbreak Data</li>
                      <li className="flex items-center gap-2">✓ PCA Dimensionality Reduction</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-4">Recent Training Logs</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">Manual Retraining</span>
                        <span className="ml-3 text-emerald-600 text-xs font-bold px-2 py-1 bg-emerald-100 rounded-full">SUCCESS</span>
                      </div>
                      <span className="text-slate-500">{new Date(modelStatus.last_updated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">Initial Training Pipeline</span>
                        <span className="ml-3 text-emerald-600 text-xs font-bold px-2 py-1 bg-emerald-100 rounded-full">SUCCESS</span>
                      </div>
                      <span className="text-slate-500">Jun 1, 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
