import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  Activity,
  Users,
  CheckCircle,
  AlertCircle,
  Map,
  Plus,
  RefreshCw,
  Phone,
  Calendar,
  FileText,
  Clock,
  HeartPulse,
  Droplet,
  UserCheck,
  Edit2,
  Save,
  Check
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AshaDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedReport, setSelectedReport] = useState(null)
  
  // Verification Form State
  const [diagnosis, setDiagnosis] = useState('')
  const [referralStatus, setReferralStatus] = useState(false)
  const [verifying, setVerifying] = useState(false)

  // Households Mock State
  const [households, setHouseholds] = useState([
    { id: 101, owner: 'Ravi Kumar', members: 4, status: 'Symptomatic', lastVisited: '2 days ago', address: 'Ward 1 - Plot 4' },
    { id: 102, owner: 'Suresh Patel', members: 5, status: 'Healthy', lastVisited: '1 week ago', address: 'Ward 1 - Plot 12' },
    { id: 103, owner: 'Sita Devi', members: 3, status: 'Not Visited', lastVisited: 'Never', address: 'Ward 2 - Plot 8' },
    { id: 104, owner: 'Anil Reddy', members: 6, status: 'Healthy', lastVisited: '3 days ago', address: 'Ward 2 - Plot 19' },
    { id: 105, owner: 'Laxmi K.', members: 2, status: 'Symptomatic', lastVisited: '1 day ago', address: 'Ward 3 - Plot 2' },
  ])

  // Field Visits Tracker State
  const [visits, setVisits] = useState([])
  const [visitHouse, setVisitHouse] = useState('Ravi Kumar')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [checkSymptoms, setCheckSymptoms] = useState(true)
  const [checkWater, setCheckWater] = useState(true)
  const [needReferral, setNeedReferral] = useState(false)
  const [visitNotes, setVisitNotes] = useState('')

  // Emergency Contacts state (ASHA editable for local numbers)
  const [emergencyContacts, setEmergencyContacts] = useState([
    { service: 'Local PHC Helpline', number: '+91 9000 123 456', availability: '24/7 Ward' },
    { service: 'District Health Officer', number: '1075', availability: 'Epidemic Cell' },
    { service: 'Water Quality Engineer', number: '+91 9700 123 456', availability: 'Mon-Sat' },
  ])
  const [editingContact, setEditingContact] = useState(null)
  const [editNumber, setEditNumber] = useState('')

  useEffect(() => {
    fetchStats()
    fetchAlerts()
    fetchReports()
    loadFieldVisits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/analytics/statistics')
      setStats(response.data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts')
      setAlerts(response.data)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/list')
      // ASHA only works in their district
      const filtered = response.data.filter(r => r.district === user?.district)
      setReports(filtered)
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
  }

  const loadFieldVisits = () => {
    const saved = localStorage.getItem('asha_field_visits')
    if (saved) {
      setVisits(JSON.parse(saved))
    } else {
      const initial = [
        { id: 1, house: 'Ravi Kumar', date: '2026-06-10', symptoms: 'Yes', water: 'Yes', referral: 'Yes', notes: 'Patient had diarrhea, advised boiling water.' },
        { id: 2, house: 'Anil Reddy', date: '2026-06-08', symptoms: 'No', water: 'Yes', referral: 'No', notes: 'Household water storage is clean.' },
      ]
      setVisits(initial)
      localStorage.setItem('asha_field_visits', JSON.stringify(initial))
    }
  }

  const handleLogVisit = (e) => {
    e.preventDefault()
    const newVisit = {
      id: Date.now(),
      house: visitHouse,
      date: visitDate,
      symptoms: checkSymptoms ? 'Yes' : 'No',
      water: checkWater ? 'Yes' : 'No',
      referral: needReferral ? 'Yes' : 'No',
      notes: visitNotes,
    }
    const updated = [newVisit, ...visits]
    setVisits(updated)
    localStorage.setItem('asha_field_visits', JSON.stringify(updated))
    setVisitNotes('')
    toast.success('Field visit logged successfully!')

    // Update mock household status
    setHouseholds(prev => prev.map(h => {
      if (h.owner === visitHouse) {
        return {
          ...h,
          status: needReferral ? 'Symptomatic' : 'Healthy',
          lastVisited: 'Just now'
        }
      }
      return h
    }))
  }

  const handleVerifyReport = async (reportId) => {
    if (!diagnosis.trim()) {
      toast.error('Please provide a medical diagnosis')
      return
    }

    setVerifying(true)
    try {
      await api.patch(`/reports/verify/${reportId}`, {
        diagnosis: diagnosis,
        referral_status: referralStatus
      })
      toast.success('Report verified and diagnosis logged!')
      setDiagnosis('')
      setSelectedReport(null)
      fetchReports()
      fetchStats()
    } catch (err) {
      toast.error('Failed to verify report')
    } finally {
      setVerifying(false)
    }
  }

  const handleUpdateHouseholdStatus = (id, newStatus) => {
    setHouseholds(prev => prev.map(h => h.id === id ? { ...h, status: newStatus, lastVisited: 'Just now' } : h))
    toast.success('Household health status updated!')
  }

  const handleSaveContact = (index) => {
    const updated = [...emergencyContacts]
    updated[index].number = editNumber
    setEmergencyContacts(updated)
    setEditingContact(null)
    toast.success('Contact number updated!')
  }

  const highRiskReports = reports.filter(r => r.predicted_risk === 'High')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">ASHA Field Officer</span>
            <h1 className="text-4xl font-extrabold mt-3 mb-2 flex items-center gap-2">
              <span>👩‍⚕️ ASHA Health Dashboard</span>
            </h1>
            <p className="text-purple-100 text-sm max-w-2xl mt-1">
              Field surveillance portal for <strong>{user?.village || 'Nalgonda'} village</strong>. Track local surveys, verify symptoms, manage referrals, and check water systems.
            </p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8">
          <nav className="flex flex-wrap gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'households', label: 'Assigned Households', icon: Users },
              { id: 'reports', label: 'Symptom Surveys', icon: FileText },
              { id: 'high_risk', label: 'High-Risk Referrals', icon: HeartPulse },
              { id: 'visits', label: 'Field Visit Tracker', icon: Calendar },
              { id: 'emergencies', label: 'District Contacts', icon: Phone },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSelectedReport(null)
                  }}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'high_risk' && highRiskReports.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px]">
                      {highRiskReports.length}
                    </span>
                  )}
                  {tab.id === 'reports' && reports.filter(r => !r.verified).length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-yellow-500 text-white rounded-full text-[10px]">
                      {reports.filter(r => !r.verified).length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Syncing database and reports...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats */}
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span>Field Surveillance Statistics ({user?.district})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase">Total District Surveys</p>
                      <p className="text-3xl font-extrabold text-purple-600 mt-2">{reports.length}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Logged by local citizens</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase">Pending Verifications</p>
                      <p className="text-3xl font-extrabold text-yellow-600 mt-2">{reports.filter(r => !r.verified).length}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Requires ground visits</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase">High Risk Alerts</p>
                      <p className="text-3xl font-extrabold text-red-600 mt-2">{highRiskReports.length}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Requires immediate PHC referral</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase">Verification Rate</p>
                      <p className="text-3xl font-extrabold text-blue-600 mt-2">
                        {reports.length > 0 ? `${((reports.filter(r => r.verified).length / reports.length) * 100).toFixed(0)}%` : '0%'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Completed verifications</p>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span>Active Location Alerts & Warnings</span>
                  </h2>
                  {alerts.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-slate-500 text-sm">
                      🟢 Clear: No active outbreak alerts or warnings found for your village or district.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-5 rounded-2xl border-2 flex items-start space-x-3 shadow-sm ${
                            alert.risk_level === 'High' ? 'bg-red-50 border-red-200 text-red-950' :
                            alert.risk_level === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-950' :
                            'bg-green-50 border-green-200 text-green-950'
                          }`}
                        >
                          <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                            alert.risk_level === 'High' ? 'text-red-600' :
                            alert.risk_level === 'Medium' ? 'text-amber-600' :
                            'text-green-600'
                          }`} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                alert.risk_level === 'High' ? 'bg-red-200 text-red-800' :
                                alert.risk_level === 'Medium' ? 'bg-amber-200 text-amber-800' :
                                'bg-green-200 text-green-800'
                              }`}>
                                {alert.risk_level} Risk
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(alert.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-xs mt-2 text-slate-900 capitalize">
                              Target Area: {alert.village || alert.district}
                            </h4>
                            <p className="text-xs mt-1 text-slate-700 leading-relaxed">{alert.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ASSIGNED HOUSEHOLDS TAB */}
            {activeTab === 'households' && (
              <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-extrabold text-slate-900">🏠 Assigned Households (Village Care List)</h3>
                  <p className="text-xs text-slate-500 mt-1">Monitor water security and log screenings for your assigned neighborhood units.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500 font-bold text-xs uppercase">
                        <th className="px-4 py-3">Household Owner</th>
                        <th className="px-4 py-3">Members</th>
                        <th className="px-4 py-3">Address</th>
                        <th className="px-4 py-3">Last Visited</th>
                        <th className="px-4 py-3">Health Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {households.map((h) => (
                        <tr key={h.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-4 font-bold text-slate-900">{h.owner}</td>
                          <td className="px-4 py-4 text-slate-600">{h.members}</td>
                          <td className="px-4 py-4 text-slate-600">{h.address}</td>
                          <td className="px-4 py-4 text-slate-500 text-xs">{h.lastVisited}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              h.status === 'Symptomatic' ? 'bg-red-100 text-red-800' :
                              h.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {h.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateHouseholdStatus(h.id, 'Healthy')}
                                className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold rounded-lg border border-green-100 transition"
                              >
                                Mark Healthy
                              </button>
                              <button
                                onClick={() => handleUpdateHouseholdStatus(h.id, 'Symptomatic')}
                                className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-100 transition"
                              >
                                Flag Symptoms
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SYMPTOM SURVEYS TAB */}
            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                {/* Reports List */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-extrabold text-slate-900">🩺 Submitted Symptom Surveys ({reports.length})</h3>
                    <p className="text-xs text-slate-500 mt-1">Review health details logged by users in your district.</p>
                  </div>

                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => {
                          setSelectedReport(report)
                          setDiagnosis(report.diagnosis || '')
                          setReferralStatus(report.referral_status || false)
                        }}
                        className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between hover:shadow-md ${
                          selectedReport?.id === report.id ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-slate-900">Village: {report.village}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Submitted: {new Date(report.submitted_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            report.predicted_risk === 'High' ? 'bg-red-100 text-red-800' :
                            report.predicted_risk === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.predicted_risk} Risk
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-4 border-t pt-2">
                          <span>Source: {['Tap Water', 'Borewell', 'Tank', 'River'][report.water_source]}</span>
                          <span className={`font-bold ${report.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {report.verified ? '✓ Verified' : '⏱ Pending Review'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Detail Panel & Verification Form */}
                <div className="space-y-6">
                  {selectedReport ? (
                    <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                      <div className="border-b pb-4 flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Survey Details (ID #{selectedReport.id})</h3>
                          <p className="text-xs text-slate-500">Submitted by Villager from {selectedReport.village}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          selectedReport.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedReport.verified ? 'Verified Case' : 'Pending Verification'}
                        </span>
                      </div>

                      {/* Symptoms & Parameters */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Symptoms Flagged:</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {Object.entries(selectedReport.symptoms).map(([symptom, val]) => (
                            val === 1 && (
                              <span key={symptom} className="px-2.5 py-1 bg-purple-100 text-purple-700 font-bold rounded-lg capitalize border border-purple-200">
                                {symptom.replace('_', ' ')}
                              </span>
                            )
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 mt-3">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Affected Members</span>
                            <span className="font-bold text-slate-800 text-sm">{selectedReport.household_affected} members</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Water Source used</span>
                            <span className="font-bold text-slate-800 text-sm">{['Tap Water', 'Borewell', 'Tank', 'River'][selectedReport.water_source]}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Water Score (pH/Turbidity)</span>
                            <span className="font-bold text-slate-800 text-sm">{selectedReport.water_quality_score}/100</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Risk Confidence</span>
                            <span className="font-bold text-slate-800 text-sm">{((selectedReport.risk_confidence || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Verification Form */}
                      <form onSubmit={(e) => { e.preventDefault(); handleVerifyReport(selectedReport.id) }} className="border-t pt-4 space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ASHA Worker Ground Verification:</p>
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Clinical Diagnosis *</label>
                          <input
                            type="text"
                            placeholder="e.g. Mild Gastroenteritis, Acute Diarrhea, Dehydration"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="input-field w-full text-xs"
                            required
                          />
                        </div>

                        <label className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-150 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={referralStatus}
                            onChange={(e) => setReferralStatus(e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600"
                          />
                          <span className="text-xs text-slate-700 font-semibold">🚑 Refer patient to Primary Health Centre (PHC)</span>
                        </label>

                        <button
                          type="submit"
                          disabled={verifying}
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                        >
                          {verifying ? 'Submitting...' : 'Submit Official Diagnosis & Verify'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
                      🔍 Select a symptom survey from the list to view full health parameters and submit verification records.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HIGH-RISK REFERRALS TAB */}
            {activeTab === 'high_risk' && (
              <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                <div className="border-b pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">🚨 High-Risk Outbreak Cases (Immediate Referrals)</h3>
                    <p className="text-xs text-slate-500 mt-1">Review individuals whose symptom-water metrics indicate potential local epidemics.</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    {highRiskReports.length} Cases Pending
                  </span>
                </div>

                {highRiskReports.length === 0 ? (
                  <div className="p-12 border border-dashed rounded-xl text-center text-slate-500 text-sm">
                    🟢 No high-risk outbreak cases logged in your village database currently. All clear.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highRiskReports.map((report) => (
                      <div key={report.id} className="border-2 border-red-200 bg-red-50/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-black uppercase">
                              High Risk Alert
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(report.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-sm font-bold text-slate-900">{report.village} Village Case</p>
                          <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                            {Object.entries(report.symptoms).map(([symptom, val]) => (
                              val === 1 && (
                                <span key={symptom} className="px-2 py-0.5 bg-red-100 text-red-800 rounded capitalize">
                                  {symptom}
                                </span>
                              )
                            ))}
                          </div>
                          
                          <p className="text-xs text-slate-600 mt-3">
                            Water Source: {['Tap Water', 'Borewell', 'Tank', 'River'][report.water_source]} | Affected: {report.household_affected} people
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-200/50 flex gap-2">
                          <button
                            onClick={() => {
                              setActiveTab('reports')
                              setSelectedReport(report)
                              setDiagnosis('Gastroenteritis (PHC Referral)')
                              setReferralStatus(true)
                            }}
                            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                          >
                            🚑 Refer to PHC Clinic
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FIELD VISIT TRACKER TAB */}
            {activeTab === 'visits' && (
              <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
                {/* Form */}
                <form onSubmit={handleLogVisit} className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-3">📝 Log Home Visit</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Household / Owner Name</label>
                    <select
                      value={visitHouse}
                      onChange={(e) => setVisitHouse(e.target.value)}
                      className="input-field w-full text-xs"
                    >
                      {households.map(h => (
                        <option key={h.id} value={h.owner}>{h.owner} ({h.address})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Visit Date</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="input-field w-full text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkSymptoms}
                        onChange={(e) => setCheckSymptoms(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span>Symptoms Checked?</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkWater}
                        onChange={(e) => setCheckWater(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span>Water Sanitation Inspected?</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needReferral}
                        onChange={(e) => setNeedReferral(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span>Referral to PHC Needed?</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Field Visit Notes</label>
                    <textarea
                      placeholder="Enter details on patient conditions, sanitation tips given, etc."
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      rows="3"
                      className="input-field w-full text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Save Field Visit Record
                  </button>
                </form>

                {/* Visit Logs */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-3">📋 Visited logs ({visits.length})</h3>
                  {visits.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-6">No home visits logged yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                      {visits.map((visit) => (
                        <div key={visit.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-900 text-sm">{visit.house}</span>
                            <span className="text-slate-400">{visit.date}</span>
                          </div>
                          <p className="text-slate-700 font-medium">{visit.notes}</p>
                          <div className="mt-3 flex gap-2 text-[10px] text-slate-500">
                            <span>Symptom Checked: <strong>{visit.symptoms}</strong></span>
                            <span>Water Inspected: <strong>{visit.water}</strong></span>
                            <span>PHC Referral: <strong className={visit.referral === 'Yes' ? 'text-red-600' : ''}>{visit.referral}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DISTRICT HELPLINE MANAGEMENT */}
            {activeTab === 'emergencies' && (
              <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-extrabold text-slate-900">📞 Local Emergency Contacts Management</h3>
                  <p className="text-xs text-slate-500 mt-1">Review and maintain emergency support contacts for citizens in your village.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                          {contact.service}
                        </span>
                        {editingContact === idx ? (
                          <div className="mt-2 space-y-2">
                            <input
                              type="text"
                              value={editNumber}
                              onChange={(e) => setEditNumber(e.target.value)}
                              className="input-field w-full text-xs"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveContact(idx)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-[10px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingContact(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <a href={`tel:${contact.number}`} className="text-xl font-black text-slate-900 block mt-2 hover:underline">
                              {contact.number}
                            </a>
                            <span className="text-[10px] text-slate-500 block mt-1">{contact.availability}</span>
                          </>
                        )}
                      </div>

                      {editingContact !== idx && (
                        <button
                          onClick={() => {
                            setEditingContact(idx)
                            setEditNumber(contact.number)
                          }}
                          className="mt-4 text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Number
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}