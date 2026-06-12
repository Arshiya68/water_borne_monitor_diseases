import { useEffect, useState } from 'react'
import Navbar from '../components/common/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  Activity,
  Users,
  AlertCircle,
  Phone,
  Calendar,
  FileText,
  HeartPulse,
  Plus,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  ClipboardList
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

  // Direct Household Visit Entry State
  const [householdName, setHouseholdName] = useState('')
  const [familyMembers, setFamilyMembers] = useState(4)
  const [address, setAddress] = useState(user?.village || '')
  const [waterSource, setWaterSource] = useState('Tap Water')
  const [sickMembersCount, setSickMembersCount] = useState(0)
  const [observedSymptoms, setObservedSymptoms] = useState({
    fever: false,
    diarrhea: false,
    vomiting: false,
    nausea: false,
    stomach_pain: false
  })
  const [visitNotes, setVisitNotes] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [followUpDate, setFollowUpDate] = useState('')
  const [visitStatus, setVisitStatus] = useState('Healthy')
  const [visitsHistory, setVisitsHistory] = useState([])
  const [savingVisit, setSavingVisit] = useState(false)

  // Alert Investigations State
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [findings, setFindings] = useState('')
  const [investigationStatus, setInvestigationStatus] = useState('Under Investigation')
  const [investigations, setInvestigations] = useState([])
  const [savingInvestigation, setSavingInvestigation] = useState(false)

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
    fetchVisitsHistory()
    fetchInvestigations()
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
      // ASHA worker sees reports in their district
      const filtered = response.data.filter(
        r => r.district.toLowerCase() === user?.district?.toLowerCase()
      )
      setReports(filtered)
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
  }

  const fetchVisitsHistory = async () => {
    try {
      const response = await api.get('/household-visits')
      setVisitsHistory(response.data)
    } catch (error) {
      console.error('Failed to load visits:', error)
    }
  }

  const fetchInvestigations = async () => {
    try {
      const response = await api.get('/alert-investigations')
      setInvestigations(response.data)
    } catch (error) {
      console.error('Failed to load investigations:', error)
    }
  }

  const handleToggleSymptom = (name) => {
    setObservedSymptoms(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const handleLogHouseholdVisit = async (e) => {
    e.preventDefault()
    if (!householdName.trim()) {
      toast.error('Household name is required')
      return
    }

    setSavingVisit(true)
    try {
      const symptomsList = Object.entries(observedSymptoms)
        .filter(([_, checked]) => checked)
        .map(([name, _]) => name.replace('_', ' '))
        .join(', ')

      const payload = {
        household_name: householdName,
        village: address,
        family_members: familyMembers,
        water_source: waterSource,
        sick_members_count: sickMembersCount,
        symptoms: symptomsList || 'None',
        status: visitStatus,
        notes: visitNotes,
        visit_date: visitDate,
        follow_up_date: followUpDate || null
      }

      await api.post('/household-visits', payload)
      toast.success('Field visit logged to Village Health Register!')
      
      // Reset form
      setHouseholdName('')
      setVisitNotes('')
      setSickMembersCount(0)
      setObservedSymptoms({
        fever: false,
        diarrhea: false,
        vomiting: false,
        nausea: false,
        stomach_pain: false
      })
      setVisitStatus('Healthy')
      setFollowUpDate('')

      fetchVisitsHistory()
      fetchStats()
    } catch (error) {
      console.error(error)
      toast.error('Failed to save visit record')
    } finally {
      setSavingVisit(false)
    }
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
      toast.success('Report successfully verified on ground!')
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

  const handleRejectReport = async (reportId) => {
    if (window.confirm('Are you sure you want to mark this report as false/rejected?')) {
      try {
        await api.patch(`/reports/reject/${reportId}`)
        toast.success('Report marked as Rejected')
        setSelectedReport(null)
        fetchReports()
        fetchStats()
      } catch (err) {
        toast.error('Failed to reject report')
      }
    }
  }

  const handleEscalateReport = async (reportId) => {
    if (!diagnosis.trim()) {
      toast.error('Please provide a clinical diagnosis/reason for escalation')
      return
    }

    setVerifying(true)
    try {
      await api.patch(`/reports/escalate/${reportId}`, {
        diagnosis: diagnosis
      })
      toast.success('Report escalated to Higher Officials! Alert generated.')
      setDiagnosis('')
      setSelectedReport(null)
      fetchReports()
      fetchStats()
      fetchAlerts()
    } catch (err) {
      toast.error('Failed to escalate report')
    } finally {
      setVerifying(false)
    }
  }

  const handleInvestigateAlertSubmit = async (e) => {
    e.preventDefault()
    if (!findings.trim()) {
      toast.error('Findings notes are required to verify the area')
      return
    }

    setSavingInvestigation(true)
    try {
      await api.post('/alert-investigations/investigate', {
        alert_id: selectedAlert.id,
        findings: findings,
        verification_status: investigationStatus,
        village: selectedAlert.village || user?.village
      })

      toast.success('Area investigation logged!')
      setFindings('')
      setSelectedAlert(null)
      fetchInvestigations()
      fetchAlerts()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save area investigation')
    } finally {
      setSavingInvestigation(false)
    }
  }

  const handleUpdateContact = (index) => {
    const updated = [...emergencyContacts]
    updated[index].number = editNumber
    setEmergencyContacts(updated)
    setEditingContact(null)
    toast.success('Helpline contact updated!')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-3xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3.5 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">ASHA Field Surveillance Unit</span>
            <h1 className="text-4.5xl font-black mt-4 mb-2 flex items-center gap-2">
              <span>👩‍⚕️ ASHA Health Dashboard</span>
            </h1>
            <p className="text-purple-100 text-sm max-w-2xl mt-1 leading-relaxed">
              Surveillance portal for <strong>{user?.village || 'Local'} Village</strong>. Review submitted symptom logs, log direct household checkups, and verify EWS outbreak warnings.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8 flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'assigned_reports', label: 'Assigned Reports', icon: FileText },
            { id: 'health_register', label: 'Village Health Register', icon: Users },
            { id: 'alert_verification', label: 'Alert Verification', icon: ShieldAlert },
            { id: 'visits_history', label: 'Visit History Logs', icon: ClipboardList },
            { id: 'emergencies', label: 'District Contacts', icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon
            const isPendingReports = tab.id === 'assigned_reports' && reports.filter(r => r.status === 'Pending').length > 0
            const isPendingAlerts = tab.id === 'alert_verification' && alerts.length > 0

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSelectedReport(null)
                  setSelectedAlert(null)
                }}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs transition duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isPendingReports && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-white rounded-full text-[10px] font-black">
                    {reports.filter(r => r.status === 'Pending').length}
                  </span>
                )}
                {isPendingAlerts && (
                  <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black">
                    {alerts.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Syncing database and logs from MySQL...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Reports logged</p>
                    <p className="text-3.5xl font-black text-slate-800 mt-2">{reports.length}</p>
                    <div className="text-[10px] text-purple-600 font-bold mt-1">Symptom audits in district</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Review</p>
                    <p className="text-3.5xl font-black text-yellow-600 mt-2">{reports.filter(r => r.status === 'Pending').length}</p>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">Requires home verification visits</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verified Cases</p>
                    <p className="text-3.5xl font-black text-green-600 mt-2">{reports.filter(r => r.status === 'Verified').length}</p>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">Confirmed clinical outbreaks</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Alerts Active</p>
                    <p className="text-3.5xl font-black text-red-600 mt-2">{alerts.length}</p>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">Active regional alerts to verify</div>
                  </div>
                </div>

                {/* EWS Warnings Alert feed */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span>Active Outbreak Warning Notifications</span>
                  </h3>

                  {alerts.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-slate-500 text-sm">
                      🟢 All clear. No active outbreak warnings flagged for this sector.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-5 rounded-2xl border bg-slate-50 border-slate-200 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-extrabold rounded uppercase">
                                Outbreak Warning
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(alert.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-3 font-medium leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab('alert_verification')
                              setSelectedAlert(alert)
                            }}
                            className="mt-4 w-full py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
                          >
                            Investigate Area <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ASSIGNED REPORTS TAB */}
            {activeTab === 'assigned_reports' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
                {/* Reports Table */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-extrabold text-slate-900">🩺 Assigned Symptoms Reports</h3>
                    <p className="text-xs text-slate-500 mt-1">Select and review symptom logs submitted by citizens in your village.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-500 font-bold text-xs uppercase">
                          <th className="px-4 py-3">Report ID</th>
                          <th className="px-4 py-3">Villager</th>
                          <th className="px-4 py-3">Village</th>
                          <th className="px-4 py-3">Risk Level</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-medium">
                              No reports received yet.
                            </td>
                          </tr>
                        ) : (
                          reports.map((report) => (
                            <tr
                              key={report.id}
                              onClick={() => {
                                setSelectedReport(report)
                                setDiagnosis(report.diagnosis || '')
                                setReferralStatus(report.referral_status || false)
                              }}
                              className={`border-b hover:bg-slate-50 cursor-pointer transition ${
                                selectedReport?.id === report.id ? 'bg-purple-50/50' : ''
                              }`}
                            >
                              <td className="px-4 py-4 font-bold text-purple-700">R-{report.id}</td>
                              <td className="px-4 py-4 text-slate-700">
                                {report.villager_name || 'Anonymous'} ({report.villager_age || 'N/A'} yrs)
                              </td>
                              <td className="px-4 py-4 text-slate-600">{report.village}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  report.predicted_risk === 'High' ? 'bg-red-100 text-red-800' :
                                  report.predicted_risk === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {report.predicted_risk}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-bold">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  report.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                  report.status === 'Rejected' ? 'bg-slate-100 text-slate-600' :
                                  'bg-yellow-100 text-yellow-800 animate-pulse'
                                }`}>
                                  {report.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Details / Verification Panel */}
                <div className="space-y-6">
                  {selectedReport ? (
                    <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
                      <div className="border-b pb-4 flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">Report Details (R-{selectedReport.id})</h4>
                          <p className="text-xs text-slate-400 mt-1">Logged: {new Date(selectedReport.submitted_at).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleRejectReport(selectedReport.id)}
                          className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-[10px] font-bold rounded-lg transition"
                        >
                          Mark False Report
                        </button>
                      </div>

                      {/* Detail metrics */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-400 block mb-0.5">Water Source used</span>
                            <span className="font-bold text-slate-800">{['Tap Water', 'Borewell', 'Tank', 'River'][selectedReport.water_source]}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-400 block mb-0.5">Sick Members</span>
                            <span className="font-bold text-slate-800">{selectedReport.household_affected} members</span>
                          </div>
                        </div>

                        {/* Symptoms Observed */}
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Symptoms Checked</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(selectedReport.symptoms).map(([symptom, val]) => (
                              val === 1 && (
                                <span key={symptom} className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold border border-purple-100 rounded-lg text-xs capitalize">
                                  {symptom.replace('_', ' ')}
                                </span>
                              )
                            ))}
                            {selectedReport.symptoms.other_symptoms && (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-lg text-xs">
                                Note: {selectedReport.symptoms.other_symptoms}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Form */}
                      <form onSubmit={(e) => { e.preventDefault(); handleVerifyReport(selectedReport.id) }} className="border-t pt-4 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Clinical Diagnosis *</label>
                          <input
                            type="text"
                            placeholder="e.g. Mild Gastroenteritis, Cholera, Dysentery"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="input-field w-full text-xs font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={referralStatus}
                              onChange={(e) => setReferralStatus(e.target.checked)}
                              className="w-4 h-4 rounded text-purple-600"
                            />
                            <span>🚑 Refer patient to local Primary Health Centre (PHC)</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <button
                            type="submit"
                            disabled={verifying}
                            className="py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                          >
                            Verify Report
                          </button>
                          <button
                            type="button"
                            disabled={verifying}
                            onClick={() => handleEscalateReport(selectedReport.id)}
                            className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                          >
                            Escalate to Official
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs font-medium">
                      Select a symptom report from the table to complete field verification or escalate findings.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VILLAGE HEALTH REGISTER TAB */}
            {activeTab === 'health_register' && (
              <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-extrabold text-slate-900">🏠 Village Health Register (Direct Field Visit Entry)</h3>
                  <p className="text-xs text-slate-500 mt-1">ASHA workers can directly submit and register new household visit logs to create a permanent database history.</p>
                </div>

                <form onSubmit={handleLogHouseholdVisit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Household / Owner Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Reddy"
                        value={householdName}
                        onChange={(e) => setHouseholdName(e.target.value)}
                        className="input-field w-full text-xs font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Family Members Count</label>
                        <input
                          type="number"
                          min="1"
                          value={familyMembers}
                          onChange={(e) => setFamilyMembers(Number(e.target.value))}
                          className="input-field w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Sick Members Count</label>
                        <input
                          type="number"
                          min="0"
                          value={sickMembersCount}
                          onChange={(e) => setSickMembersCount(Number(e.target.value))}
                          className="input-field w-full text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Address / Plot Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. Ward 2, Plot 14"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field w-full text-xs font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Water Source Used</label>
                        <select
                          value={waterSource}
                          onChange={(e) => setWaterSource(e.target.value)}
                          className="input-field w-full text-xs"
                        >
                          <option value="Tap Water">Tap Water</option>
                          <option value="Borewell">Borewell</option>
                          <option value="Tank">Tank</option>
                          <option value="River">River</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Household Health Status</label>
                        <select
                          value={visitStatus}
                          onChange={(e) => setVisitStatus(e.target.value)}
                          className="input-field w-full text-xs font-bold"
                        >
                          <option value="Healthy">🟢 Healthy</option>
                          <option value="Suspected Case">🟡 Suspected Case</option>
                          <option value="Confirmed Case">🔴 Confirmed Case</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column fields */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-700 mb-2">Symptoms Observed in Household</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { key: 'fever', label: 'Fever' },
                          { key: 'diarrhea', label: 'Diarrhea' },
                          { key: 'vomiting', label: 'Vomiting' },
                          { key: 'nausea', label: 'Nausea' },
                          { key: 'stomach_pain', label: 'Stomach Pain' }
                        ].map((symptom) => (
                          <label key={symptom.key} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={observedSymptoms[symptom.key]}
                              onChange={() => handleToggleSymptom(symptom.key)}
                              className="w-4 h-4 rounded text-purple-600"
                            />
                            <span>{symptom.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Visit Date</label>
                        <input
                          type="date"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="input-field w-full text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Follow-up Date (Optional)</label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="input-field w-full text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Visit Findings Notes</label>
                      <textarea
                        rows="2.5"
                        placeholder="Log sanitization tips given or details on patient referral status..."
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                        className="input-field w-full text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingVisit}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs transition disabled:opacity-50 shadow-md shadow-purple-100"
                    >
                      {savingVisit ? 'Saving record...' : '✓ Register Household Health Record'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VISIT HISTORY LOGS TAB */}
            {activeTab === 'visits_history' && (
              <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-extrabold text-slate-900">📋 Permanent Visit History logs</h3>
                  <p className="text-xs text-slate-500 mt-1">Audit log of all field checkups and household registrations uploaded to MySQL database.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500 font-bold text-xs uppercase">
                        <th className="px-4 py-3">Visit Date</th>
                        <th className="px-4 py-3">Household Owner</th>
                        <th className="px-4 py-3">Plot Address</th>
                        <th className="px-4 py-3">Symptoms Observed</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitsHistory.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center text-slate-400 font-medium">
                            No visits registered yet in this village database.
                          </td>
                        </tr>
                      ) : (
                        visitsHistory.map((visit) => (
                          <tr key={visit.id} className="border-b hover:bg-slate-50/50">
                            <td className="px-4 py-4 text-slate-600">{new Date(visit.visit_date).toLocaleDateString()}</td>
                            <td className="px-4 py-4 font-bold text-slate-900">{visit.household_name}</td>
                            <td className="px-4 py-4 text-slate-600">{visit.village}</td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {visit.symptoms.split(', ').map((sym, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] capitalize border">
                                    {sym}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4 font-bold">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                visit.status === 'Confirmed Case' ? 'bg-red-100 text-red-800' :
                                visit.status === 'Suspected Case' ? 'bg-amber-100 text-amber-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {visit.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-500 max-w-xs truncate">{visit.notes || 'None'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ALERT VERIFICATION TAB */}
            {activeTab === 'alert_verification' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8">
                {/* Outbreak Warnings List */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-extrabold text-slate-900">🚨 Received EWS Outbreak Alerts</h3>
                    <p className="text-xs text-slate-500 mt-1">Select an active outbreak warning to investigate the area and submit local findings.</p>
                  </div>

                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <div className="p-8 border border-dashed rounded-xl text-center text-slate-400 font-medium">
                        No alerts pending investigation.
                      </div>
                    ) : (
                      alerts.map((alert) => {
                        const inv = investigations.find(i => i.alert_id === alert.id)
                        return (
                          <div
                            key={alert.id}
                            onClick={() => {
                              setSelectedAlert(alert)
                              setFindings(inv?.findings || '')
                              setInvestigationStatus(inv?.verification_status || 'Under Investigation')
                            }}
                            className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between hover:shadow-sm ${
                              selectedAlert?.id === alert.id ? 'border-purple-600 bg-purple-50/45' : 'border-slate-100'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-bold text-slate-900">Area: {alert.village || alert.district}</p>
                                <p className="text-xs text-slate-400 mt-1">Warning: {alert.message}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded uppercase">
                                {alert.risk_level} Risk
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t pt-2 text-xs">
                              <span className="text-slate-400">Time: {new Date(alert.created_at).toLocaleString()}</span>
                              <span className={`font-black uppercase text-[10px] ${
                                inv?.verification_status === 'Verified' ? 'text-green-600' :
                                inv?.verification_status === 'Rejected' ? 'text-slate-500' :
                                'text-red-500 animate-pulse'
                              }`}>
                                {inv ? `● ${inv.verification_status}` : '● Pending Investigation'}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Investigation Panel Form */}
                <div className="space-y-6">
                  {selectedAlert ? (
                    <form onSubmit={handleInvestigateAlertSubmit} className="bg-white border rounded-2xl shadow-sm p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                      <div className="border-b pb-4">
                        <h4 className="font-extrabold text-slate-900 text-base">Conduct Area Survey (Alert #{selectedAlert.id})</h4>
                        <p className="text-xs text-slate-400 mt-1">Submit findings to confirm or resolve the outbreak alert.</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2">
                        <p><strong>Alert message:</strong> {selectedAlert.message}</p>
                        <p><strong>Target Village:</strong> {selectedAlert.village || 'District Level'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Ground Investigation Findings *</label>
                        <textarea
                          rows="4"
                          placeholder="Log results of water sample checks, household interviews, or active diarrhoea cases observed..."
                          value={findings}
                          onChange={(e) => setFindings(e.target.value)}
                          className="input-field w-full text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Investigation Status</label>
                        <select
                          value={investigationStatus}
                          onChange={(e) => setInvestigationStatus(e.target.value)}
                          className="input-field w-full text-xs font-bold"
                        >
                          <option value="Under Investigation">🟡 Under Investigation</option>
                          <option value="Verified">🔴 Confirm Outbreak (Verify Alert)</option>
                          <option value="Rejected">🟢 Reject Alert (False alarm)</option>
                          <option value="Resolved">🟢 Resolved (Outbreak closed)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={savingInvestigation}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition disabled:opacity-50"
                      >
                        {savingInvestigation ? 'Saving investigation...' : '✓ Submit Investigation Audit'}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs font-medium">
                      Select an active outbreak warning to start conducting area surveys and logging findings.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HELPLINE TAB */}
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
                                onClick={() => handleUpdateContact(idx)}
                                className="px-2.5 py-1 bg-green-600 text-white rounded text-[10px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingContact(null)}
                                className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
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
                          className="mt-4 text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer"
                        >
                          ✏️ Edit Number
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