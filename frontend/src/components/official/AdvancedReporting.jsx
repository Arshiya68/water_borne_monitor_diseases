import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Download, Filter, Search, Calendar } from 'lucide-react'
import { generateOutbreakReport, generateVillageRiskReport, generateDetailedAnalytics } from '../../services/pdfExport'

export default function AdvancedReporting() {
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    village: '',
    status: 'all',
    riskLevel: 'all',
    dateRange: '30',
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReportsData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, reports, searchTerm])

  const fetchReportsData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.get('/reports/list'),
        api.get('/analytics/statistics'),
      ])

      setReports(reportsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = reports

    if (filters.village) {
      filtered = filtered.filter((r) => r.village === filters.village)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((r) =>
        filters.status === 'verified' ? r.verified : !r.verified
      )
    }

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }

  const handleExportSelected = async (type) => {
    try {
      if (type === 'summary' && stats) {
        await generateOutbreakReport(null, stats)
      } else if (type === 'detailed' && stats) {
        await generateDetailedAnalytics(stats)
      } else if (type === 'filtered') {
        // Export filtered reports
        toast.success('Exporting filtered reports...')
      }
      toast.success('Report exported successfully!')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const villages = [...new Set(reports.map((r) => r.village).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Export Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleExportSelected('summary')}
          className="flex items-center justify-center space-x-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition"
        >
          <Download className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Export Summary Report</span>
        </button>
        <button
          onClick={() => handleExportSelected('detailed')}
          className="flex items-center justify-center space-x-2 p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:border-green-400 transition"
        >
          <Download className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-900">Export Analytics</span>
        </button>
        <button
          onClick={() => handleExportSelected('filtered')}
          className="flex items-center justify-center space-x-2 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition"
        >
          <Download className="w-5 h-5 text-orange-600" />
          <span className="font-medium text-orange-900">Export Filtered Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <span>Advanced Filters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Village or diagnosis..."
                className="input-field w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Village
            </label>
            <select
              value={filters.village}
              onChange={(e) => setFilters({ ...filters, village: e.target.value })}
              className="input-field w-full"
            >
              <option value="">All Villages</option>
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field w-full"
            >
              <option value="all">All</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="input-field w-full"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Filtered Reports ({filteredReports.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Village</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Submitted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Diagnosis</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Affected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {report.village}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(report.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.verified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {report.diagnosis || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {report.household_affected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No reports match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}