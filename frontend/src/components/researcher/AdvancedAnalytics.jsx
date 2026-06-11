import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Users, AlertTriangle, Activity, Download } from 'lucide-react'

export default function AdvancedAnalytics() {
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState([])
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, trendsRes] = await Promise.all([
        api.get('/analytics/statistics'),
        api.get(`/analytics/trends/${period}`),
      ])
      setStats(statsRes.data)
      setTrends(trendsRes.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 mb-2">Total Reports</p>
          <p className="text-4xl font-bold text-blue-600">{stats.total_reports}</p>
          <p className="text-xs text-slate-500 mt-2">Across all villages</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 mb-2">Verification Rate</p>
          <p className="text-4xl font-bold text-green-600">{stats.verification_rate}%</p>
          <p className="text-xs text-slate-500 mt-2">{stats.verified_reports} verified</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 mb-2">Affected Villages</p>
          <p className="text-4xl font-bold text-orange-600">{stats.affected_villages}</p>
          <p className="text-xs text-slate-500 mt-2">Geographic spread</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 mb-2">High-Risk Cases</p>
          <p className="text-4xl font-bold text-red-600">{stats.high_risk_areas}</p>
          <p className="text-xs text-slate-500 mt-2">Requiring attention</p>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Disease Trends</h3>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_reports" stroke="#3b82f6" name="Total Reports" />
            <Line type="monotone" dataKey="verified" stroke="#10b981" name="Verified" />
            <Line type="monotone" dataKey="symptom_count" stroke="#ef4444" name="Symptoms" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Symptom Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Symptom Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.symptom_distribution).map(([name, count]) => ({
              name: name.replace('_', ' '),
              count,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Water Source Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats.water_source_distribution).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Button */}
      <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition">
        <Download className="w-5 h-5" />
        <span>Export Report as PDF</span>
      </button>
    </div>
  )
}