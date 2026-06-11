import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/common/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import { CheckCircle, ClipboardList, Shield, ArrowRight, RefreshCcw, Pencil, Eye, Download } from 'lucide-react'
import { generateVillageRiskReport } from '../services/pdfExport'

const WATER_SOURCES = ['Tap Water', 'Borewell', 'Tank', 'River']
const AGE_GROUPS = ['Child', 'Adult', 'Elderly']

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportDetails, setReportDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [verificationData, setVerificationData] = useState({ diagnosis: '', referral_status: false })

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (selectedReport) {
      fetchReportDetails(selectedReport.id)
    }
  }, [selectedReport])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reports/list')
      setReports(response.data)
      if (!selectedReport && response.data.length > 0) {
        setSelectedReport(response.data[0])
      }
    } catch (error) {
      toast.error('Unable to load reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportDetails = async (reportId) => {
    setDetailLoading(true)
    try {
      const response = await api.get(`/reports/${reportId}`)
      setReportDetails(response.data)
      setEditData({
        diarrhea: response.data.symptoms.diarrhea,
        vomiting: response.data.symptoms.vomiting,
        fever: response.data.symptoms.fever,
        abdominal_pain: response.data.symptoms.abdominal_pain,
        dehydration: response.data.symptoms.dehydration,
        diarrhea_severity: response.data.diarrhea_severity || 1,
        fever_severity: response.data.fever_severity || 1,
        water_source: response.data.water_source,
        household_affected: response.data.household_affected,
        age_group: response.data.age_group,
      })
      setVerificationData({
        diagnosis: response.data.diagnosis || '',
        referral_status: response.data.referral_status || false,
      })
    } catch (error) {
      toast.error('Unable to load report details')
    } finally {
      setDetailLoading(false)
    }
  }

  const updateEditField = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVerifySubmit = async (event) => {
    event.preventDefault()
    if (!reportDetails) return

    setVerifyLoading(true)
    try {
      const response = await api.patch(`/reports/verify/${reportDetails.id}`, verificationData)
      toast.success(response.data.message || 'Report verified successfully')
      await fetchReports()
      await fetchReportDetails(reportDetails.id)
      setEditMode(false)
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to verify report'
      toast.error(message)
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleUpdateReport = async (event) => {
    event.preventDefault()
    if (!reportDetails) return

    setVerifyLoading(true)
    try {
      const payload = {
        diarrhea: Number(editData.diarrhea),
        vomiting: Number(editData.vomiting),
        fever: Number(editData.fever),
        abdominal_pain: Number(editData.abdominal_pain),
        dehydration: Number(editData.dehydration),
        diarrhea_severity: Number(editData.diarrhea_severity),
        fever_severity: Number(editData.fever_severity),
        water_source: Number(editData.water_source),
        household_affected: Number(editData.household_affected),
        age_group: Number(editData.age_group),
      }

      const response = await api.patch(`/reports/${reportDetails.id}`, payload)
      toast.success(response.data.message || 'Report updated successfully')
      setEditMode(false)
      await fetchReports()
      await fetchReportDetails(reportDetails.id)
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to update report'
      toast.error(message)
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!reportDetails) return
    try {
      const stats = await api.get('/analytics/statistics')
      await generateVillageRiskReport({
        village: reportDetails.village,
        district: reportDetails.district,
        state: reportDetails.state,
        total_reports: stats.data?.total_reports || 1,
        verified_reports: reportDetails.verified ? 1 : 0,
        ml_prediction: {
          risk_level: reportDetails.predicted_risk,
          probability: reportDetails.risk_confidence,
        },
        water_quality: reportDetails.water_quality_score ? {
          water_quality_index: reportDetails.water_quality_score,
          risk_level: reportDetails.predicted_risk,
        } : null,
      })
      toast.success('Report downloaded successfully!')
    } catch (err) {
      toast.error('Could not generate PDF report')
    }
  }

  const isOwner = reportDetails?.user_id === user?.id
  const canVerify = ['official', 'admin', 'asha_worker'].includes(user?.role)

  const renderStatusPill = (report) => {
    if (report.verified) {
      return <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Verified</span>
    }
    return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">Pending</span>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Reports & Verification</h1>
            <p className="text-slate-600 mt-2">Review submitted symptom reports, check ML risk details, and verify cases for your area.</p>
          </div>
          <button
            type="button"
            onClick={fetchReports}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh reports
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.2fr]">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Report list</p>
                <h2 className="text-2xl font-semibold text-slate-900">Available reports</h2>
              </div>
              <span className="text-sm text-slate-500">{reports.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Village</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Risk</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Status</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-500">Loading reports...</td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-500">No reports found.</td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr
                        key={report.id}
                        className={`cursor-pointer hover:bg-slate-50 ${selectedReport?.id === report.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">{report.village}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{report.predicted_risk}</td>
                        <td className="px-4 py-4">{renderStatusPill(report)}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{new Date(report.submitted_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Report details</p>
                <h2 className="text-2xl font-semibold text-slate-900">{reportDetails?.village || 'Select a report'}</h2>
              </div>
              {reportDetails && (
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <Eye className="w-4 h-4" />
                  {reportDetails.submitted_by?.name || 'Reported by user'}
                </div>
              )}
            </div>

            {detailLoading || loading ? (
              <div className="py-20 text-center text-slate-500">Loading selected report...</div>
            ) : reportDetails ? (
              <div className="space-y-6">
                {/* Download button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-3 text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500">Predicted risk</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{reportDetails.predicted_risk}</p>
                    <p className="text-sm text-slate-600 mt-2">Confidence {(reportDetails.risk_confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500">Verification</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{reportDetails.verified ? 'Verified' : 'Pending'}</p>
                    <p className="text-sm text-slate-600 mt-2">{reportDetails.verified_at ? new Date(reportDetails.verified_at).toLocaleString() : 'Awaiting review'}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500">District / State</p>
                    <p className="text-base font-semibold text-slate-900">{reportDetails.district}, {reportDetails.state}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                    <p className="text-xs uppercase text-slate-500">Household affected</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{reportDetails.household_affected}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl p-5 border border-slate-200 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-900">Symptoms</p>
                    <div className="mt-4 grid gap-3">
                      {Object.entries(reportDetails.symptoms).map(([key, value]) => (
                        <div key={key} className="rounded-2xl bg-white p-4 border border-slate-200 flex items-center justify-between">
                          <span className="capitalize text-slate-700">{key.replace('_', ' ')}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${value ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {value ? 'Yes' : 'No'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl p-5 border border-slate-200 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-900">Prediction details</p>
                    <div className="mt-4 space-y-3 text-slate-700 text-sm">
                      <p><span className="font-semibold">Water quality score:</span> {reportDetails.water_quality_score}</p>
                      <p><span className="font-semibold">Source:</span> {WATER_SOURCES[reportDetails.water_source]}</p>
                      <p><span className="font-semibold">Age group:</span> {AGE_GROUPS[reportDetails.age_group]}</p>
                    </div>
                  </div>
                </div>

                {reportDetails.village_risk && (
                  <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Village composite risk</p>
                        <p className="text-xl font-semibold text-slate-900">{reportDetails.village_risk.predicted_risk}</p>
                      </div>
                      <span className="text-sm text-slate-600">Score {reportDetails.village_risk.composite_score.toFixed(0)}</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 border border-blue-100">
                        <p className="text-xs uppercase text-slate-500">Water contribution</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{reportDetails.village_risk.water_quality_contribution.toFixed(0)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-blue-100">
                        <p className="text-xs uppercase text-slate-500">Symptoms contribution</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{reportDetails.village_risk.symptom_contribution.toFixed(0)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-blue-100">
                        <p className="text-xs uppercase text-slate-500">Confidence</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{Math.round(reportDetails.village_risk.confidence * 100)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Verification history</p>
                      <p className="text-base font-semibold text-slate-900">{reportDetails.verified ? 'This report has been verified' : 'Not verified yet'}</p>
                    </div>
                    {reportDetails.verified_by?.name && (
                      <span className="text-sm text-slate-600">Verified by {reportDetails.verified_by.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">Diagnosis: {reportDetails.diagnosis || 'Not assigned'}</p>
                  <p className="text-sm text-slate-700">Referral status: {reportDetails.referral_status ? 'Yes' : 'No'}</p>
                </div>

                {isOwner && !reportDetails.verified && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">Update your report</p>
                        <p className="text-sm text-slate-500">You can edit the symptom values before verification.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditMode((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Pencil className="w-4 h-4" />
                        {editMode ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    {editMode ? (
                      <form onSubmit={handleUpdateReport} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {['diarrhea','vomiting','fever','abdominal_pain','dehydration'].map((field) => (
                            <label key={field} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <input
                                type="checkbox"
                                checked={Boolean(editData[field])}
                                onChange={(e) => updateEditField(field, e.target.checked ? 1 : 0)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600"
                              />
                              <span className="text-slate-700 capitalize">{field.replace('_', ' ')}</span>
                            </label>
                          ))}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <label className="space-y-2">
                            <span className="text-sm text-slate-700">Diarrhea severity</span>
                            <select
                              value={editData.diarrhea_severity}
                              onChange={(e) => updateEditField('diarrhea_severity', e.target.value)}
                              className="input-field w-full"
                            >
                              {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>{value}</option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm text-slate-700">Fever severity</span>
                            <select
                              value={editData.fever_severity}
                              onChange={(e) => updateEditField('fever_severity', e.target.value)}
                              className="input-field w-full"
                            >
                              {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>{value}</option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm text-slate-700">Water source</span>
                            <select
                              value={editData.water_source}
                              onChange={(e) => updateEditField('water_source', e.target.value)}
                              className="input-field w-full"
                            >
                              {WATER_SOURCES.map((label, idx) => (
                                <option key={label} value={idx}>{label}</option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm text-slate-700">Household affected</span>
                            <input
                              type="number"
                              min="1"
                              value={editData.household_affected}
                              onChange={(e) => updateEditField('household_affected', e.target.value)}
                              className="input-field w-full"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm text-slate-700">Age group</span>
                            <select
                              value={editData.age_group}
                              onChange={(e) => updateEditField('age_group', e.target.value)}
                              className="input-field w-full"
                            >
                              {AGE_GROUPS.map((label, idx) => (
                                <option key={label} value={idx}>{label}</option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={verifyLoading}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Save changes
                        </button>
                      </form>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm text-slate-600">Symptoms are editable until verified.</p>
                          <p className="text-sm text-slate-700">Click edit to update the details.</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm text-slate-600">Prediction will refresh after updating.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {canVerify && !reportDetails.verified && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">Verify this report</p>
                        <p className="text-sm text-slate-500">Admin and health officials can confirm and add a diagnosis.</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200">
                        <Shield className="w-4 h-4 text-slate-500" />
                        Verification mode
                      </span>
                    </div>

                    <form onSubmit={handleVerifySubmit} className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        Diagnosis
                        <input
                          type="text"
                          value={verificationData.diagnosis}
                          onChange={(e) => setVerificationData({ ...verificationData, diagnosis: e.target.value })}
                          className="input-field mt-2 w-full"
                          placeholder="Enter condition or observation"
                        />
                      </label>

                      <label className="flex items-center gap-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={verificationData.referral_status}
                          onChange={(e) => setVerificationData({ ...verificationData, referral_status: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        Mark this case for referral or follow-up
                      </label>

                      <button
                        type="submit"
                        disabled={verifyLoading}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Verify report
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">Select a report from the list to view the full details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
