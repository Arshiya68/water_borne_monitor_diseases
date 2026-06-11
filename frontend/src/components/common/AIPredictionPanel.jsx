import { Brain, TrendingUp, AlertTriangle, RefreshCw, Cpu } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TELANGANA_DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Nalgonda',
  'Warangal Urban', 'Warangal Rural', 'Vikarabad', 'Karimnagar',
  'Nizamabad', 'Kamareddy', 'Adilabad', 'Nirmal', 'Khammam',
  'Mahbubnagar', 'Nagarkurnool', 'Wanaparthy',
]

export default function AIPredictionPanel() {
  const [district, setDistrict] = useState('Hyderabad')
  const [mlData, setMlData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMLPrediction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district])

  const fetchMLPrediction = async () => {
    try {
      setLoading(true)
      setError(false)
      const response = await api.get(`/analytics/ml-analysis/${district}`)
      setMlData(response.data)
    } catch (err) {
      console.error('ML Prediction error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const riskLevel = mlData?.prediction?.risk_level || 'Low'
  const probability = mlData?.prediction?.probability || 0
  const waterQualityScore = mlData?.prediction?.water_quality_score || 0
  const drivers = mlData?.drivers || []
  const casesAnalyzed = mlData?.total_cases_analyzed || 0
  const wqi = mlData?.water_quality_index || 0

  const getRiskColors = (risk) => {
    if (risk === 'High') return { badge: 'bg-red-100 text-red-800 border-red-300', ring: 'border-red-400', text: 'text-red-600', bg: 'bg-red-50' }
    if (risk === 'Medium') return { badge: 'bg-amber-100 text-amber-800 border-amber-300', ring: 'border-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
    return { badge: 'bg-green-100 text-green-800 border-green-300', ring: 'border-green-400', text: 'text-green-600', bg: 'bg-green-50' }
  }

  const getDriverColor = (impact) => {
    if (impact > 70) return '#EF4444'
    if (impact > 40) return '#F59E0B'
    return '#10B981'
  }

  const colors = getRiskColors(riskLevel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>AI Outbreak Prediction</span>
          </h3>
          <p className="text-slate-600 text-sm mt-1">Live ML analysis using Gradient Boosting model</p>
        </div>
        <button
          onClick={fetchMLPrediction}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* District Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select District for Analysis</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="input-field w-full md:w-72"
        >
          {TELANGANA_DISTRICTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-purple-700 font-semibold">Analyzing {district}...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-800 font-semibold">ML Analysis Unavailable</p>
          <p className="text-sm text-amber-600 mt-1">Check that the backend server is running and the model is trained.</p>
          <button onClick={fetchMLPrediction} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700">
            Try Again
          </button>
        </div>
      ) : mlData ? (
        <>
          {/* Risk Overview */}
          <div className={`rounded-2xl border-2 p-6 ${colors.bg} ${colors.ring}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Risk Level */}
              <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Risk Level</p>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${colors.ring} bg-white`}>
                  <div>
                    <p className={`text-xl font-extrabold ${colors.text}`}>{Math.round(probability * 100)}%</p>
                    <p className={`text-xs font-bold ${colors.text}`}>{riskLevel}</p>
                  </div>
                </div>
              </div>
              {/* Water Quality */}
              <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium mb-2">Water Quality Score</p>
                <p className="text-3xl font-bold text-blue-600">{waterQualityScore.toFixed(1)}</p>
                <p className="text-xs text-slate-400">out of 100</p>
                <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(waterQualityScore, 100)}%` }} />
                </div>
              </div>
              {/* WQI */}
              <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium mb-2">Water Quality Index</p>
                <p className="text-3xl font-bold text-purple-600">{wqi.toFixed(1)}</p>
                <p className="text-xs text-slate-400">district avg</p>
              </div>
              {/* Cases */}
              <div className="text-center p-4 bg-white rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium mb-2">Cases Analyzed</p>
                <p className="text-3xl font-bold text-slate-900">{casesAnalyzed}</p>
                <p className="text-xs text-slate-400">community reports</p>
              </div>
            </div>
          </div>

          {/* Risk Drivers */}
          {drivers.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Top Risk Drivers</h4>
                <span className="ml-auto text-xs text-slate-500">ML feature importance</span>
              </div>
              <div className="space-y-3">
                {drivers.map((driver, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{driver.name}</span>
                      <span className="font-bold" style={{ color: getDriverColor(driver.impact) }}>{driver.impact}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${driver.impact}%`, backgroundColor: getDriverColor(driver.impact) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="font-bold text-slate-900 mb-3">🤖 About This ML Model</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div>
                <p className="font-bold mb-1">Model Type:</p>
                <p>Gradient Boosting Classifier</p>
              </div>
              <div>
                <p className="font-bold mb-1">Input Features:</p>
                <p>Water quality + community symptoms</p>
              </div>
              <div>
                <p className="font-bold mb-1">Training Data:</p>
                <p>Telangana district water quality + historical reports</p>
              </div>
              <div>
                <p className="font-bold mb-1">Last Analysis:</p>
                <p>{new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
            <p className="text-sm text-yellow-900">
              ⚠️ <strong>Disclaimer:</strong> These are ML-based estimates for outbreak risk. They should complement, not replace, professional epidemiological analysis and official health department protocols.
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
