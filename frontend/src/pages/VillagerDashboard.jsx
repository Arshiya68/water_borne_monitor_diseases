import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import RiskPredictionCard from '../components/common/RiskPredictionCard'
import AlertCenter from '../components/common/AlertCenter'
import WaterSourceMonitoring from '../components/common/WaterSourceMonitoring'
import HealthEducationCenter from '../components/common/HealthEducationCenter'
import CommunityParticipationScore from '../components/common/CommunityParticipationScore'
import EmergencyContactsList from '../components/common/EmergencyContactsList'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FileText, Plus, CheckCircle, Clock, AlertCircle, Droplets, Users, TrendingUp, Shield, Book } from 'lucide-react'

export default function VillagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    village: '',
    district: '',
    state: 'Telangana',
    diarrhea: 0,
    vomiting: 0,
    fever: 0,
    abdominal_pain: 0,
    dehydration: 0,
    water_source: 0,
    household_affected: 1,
    age_group: 1,
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/list')
      setReports(response.data)
      setStats({
        total: response.data.length,
        pending: response.data.filter((r) => !r.verified).length,
        verified: response.data.filter((r) => r.verified).length,
      })
    } catch (error) {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    try {
      await api.post('/reports/submit', formData)
      toast.success('Report submitted successfully!')
      setShowForm(false)
      setFormData({
        village: '',
        district: '',
        state: 'Telangana',
        diarrhea: 0,
        vomiting: 0,
        fever: 0,
        abdominal_pain: 0,
        dehydration: 0,
        water_source: 0,
        household_affected: 1,
        age_group: 1,
      })
      fetchReports()
      setActiveTab('reports')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit report')
    }
  }

  const toggleSymptom = (symptom) => {
    setFormData({
      ...formData,
      [symptom]: formData[symptom] === 1 ? 0 : 1,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Villager Dashboard</h1>
          <p className="text-slate-600 mt-2">Report symptoms and monitor water safety in your community</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reports</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Review</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                <p className="text-xs text-slate-500 mt-1">Waiting for verification</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Verified Reports</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.verified}</p>
                <p className="text-xs text-slate-500 mt-1">By health workers</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="border-b border-slate-200 mb-6">
            <nav className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('risk')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'risk'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Risk Prediction</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'alerts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Alerts</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('water')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'water'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5" />
                  <span>Water Sources</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'education'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Book className="w-5 h-5" />
                  <span>Health Tips</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'community'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Community</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>My Reports</span>
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('form'); setShowForm(true) }}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Report Symptoms</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6">
              <div className="space-y-6">
                {/* Latest Assessment Status */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">🩺 Your Latest Symptom Assessment</h3>
                  {reports.length > 0 ? (() => {
                    const latest = reports[0]
                    const riskColors = latest.predicted_risk === 'High' ? 'bg-red-100 text-red-800' : latest.predicted_risk === 'Medium' || latest.predicted_risk === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500">Reported on {new Date(latest.submitted_at).toLocaleDateString('en-IN')}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColors}`}>
                            {latest.predicted_risk} Risk
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400">Personal Risk Score</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{latest.risk_confidence ? `${(latest.risk_confidence * 100).toFixed(0)}%` : 'Rule-Based'}</p>
                          </div>
                          <button 
                            onClick={() => navigate('/report')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-xs hover:bg-blue-700 transition"
                          >
                            New Assessment
                          </button>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm mb-4">You have not submitted any symptom reports yet.</p>
                      <button 
                        onClick={() => navigate('/report')}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-xs hover:bg-blue-700 transition"
                      >
                        Start First Assessment
                      </button>
                    </div>
                  )}
                </div>

                {/* General Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-slate-900 mb-2">💧 Water Safety Actions</h3>
                    <p className="text-slate-700 text-xs leading-relaxed mb-4">
                      Always boil drinking water. If you notice any weird smell or taste from your tap, report it immediately in the Water Sources tab.
                    </p>
                    <button
                      onClick={() => setActiveTab('water')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                    >
                      Check Water Sources
                    </button>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="font-semibold text-slate-900 mb-2">🏥 Health & Sanitation</h3>
                    <ul className="text-slate-700 text-xs space-y-1.5 list-disc pl-4">
                      <li>Boil municipal water before drinking.</li>
                      <li>Wash hands with soap before meals.</li>
                      <li>Keep water storage tanks closed.</li>
                      <li>Report symptoms to local ASHA workers early.</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition"
                >
                  View Your Reports History
                </button>
              </div>

              {/* Persistent Emergency Contacts List */}
              <div className="space-y-6">
                <EmergencyContactsList />
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No reports yet</h3>
                  <p className="text-slate-600 mb-6">Submit your first symptom report to get started</p>
                  <button
                    onClick={() => setActiveTab('form')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Submit Report
                  </button>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {report.village}, {report.district}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(report.submitted_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      {report.verified ? (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Water Source</p>
                        <p className="font-medium text-slate-900">
                          {['Tap', 'Borewell', 'River', 'Pond'][report.water_source]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Affected</p>
                        <p className="font-medium text-slate-900">{report.household_affected} people</p>
                      </div>
                      {report.diagnosis && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Diagnosis</p>
                          <p className="font-medium text-slate-900">{report.diagnosis}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(report.symptoms).map(([symptom, value]) =>
                          value === 1 ? (
                            <span
                              key={symptom}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                            >
                              {symptom.replace('_', ' ')}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Form Tab */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmitReport} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-900 text-sm font-medium">
                  ℹ️ Please provide accurate information about your health condition and water source
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Village name"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="District"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Symptoms (Select all that apply)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'diarrhea', label: 'Diarrhea' },
                    { key: 'vomiting', label: 'Vomiting' },
                    { key: 'fever', label: 'Fever' },
                    { key: 'abdominal_pain', label: 'Abdominal Pain' },
                    { key: 'dehydration', label: 'Dehydration' },
                  ].map((symptom) => (
                    <button
                      key={symptom.key}
                      type="button"
                      onClick={() => toggleSymptom(symptom.key)}
                      className={`p-4 rounded-lg border-2 transition font-medium ${
                        formData[symptom.key] === 1
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:border-blue-300 text-slate-700'
                      }`}
                    >
                      {symptom.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={formData.water_source}
                    onChange={(e) => setFormData({ ...formData, water_source: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value="0">Tap Water</option>
                    <option value="1">Borewell</option>
                    <option value="2">River</option>
                    <option value="3">Pond</option>
                  </select>
                  <input
                    type="number"
                    placeholder="People affected"
                    min="1"
                    max="20"
                    value={formData.household_affected}
                    onChange={(e) => setFormData({ ...formData, household_affected: parseInt(e.target.value) })}
                    className="input-field"
                  />
                  <select
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value="0">Child (0-12)</option>
                    <option value="1">Adult (13-60)</option>
                    <option value="2">Elderly (60+)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setActiveTab('overview'); setShowForm(false) }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}

          {/* Risk Prediction Tab */}
          {activeTab === 'risk' && <RiskPredictionCard />}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && <AlertCenter />}

          {/* Water Sources Tab */}
          {activeTab === 'water' && <WaterSourceMonitoring />}

          {/* Health Education Tab */}
          {activeTab === 'education' && <HealthEducationCenter />}

          {/* Community Participation Tab */}
          {activeTab === 'community' && <CommunityParticipationScore />}
        </div>
      </div>
    </div>
  )
}