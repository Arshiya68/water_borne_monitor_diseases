import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { AlertCircle, Droplets, Activity } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TELANGANA_DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Nalgonda',
  'Warangal Urban', 'Warangal Rural', 'Vikarabad', 'Karimnagar',
  'Rajahmundry', 'Kakinada', 'Nizamabad', 'Kamareddy',
  'Adilabad', 'Nirmal', 'Khammam', 'Mahbubnagar',
  'Nagarkurnool', 'Wanaparthy',
]

export default function DatasetComparison() {
  const [district, setDistrict] = useState('Hyderabad')
  const [data, setData] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData(district)
    fetchWeekly()
  }, [district])

  const fetchData = async (districtName) => {
    try {
      setLoading(true)
      console.log('Fetching data for:', districtName)
      const response = await api.get(`/analytics/district/${districtName}/details`)
      console.log('Response:', response.data)
      setData(response.data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load district data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeekly = async () => {
    try {
      const response = await api.get('/analytics/weekly-trend')
      setWeekly(response.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-6">
      {/* District Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Select District</h3>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="input-field w-full md:w-96"
        >
          {TELANGANA_DISTRICTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Analyzing data...</div>
      ) : data ? (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-600">Total Cases</p>
              <p className="text-3xl font-bold text-blue-600">{data.total_cases}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <p className="text-sm text-slate-600">Verified</p>
              <p className="text-3xl font-bold text-green-600">{data.verified_cases}</p>
              <p className="text-xs text-slate-600 mt-1">{data.verification_rate}%</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <p className="text-sm text-slate-600">Risk %</p>
              <p className="text-3xl font-bold text-orange-600">{data.risk_percentage.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <p className="text-sm text-slate-600">Water Quality</p>
              <p className="text-3xl font-bold text-purple-600">{data.water_quality || 'N/A'}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Symptoms */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Symptoms</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(data.symptoms).map(([k, v]) => ({ name: k, cases: v }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Water Sources */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Water Sources</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.water_sources).map(([k, v]) => ({ name: k, value: v }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {Object.entries(data.water_sources).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Trend */}
          {weekly.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Weekly Risk Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="risk_percentage" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Risk Distribution */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-slate-600">Low Risk</p>
              <p className="text-2xl font-bold text-green-600">{data.risk_distribution.Low}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-slate-600">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{data.risk_distribution.Medium}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-slate-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{data.risk_distribution.High}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">No data available</div>
      )}
    </div>
  )
}