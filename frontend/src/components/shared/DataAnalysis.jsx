import { useEffect, useState } from 'react'
import { AlertCircle, TrendingUp, Cpu, BarChart2 } from 'lucide-react'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TELANGANA_DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Nalgonda',
  'Warangal Urban', 'Warangal Rural', 'Vikarabad', 'Karimnagar',
  'Rajahmundry', 'Kakinada', 'Nizamabad', 'Kamareddy',
  'Adilabad', 'Nirmal', 'Khammam', 'Mahbubnagar',
  'Nagarkurnool', 'Wanaparthy',
]

const getDriverColor = (impact) => {
  if (impact > 70) return '#EF4444'
  if (impact > 40) return '#F59E0B'
  return '#10B981'
}

export default function DataAnalysis() {
  const [district, setDistrict] = useState('Hyderabad')
  const [data, setData] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(false)
  const [mlData, setMlData] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlError, setMlError] = useState(false)

  useEffect(() => {
    fetchData(district)
    fetchWeekly()
    fetchMlAnalysis(district)
  }, [district])

  const fetchData = async (districtName) => {
    try {
      setLoading(true)
      const response = await api.get(`/analytics/district/${districtName}/details`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load district analysis')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeekly = async () => {
    try {
      const response = await api.get('/analytics/weekly-trend')
      setWeekly(response.data)
    } catch (error) {
      console.error('Error fetching weekly trend:', error)
    }
  }

  const fetchMlAnalysis = async (districtName) => {
    try {
      setMlLoading(true)
      setMlError(false)
      const response = await api.get(`/analytics/ml-analysis/${districtName}`)
      setMlData(response.data)
    } catch (error) {
      console.error('Error fetching ML analysis:', error)
      setMlError(true)
      setMlData(null)
    } finally {
      setMlLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* District Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Select District for Analysis</h3>
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

      {/* ML-Powered Outbreak Risk Prediction */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-xl border-2 border-indigo-200 shadow-sm">
        <h3 className="text-xl font-bold text-indigo-900 mb-1 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-indigo-600" />
          🤖 ML-Powered Outbreak Risk Prediction
        </h3>
        <p className="text-sm text-indigo-700 mb-4">
          Real-time prediction using Gradient Boosting ML model trained on water quality and symptom datasets
        </p>

        {mlLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-indigo-700 font-semibold">Analyzing {district}...</span>
            </div>
          </div>
        ) : mlError ? (
          <div className="bg-white/80 p-6 rounded-xl border border-amber-200 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-800 font-semibold">ML Analysis Unavailable</p>
            <p className="text-sm text-amber-600 mt-1">The prediction model could not be reached. Please ensure the backend is running and the model is trained.</p>
          </div>
        ) : mlData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Level Badge */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-indigo-200 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Predicted Risk</p>
              <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${
                mlData.prediction?.risk_level === 'High' ? 'border-red-400 bg-red-50' :
                mlData.prediction?.risk_level === 'Medium' ? 'border-amber-400 bg-amber-50' :
                'border-emerald-400 bg-emerald-50'
              }`}>
                <div className="text-center">
                  <p className={`text-2xl font-extrabold ${
                    mlData.prediction?.risk_level === 'High' ? 'text-red-600' :
                    mlData.prediction?.risk_level === 'Medium' ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>
                    {Math.round((mlData.prediction?.probability || 0) * 100)}%
                  </p>
                  <p className={`text-xs font-bold ${
                    mlData.prediction?.risk_level === 'High' ? 'text-red-500' :
                    mlData.prediction?.risk_level === 'Medium' ? 'text-amber-500' :
                    'text-emerald-500'
                  }`}>
                    {mlData.prediction?.risk_level}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">Model Confidence</p>
            </div>

            {/* Water Quality & Cases */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-indigo-200 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Water Quality Score</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-extrabold text-blue-600">
                    {mlData.prediction?.water_quality_score?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-500 pb-1">/ 100</p>
                </div>
                <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-blue-500"
                    style={{ width: `${Math.min(mlData.prediction?.water_quality_score || 0, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Water Quality Index</p>
                <p className="text-2xl font-bold text-purple-600">{mlData.water_quality_index?.toFixed(1) || 'N/A'}</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cases Analyzed</p>
                <p className="text-2xl font-bold text-slate-900">{mlData.total_cases_analyzed || 0}</p>
                <p className="text-xs text-slate-500">reports in {district}</p>
              </div>
            </div>

            {/* Risk Drivers */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-indigo-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                <BarChart2 className="w-4 h-4" />
                Top Risk Drivers
              </p>
              {mlData.drivers && mlData.drivers.length > 0 ? (
                <div className="space-y-3">
                  {mlData.drivers.map((driver, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-semibold truncate pr-2">{driver.name}</span>
                        <span className="font-bold" style={{ color: getDriverColor(driver.impact) }}>{driver.impact}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(driver.impact, 100)}%`,
                            backgroundColor: getDriverColor(driver.impact)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No significant risk drivers detected</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Risk Drivers Chart (full width recharts) */}
      {mlData && mlData.drivers && mlData.drivers.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            📊 Risk Drivers Analysis
          </h3>
          <p className="text-sm text-slate-600 mb-4">Machine learning feature importance breakdown for {district}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mlData.drivers} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} unit="%" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
                  {mlData.drivers.map((entry, index) => (
                    <Cell key={index} fill={getDriverColor(entry.impact)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Analyzing district data...</p>
        </div>
      ) : data ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <p className="text-sm text-slate-600 font-semibold">Total Cases</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{data.total_cases}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <p className="text-sm text-slate-600 font-semibold">Verified Cases</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{data.verified_cases}</p>
              <p className="text-xs text-slate-600 mt-1">{data.verification_rate.toFixed(1)}% verified</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <p className="text-sm text-slate-600 font-semibold">Risk Level</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{data.risk_percentage.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <p className="text-sm text-slate-600 font-semibold">Water Quality</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{data.water_quality ? data.water_quality.toFixed(0) : 'N/A'}</p>
            </div>
          </div>

          {/* Symptoms Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🤢 Symptom Distribution</h3>
            <div className="space-y-3">
              {Object.entries(data.symptoms || {}).map(([symptom, count]) => (
                <div key={symptom} className="flex items-center justify-between">
                  <span className="text-slate-700 capitalize font-semibold">{symptom.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                        style={{ width: `${(count / (Object.values(data.symptoms || {}).reduce((a, b) => Math.max(a, b), 1))) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water Sources */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">💧 Water Source Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.water_sources || {}).map(([source, count]) => (
                <div key={source} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-slate-600 mt-2">{source}</p>
                </div>
              ))}
            </div>
          </div>



          {/* Risk Distribution */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-slate-600 font-semibold">Low Risk</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{data.risk_distribution.Low}</p>
              <p className="text-xs text-slate-600 mt-1">
                {data.total_cases > 0 ? ((data.risk_distribution.Low / data.total_cases) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-slate-600 font-semibold">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{data.risk_distribution.Medium}</p>
              <p className="text-xs text-slate-600 mt-1">
                {data.total_cases > 0 ? ((data.risk_distribution.Medium / data.total_cases) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-slate-600 font-semibold">High Risk</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{data.risk_distribution.High}</p>
              <p className="text-xs text-slate-600 mt-1">
                {data.total_cases > 0 ? ((data.risk_distribution.High / data.total_cases) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          {/* Prevention Tips */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Prevention Tips
            </h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ Drink only boiled or filtered water</li>
              <li>✓ Wash hands frequently with soap</li>
              <li>✓ Maintain proper hygiene</li>
              <li>✓ Report symptoms immediately</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">No data available for this district</p>
        </div>
      )}
    </div>
  )
}