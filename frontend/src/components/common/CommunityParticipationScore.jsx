import { useState, useEffect } from 'react'
import { Users, AlertCircle, Plus, Send, RefreshCw, HelpCircle, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function CommunityParticipationScore() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Incident Form state
  const [issueType, setIssueType] = useState('Tap Odor/Color')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchIncidents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchIncidents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/incidents/list')
      setIncidents(response.data)
    } catch (err) {
      console.error('Failed to fetch incidents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePostIncident = async (e) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error('Please describe the incident')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        issue_type: issueType,
        description: description
      }
      const res = await api.post('/incident-report', payload)
      toast.success(res.data.message || 'Incident reported to community!')
      setDescription('')
      setShowForm(false)
      fetchIncidents()
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit incident report')
    } finally {
      setSubmitting(false)
    }
  }

  const participationRate = 87 // Mock metrics for participation score
  const activeVolunteers = 24

  return (
    <div className="space-y-6">
      {/* Header and Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-7 h-7 text-indigo-600 animate-pulse" />
            <span>Community Dashboard & Action Hub</span>
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            <strong>Source:</strong> Aggregated from user-submitted symptom surveys and water security alerts across <strong>{user?.district || 'Telangana'}</strong>.
          </p>
          <p className="text-slate-500 text-sm mt-0.5">
            <strong>Purpose:</strong> Allows citizens and officials to track active alerts, identify containment zones, and report communal water hazards.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-xs shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            Report Community Incident
          </button>
          <button
            onClick={fetchIncidents}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider">Citizen Participation Score</p>
          <div className="flex items-end space-x-2 mt-2">
            <p className="text-4xl font-extrabold text-indigo-900">{participationRate}%</p>
            <span className="text-green-600 font-bold text-sm mb-1">↑ Very Active</span>
          </div>
          <p className="text-slate-600 text-xs mt-2">Based on regional symptom report completion and incident alerts verified by ASHA workers.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Volunteers</p>
          <p className="text-4xl font-extrabold text-slate-950 mt-2">{activeVolunteers}</p>
          <p className="text-slate-600 text-xs mt-2">Citizens registered as health advocates assisting with safe water campaigns and local verifications.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Reports Logged (District)</p>
          <p className="text-4xl font-extrabold text-slate-950 mt-2">{incidents.length}</p>
          <p className="text-slate-600 text-xs mt-2">Communal health hazards reported within your district needing review.</p>
        </div>
      </div>

      {/* Incident Form (Collapsible) */}
      {showForm && (
        <form onSubmit={handlePostIncident} className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-200">
          <h4 className="font-bold text-slate-900 text-lg mb-4">📢 Report a Community Health Hazard</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hazard Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="input-field w-full"
              >
                <option value="Tap Odor/Color">Tap Water Odor or Color Issue</option>
                <option value="Broken Pipeline">Broken Water Pipeline / Leakage</option>
                <option value="Pond Water Contamination">Algal Bloom / Pond Water Contamination</option>
                <option value="Unsafe Water Source">Unsecured Well / Contaminated Hand Pump</option>
                <option value="Open Drainage Overflow">Open Sewage / Drainage Overflow</option>
              </select>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl flex gap-2 border text-xs text-slate-600">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <p>Reports are published anonymously on the district community board and sent directly to local health officers.</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description & Location Details</label>
            <textarea
              placeholder="Describe the issue. (e.g., The pipeline near the primary school is leaking rusty water. Or the local well has organic waste thrown in it...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="input-field w-full"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-slate-700 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Post Hazard Report'}
            </button>
          </div>
        </form>
      )}

      {/* Incidents Board */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📋 District Community Hazard Board ({incidents.length})</span>
        </h4>

        {loading ? (
          <div className="text-center py-12 bg-white border rounded-2xl">
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Fetching community feeds...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white border p-12 rounded-2xl text-center text-slate-500 text-sm shadow-sm">
            🟢 No water hazard alerts or community complaints logged for your district. All supplies are operating normally.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-xs font-bold shadow-sm">
                      {incident.issue_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                      incident.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      incident.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  
                  <p className="text-slate-800 text-sm leading-relaxed mb-4">{incident.description}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 border-t pt-3 mt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {incident.village}, {incident.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
