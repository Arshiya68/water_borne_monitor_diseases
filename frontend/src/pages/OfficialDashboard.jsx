import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import { 
  Activity, 
  Map, 
  BarChart3, 
  Sliders, 
  Bell, 
  Send, 
  ShieldAlert, 
  Droplet,
  AlertCircle
} from 'lucide-react'
import OutbreakMap from '../components/official/OutbreakMap'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TELANGANA_DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Nalgonda', 'Warangal Urban',
  'Warangal Rural', 'Vikarabad', 'Karimnagar', 'Rajahmundry', 'Kakinada',
  'Nizamabad', 'Kamareddy', 'Adilabad', 'Nirmal', 'Khammam',
  'Mahbubnagar', 'Nagarkurnool', 'Wanaparthy'
]

const SYMPTOM_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4']

const WATER_SOURCE_COLORS = {
  tap: { bg: 'bg-blue-50 border-blue-200 text-blue-700', icon: '🚰' },
  borewell: { bg: 'bg-amber-50 border-amber-200 text-amber-700', icon: '⛏️' },
  river: { bg: 'bg-cyan-50 border-cyan-200 text-cyan-700', icon: '🏞️' },
  tank: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: '🪣' },
  well: { bg: 'bg-violet-50 border-violet-200 text-violet-700', icon: '🕳️' },
  other: { bg: 'bg-slate-50 border-slate-200 text-slate-700', icon: '💧' },
}

export default function OfficialDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDistrict, setSelectedDistrict] = useState(TELANGANA_DISTRICTS[0])
  const [mlAnalysis, setMlAnalysis] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)
  
  // Alert Broadcast State
  const [broadcastData, setBroadcastData] = useState({
    district: TELANGANA_DISTRICTS[0],
    village: '',
    risk_level: 'High',
    message: ''
  })
  const [broadcasting, setBroadcasting] = useState(false)
  const [activeAlerts, setActiveAlerts] = useState([])

  useEffect(() => {
    fetchStats()
    fetchActiveAlerts()
  }, [])

  useEffect(() => {
    if (activeTab === 'analysis' && selectedDistrict) {
      fetchMlAnalysis()
    }
  }, [selectedDistrict, activeTab])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/analytics/statistics')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast.error('Failed to load system statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveAlerts = async () => {
    try {
      const response = await api.get('/alerts')
      setActiveAlerts(response.data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const fetchMlAnalysis = async () => {
    try {
      setMlLoading(true)
      const response = await api.get(`/analytics/ml-analysis/${selectedDistrict}`)
      setMlAnalysis(response.data)
    } catch (error) {
      console.error('ML analysis error:', error)
      toast.error('Failed to load ML analysis for ' + selectedDistrict)
      setMlAnalysis(null)
    } finally {
      setMlLoading(false)
    }
  }

  const handleBroadcastAlert = async (e) => {
    e.preventDefault()
    setBroadcasting(true)
    try {
      const payload = {
        district: broadcastData.district,
        risk_level: broadcastData.risk_level,
        message: broadcastData.message || undefined
      }
      if (broadcastData.village) {
        payload.village = broadcastData.village
      }
      
      const response = await api.post('/alerts/trigger', payload)
      toast.success(`Emergency warning broadcasted successfully! ${response.data.sms_sent} SMS sent.`)
      setBroadcastData({
        district: TELANGANA_DISTRICTS[0],
        village: '',
        risk_level: 'High',
        message: ''
      })
      fetchActiveAlerts()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to trigger broadcast warning')
    } finally {
      setBroadcasting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-3xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">Epidemiological Surveillance Portal</span>
            <h1 className="text-4xl font-extrabold mt-3 mb-2 flex items-center gap-2">
              <span>🏥 Health Official Warning Center</span>
            </h1>
            <p className="text-emerald-100 text-sm max-w-2xl mt-1">
              Analyze localized water quality correlations, view active outbreak maps, audit machine learning prediction models, and dispatch emergency SMS warnings.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 mb-8 shadow-sm">
          <nav className="flex flex-wrap gap-1">
            {[
              { id: 'overview', label: 'EWS Overview', icon: Activity },
              { id: 'map', label: 'Outbreak Hotspot Map', icon: Map },
              { id: 'analysis', label: 'ML Risk Analysis', icon: BarChart3 },
              { id: 'alerts', label: 'Emergency Broadcast', icon: Bell },
              { id: 'simulator', label: 'Outbreak Simulator', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Syncing database parameters...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Reports</p>
                    <p className="text-3xl font-extrabold text-blue-600 mt-2">{stats?.total_reports || 0}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Logged by local citizens</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verified Cases</p>
                    <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats?.verified_reports || 0}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Ground checked by ASHA workers</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">High Risk Cases</p>
                    <p className="text-3xl font-extrabold text-rose-600 mt-2">{stats?.high_risk_cases || 0}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Require immediate containment</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Affected Districts</p>
                    <p className="text-3xl font-extrabold text-amber-600 mt-2">{stats?.affected_districts || 0}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Telangana surveillance zones</p>
                  </div>
                </div>

                {/* Warnings / Active threats */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      <span>Active Location Warnings & Alerts ({activeAlerts.length})</span>
                    </h3>
                    <button 
                      onClick={() => setActiveTab('alerts')}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      + Create Alert
                    </button>
                  </div>

                  {activeAlerts.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-500 text-sm">
                      🟢 All Clear: No active outbreak alerts or warnings found in database logs.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeAlerts.slice(0, 4).map((alert) => (
                        <div
                          key={alert.id}
                          className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex items-start space-x-3"
                        >
                          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 font-bold rounded">
                                {alert.risk_level} Risk
                              </span>
                              <span className="text-slate-400 font-semibold">
                                {new Date(alert.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-xs text-slate-900 capitalize mt-2">
                              {alert.village || alert.district}
                            </h4>
                            <p className="text-xs mt-1 text-slate-600 leading-relaxed font-mono">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit Tools */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-emerald-600" />
                    <span>System Surveillance Capabilities</span>
                  </h3>
                  <ul className="text-xs space-y-2.5 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span><strong>Automated Cluster Detection:</strong> System triggers alerts when 3+ cases occur in the same village/district in a 7-day window.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span><strong>ML Predictive Correlator:</strong> Feeds symptoms and raw water parameters directly to the optimized Gradient Boosting classifier.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span><strong>Distributed Broadcaster:</strong> Direct SMS pipelines targeting villagers, field workers, and response centers.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* MAP VIEW TAB */}
            {activeTab === 'map' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Map className="w-5 h-5 text-emerald-600" />
                  <span>Outbreak Hotspot Map</span>
                </h2>
                <p className="text-slate-500 text-xs mb-6">Interactive GIS Map visualising physical water contamination and symptom reports across Telangana districts.</p>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                  <OutbreakMap />
                </div>
              </div>
            )}

            {/* ANALYTICS & ML INSIGHTS */}
            {activeTab === 'analysis' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>ML Risk Analysis & Anomaly Tracking</span>
                  </h2>
                  <p className="text-slate-500 text-xs mb-4">Correlate crowdsourced symptoms with water quality metrics. Select district to review ML predictions.</p>
                  
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Surveillance Zone:</label>
                    <select
                      value={selectedDistrict}
                      onChange={e => setSelectedDistrict(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition shadow-sm"
                    >
                      {TELANGANA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Symptom Bar Chart */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">Symptom Distribution</h3>
                    <p className="text-[10px] text-slate-400 mb-4">Reported symptom frequencies across all districts</p>
                    
                    {stats?.symptom_distribution ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={Object.entries(stats.symptom_distribution).map(([key, value]) => ({
                            name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                            count: value,
                          }))}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" height={60} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#1e293b' }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {Object.keys(stats.symptom_distribution).map((_, i) => (
                              <Cell key={i} fill={SYMPTOM_COLORS[i % SYMPTOM_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No symptom data available</div>
                    )}
                  </div>

                  {/* ML Risk Drivers */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">ML Outbreak Assessment</h3>
                    <p className="text-[10px] text-slate-400 mb-4">Machine learning risk drivers for <span className="font-bold text-emerald-600">{selectedDistrict}</span></p>
                    
                    {mlLoading ? (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold">Running models...</span>
                      </div>
                    ) : mlAnalysis ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                            mlAnalysis.prediction?.risk_level === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                            mlAnalysis.prediction?.risk_level === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {mlAnalysis.prediction?.risk_level === 'High' ? '🔴' : mlAnalysis.prediction?.risk_level === 'Medium' ? '🟡' : '🟢'}
                            {mlAnalysis.prediction?.risk_level} Outbreak Risk
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">
                            Confidence Probability: <strong className="text-slate-800">{((mlAnalysis.prediction?.probability || 0) * 100).toFixed(1)}%</strong>
                          </span>
                        </div>

                        {mlAnalysis.drivers && mlAnalysis.drivers.length > 0 ? (
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Risk Drivers (Impact Score)</h4>
                            <div className="space-y-3">
                              {mlAnalysis.drivers.map((driver, idx) => {
                                const maxImpact = Math.max(...mlAnalysis.drivers.map(d => Math.abs(d.impact || d.importance || 0)))
                                const impact = Math.abs(driver.impact || driver.importance || 0)
                                const pct = maxImpact > 0 ? (impact / maxImpact) * 100 : 0
                                return (
                                  <div key={idx} className="text-xs">
                                    <div className="flex justify-between mb-1.5">
                                      <span className="text-slate-700 font-semibold capitalize">{(driver.feature || driver.name || '').replace(/_/g, ' ')}</span>
                                      <span className="text-slate-500 font-bold">{(impact).toFixed(1)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                                      <div
                                        className={`h-1.5 rounded-full ${
                                          idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${Math.max(pct, 5)}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                            No risk factors exceeding statistical thresholds.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Select a district to run predictions</div>
                    )}
                  </div>
                </div>

                {/* Water Sources breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">Local Water Source Distribution</h3>
                  <p className="text-[10px] text-slate-400 mb-4">Breakdown of drinking water infrastructure reports</p>
                  
                  {stats?.water_source_distribution ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(stats.water_source_distribution).map(([source, count]) => {
                        const style = WATER_SOURCE_COLORS[source.toLowerCase()] || WATER_SOURCE_COLORS.other
                        return (
                          <div key={source} className={`${style.bg} border rounded-xl p-4 text-center shadow-sm`}>
                            <span className="text-2xl">{style.icon}</span>
                            <p className="text-2xl font-black mt-2 text-slate-800">{count}</p>
                            <p className="text-[10px] text-slate-450 font-bold capitalize mt-1">{source.replace(/_/g, ' ')}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-slate-400 text-xs">No water source data available</div>
                  )}
                </div>
              </div>
            )}

            {/* EMERGENCY BROADCAST TABS */}
            {activeTab === 'alerts' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-start space-x-4 shadow-sm">
                  <AlertCircle className="w-8 h-8 text-rose-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">📢 Dispatch Regional Outbreak Warnings</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-3xl">
                      Send emergency warnings via SMS and dashboard alerts directly to all registered users inside selected Telangana districts and villages. Use responsibly.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form */}
                  <form onSubmit={handleBroadcastAlert} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 h-fit shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Trigger Emergency Alert</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Target District *</label>
                      <select
                        value={broadcastData.district}
                        onChange={(e) => setBroadcastData({ ...broadcastData, district: e.target.value })}
                        className="input-field w-full text-xs text-slate-700 bg-white border-slate-200"
                        required
                      >
                        {TELANGANA_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Village (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. TestVillage (Leaves empty to target entire district)"
                        value={broadcastData.village}
                        onChange={(e) => setBroadcastData({ ...broadcastData, village: e.target.value })}
                        className="input-field w-full text-xs text-slate-700 bg-white border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Risk Level</label>
                      <select
                        value={broadcastData.risk_level}
                        onChange={(e) => setBroadcastData({ ...broadcastData, risk_level: e.target.value })}
                        className="input-field w-full text-xs text-slate-700 bg-white border-slate-200"
                      >
                        <option value="High">🔴 High Risk</option>
                        <option value="Medium">🟡 Medium Risk</option>
                        <option value="Low">🟢 Low Risk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Custom Alert Message (Optional)</label>
                      <textarea
                        placeholder="Leave empty to use automatic templated warning text"
                        value={broadcastData.message}
                        onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                        rows="3"
                        className="input-field w-full text-xs text-slate-700 bg-white border-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={broadcasting}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {broadcasting ? 'Dispatching SMS...' : '📢 Send Outbreak Warning'}
                    </button>
                  </form>

                  {/* Previews and history */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">SMS Dispatch Preview</h3>
                      <div className="bg-slate-50 text-slate-800 p-4 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed">
                        {broadcastData.message || `HEALTH ALERT [${broadcastData.risk_level} Risk]: Possible waterborne disease risk in ${broadcastData.village ? `${broadcastData.village}, ` : ''}${broadcastData.district}. Follow safety guidance and boil drinking water.`}
                      </div>
                      <p className="text-[10px] text-slate-450 mt-2">📱 System auto-targets active phone directories registered in the selected region.</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">System Alerts Log ({activeAlerts.length})</h3>
                      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                        {activeAlerts.map(alert => (
                          <div key={alert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-extrabold text-slate-800 text-xs">{alert.village || alert.district}</span>
                              <span className="text-[10px] text-slate-450 font-semibold">{new Date(alert.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-650 font-mono text-[11px] leading-relaxed">{alert.message}</p>
                            <span className="inline-block mt-3 text-[10px] font-bold text-slate-450">Sender: {alert.sender_name || 'System'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OUTBREAK SIMULATOR */}
            {activeTab === 'simulator' && <SimulatorPanel />}

          </div>
        )}
      </div>
    </div>
  )
}

function SimulatorPanel() {
  const [params, setParams] = useState({
    ph: 7.0,
    turbidity: 2.0,
    nitrates: 4.0,
    dissolved_oxygen: 7.5,
    sulphates: 50.0,
    total_suspended_solids: 15.0,
    chlorophyll_a: 5.0,
    diarrhea: 0,
    vomiting: 0,
    fever: 0,
    abdominal_pain: 0,
    dehydration: 0,
    water_source: 1,
    household_affected: 2,
    age_group: 1,
    symptom_duration: 3
  })
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSliderChange = (name, val) => {
    setParams(prev => ({ ...prev, [name]: Number(val) }))
  }

  const runSimulation = async () => {
    setLoading(true)
    try {
      const response = await api.post('/predictions/predict', params)
      setPrediction(response.data)
    } catch (err) {
      toast.error('Simulation calculation failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSimulation()
  }, [params])

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6 text-left animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>🔮 ML Outbreak Simulator</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Simulate outbreak risk levels in real-time by adjusting water parameters and symptom rates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sliders */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">Water Quality Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-550 flex justify-between">
                <span>Turbidity: {params.turbidity} NTU</span>
                <span>(WHO Limit: 5.0)</span>
              </label>
              <input type="range" min="0" max="60" step="0.5" value={params.turbidity} onChange={e => handleSliderChange('turbidity', e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-1" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-550 flex justify-between">
                <span>pH level: {params.ph}</span>
                <span>(Safe: 6.5 - 8.5)</span>
              </label>
              <input type="range" min="3" max="11" step="0.1" value={params.ph} onChange={e => handleSliderChange('ph', e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-1" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-555 flex justify-between">
                <span>Nitrates: {params.nitrates} mg/L</span>
                <span>(WHO Limit: 10.0)</span>
              </label>
              <input type="range" min="0" max="80" step="0.5" value={params.nitrates} onChange={e => handleSliderChange('nitrates', e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-1" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-555 flex justify-between">
                <span>Dissolved Oxygen: {params.dissolved_oxygen} mg/L</span>
                <span>(Safe: 6.0+)</span>
              </label>
              <input type="range" min="1" max="12" step="0.1" value={params.dissolved_oxygen} onChange={e => handleSliderChange('dissolved_oxygen', e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-1" />
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 pt-2">Community Symptoms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-555 flex justify-between">
                <span>Diarrhea Incidence: {Math.round(params.diarrhea * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={params.diarrhea} onChange={e => handleSliderChange('diarrhea', e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-1" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-555 flex justify-between">
                <span>Vomiting Incidence: {Math.round(params.vomiting * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={params.vomiting} onChange={e => handleSliderChange('vomiting', e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mt-1" />
            </div>
          </div>
        </div>

        {/* Prediction Display */}
        <div className="bg-slate-55 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">Simulated Outbreak Threat</h4>
            {loading ? (
              <div className="py-8 text-center text-slate-450 font-bold animate-pulse text-xs">Evaluating parameters...</div>
            ) : prediction ? (
              <div className="mt-4">
                <p className={`text-3xl font-extrabold ${
                  prediction.risk_level === 'High' ? 'text-rose-600 animate-pulse' :
                  prediction.risk_level === 'Medium' ? 'text-amber-500' :
                  'text-emerald-600'
                }`}>{prediction.risk_level} Outbreak Risk</p>
                <div className="mt-6 space-y-3 text-xs text-slate-500 border-t border-slate-200 pt-4">
                  <div className="flex justify-between">
                    <span>Model Prediction:</span>
                    <span className="font-bold text-slate-800">{Math.round(prediction.probability * 100)}% risk</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Water Quality Score:</span>
                    <span className="font-bold text-slate-800">{prediction.water_quality_score.toFixed(1)}/100</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-[10px] text-slate-450 leading-relaxed font-sans font-medium">
              * The simulation runs raw inputs directly through the backend Gradient Boosting model pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}