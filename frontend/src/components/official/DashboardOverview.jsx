import { useEffect, useState } from 'react'
import { Activity, AlertCircle, MapPin, Droplets } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function DashboardOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log('Fetching statistics...')
      const response = await api.get('/analytics/statistics')
      console.log('Stats response:', response.data)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading overview...</div>
  }

  if (!stats) {
    return <div className="text-center py-12 text-red-600">Failed to load statistics</div>
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {stats.high_risk_cases > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 text-lg">🚨 High Risk Alert</h3>
              <p className="text-sm text-red-800 mt-1">
                {stats.high_risk_cases} high-risk cases reported across {stats.affected_districts} districts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">Total Reports</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total_reports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">Verified Cases</p>
              <p className="text-3xl font-bold text-green-600">{stats.verified_reports}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.verification_rate}% verified</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">High Risk</p>
              <p className="text-3xl font-bold text-red-600">{stats.high_risk_cases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">Affected Districts</p>
              <p className="text-3xl font-bold text-orange-600">{stats.affected_districts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-6">Risk Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-slate-600">High Risk</p>
            <p className="text-3xl font-bold text-red-600">{stats.high_risk_cases}</p>
            <p className="text-xs text-slate-600 mt-1">
              {stats.total_reports > 0 ? ((stats.high_risk_cases / stats.total_reports) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-slate-600">Medium Risk</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.medium_risk_cases}</p>
            <p className="text-xs text-slate-600 mt-1">
              {stats.total_reports > 0 ? ((stats.medium_risk_cases / stats.total_reports) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-slate-600">Low Risk</p>
            <p className="text-3xl font-bold text-green-600">{stats.low_risk_cases}</p>
            <p className="text-xs text-slate-600 mt-1">
              {stats.total_reports > 0 ? ((stats.low_risk_cases / stats.total_reports) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-bold text-slate-900 mb-4">📋 Recommended Actions</h3>
        <ul className="space-y-2">
          <li className="text-sm text-slate-700 flex items-start space-x-2">
            <span>✓</span>
            <span>Monitor high-risk districts and increase surveillance</span>
          </li>
          <li className="text-sm text-slate-700 flex items-start space-x-2">
            <span>✓</span>
            <span>Send SMS alerts to residents with contact numbers</span>
          </li>
          <li className="text-sm text-slate-700 flex items-start space-x-2">
            <span>✓</span>
            <span>Review water quality data for contamination issues</span>
          </li>
          <li className="text-sm text-slate-700 flex items-start space-x-2">
            <span>✓</span>
            <span>Coordinate with local health centers for verification</span>
          </li>
        </ul>
      </div>
    </div>
  )
}