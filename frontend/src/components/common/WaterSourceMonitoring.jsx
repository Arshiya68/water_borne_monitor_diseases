import { useState, useEffect } from 'react'
import { Droplet, AlertCircle, CheckCircle, Clock, AlertTriangle, Settings, RefreshCw, X, HelpCircle } from 'lucide-react'
import { getWaterSources } from '../../services/features'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function WaterSourceMonitoring() {
  const { user } = useAuth()
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'safe', 'critical'
  
  // Incident Form state
  const [selectedSource, setSelectedSource] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [issueType, setIssueType] = useState('Water Contamination')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSources = async () => {
    setLoading(true)
    try {
      // Fetch all sources for district
      const response = await getWaterSources(null, user?.district)
      if (response.data && response.data.length > 0) {
        setSources(response.data)
      } else {
        // Fallback to local mock data if database is empty
        setSources(getMockSources())
      }
    } catch (error) {
      console.error('Failed to fetch water sources:', error)
      setSources(getMockSources())
    } finally {
      setLoading(false)
    }
  }

  const getMockSources = () => [
    {
      id: 1,
      name: 'Main Hand Pump A',
      location: 'Ward 1 - Main Street',
      source_type: 'tap',
      status: 'safe',
      ph_level: 7.2,
      turbidity: 'Low',
      bacterial_count: 'Safe',
      capacity: '5000 L',
      availability: '24/7',
      last_tested: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 2,
      name: 'Borewell B2',
      location: 'Ward 2 - School Area',
      source_type: 'borewell',
      status: 'contaminated',
      ph_level: 6.5,
      turbidity: 'High',
      bacterial_count: 'Unsafe',
      capacity: '10000 L',
      availability: '08:00 - 20:00',
      last_tested: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 3,
      name: 'Central Village Tank',
      source_type: 'tank',
      location: 'Central Supply Plaza',
      status: 'inspection',
      ph_level: 7.0,
      turbidity: 'Moderate',
      bacterial_count: 'Testing',
      capacity: '25000 L',
      availability: '06:00 - 18:00',
      last_tested: new Date(Date.now() - 3600000).toISOString()
    }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'safe':
        return { icon: '✅', label: 'Safe', color: 'bg-green-100 border-green-300 text-green-900 shadow-green-100' }
      case 'contaminated':
        return { icon: '⚠️', label: 'Contaminated', color: 'bg-red-100 border-red-300 text-red-900 shadow-red-100' }
      case 'inspection':
        return { icon: '🔍', label: 'Under Inspection', color: 'bg-yellow-100 border-yellow-300 text-yellow-900 shadow-yellow-100' }
      default:
        return { icon: '❓', label: 'Unknown', color: 'bg-slate-100 border-slate-300 text-slate-900 shadow-slate-100' }
    }
  }

  const handleOpenReport = (source) => {
    setSelectedSource(source)
    setDescription('')
    setIssueType('Water Contamination')
    setShowForm(true)
  }

  const handleSubmitIncident = async (e) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error('Please describe the issue')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        issue_type: issueType,
        description: `Source: ${selectedSource.name} (${selectedSource.location}). Details: ${description}`
      }
      await api.post('/incident-report', payload)
      toast.success('Incident report submitted successfully!')
      setShowForm(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit incident report')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredSources = sources.filter(source => {
    if (filter === 'safe') return source.status === 'safe'
    if (filter === 'critical') return source.status === 'contaminated' || source.status === 'inspection'
    return true
  })

  const safeCount = sources.filter(s => s.status === 'safe').length
  const unsafeCount = sources.filter(s => s.status === 'contaminated').length
  const inspectionCount = sources.filter(s => s.status === 'inspection').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Droplet className="w-7 h-7 text-blue-600 animate-pulse" />
            <span>Water Source Quality & Security</span>
          </h3>
          <p className="text-slate-500 text-sm mt-1">Real-time status of public water supplies in {user?.district || 'Telangana'}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${filter === 'all' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:border-slate-300'}`}
          >
            All Sources ({sources.length})
          </button>
          <button 
            onClick={() => setFilter('safe')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${filter === 'safe' ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white text-slate-600 hover:border-slate-300'}`}
          >
            Safe Only ({safeCount})
          </button>
          <button 
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${filter === 'critical' ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white text-slate-600 hover:border-slate-300'}`}
          >
            Warnings/Alerts ({unsafeCount + inspectionCount})
          </button>
          <button 
            onClick={fetchSources}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition"
            title="Refresh Water Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading water source directories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSources.map((source) => {
            const badge = getStatusBadge(source.status)
            return (
              <div
                key={source.id}
                className={`rounded-2xl border-2 p-6 transition flex flex-col justify-between hover:shadow-xl ${badge.color} shadow-sm`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{source.name}</h4>
                      <p className="text-sm opacity-80 text-slate-700">{source.location}</p>
                    </div>
                    <span className="px-3 py-1 bg-white rounded-full font-bold text-xs shadow-sm flex items-center gap-1 border">
                      {badge.icon} {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6 bg-white/40 p-4 rounded-xl border border-white/50 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs block">pH Level</span>
                      <span className="font-bold text-slate-900">{source.ph_level || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">Turbidity</span>
                      <span className="font-bold text-slate-900">{source.turbidity || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">Bacterial Count</span>
                      <span className="font-bold text-slate-900">{source.bacterial_count || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block">Operating Hours</span>
                      <span className="font-bold text-slate-900">{source.availability || '24/7'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200/50">
                  <div className="flex justify-between items-center text-xs opacity-75 text-slate-600">
                    <span>Capacity: {source.capacity || 'N/A'}</span>
                    <span>Last tested: {source.last_tested ? new Date(source.last_tested).toLocaleTimeString() : 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenReport(source)}
                      className="w-full py-2.5 px-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition text-xs shadow-sm shadow-red-200 flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report Contamination
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSource(source)
                        setDescription('')
                        setIssueType('Operational Complaint')
                        setShowForm(true)
                      }}
                      className="w-full py-2.5 px-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition text-xs shadow-sm flex items-center justify-center gap-1"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Submit Complaint
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Incident Report Modal Form */}
      {showForm && selectedSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-blue-600 w-5 h-5" />
                <span>File Report: {selectedSource.name}</span>
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitIncident} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="Water Contamination">⚠️ Water Contamination (Color, Odor, Taste)</option>
                  <option value="Operational Complaint">🔧 Operational Issue (Broken pump, leak, no flow)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Description</label>
                <textarea
                  placeholder="Please describe what is wrong in detail (e.g. water looks muddy, pump handle is broken since yesterday)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="input-field w-full"
                  required
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border flex gap-2 text-xs text-slate-500">
                <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p>This report will be dispatched to health workers and municipal engineers for ground verification.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Incident Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
