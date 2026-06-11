import { Droplets, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../services/api'

const SAFE_RANGES = {
  ph_level: { min: 6.5, max: 8.5, label: '6.5 – 8.5', icon: '🧪', unit: '' },
  turbidity: { max: 5.0, label: '< 5.0 NTU', icon: '💧', unit: 'NTU' },
  dissolved_oxygen: { min: 5.0, label: '> 5.0 mg/L', icon: '💨', unit: 'mg/L' },
  nitrates: { max: 10.0, label: '< 10 mg/L', icon: '⚗️', unit: 'mg/L' },
  sulphates: { max: 250, label: '< 250 mg/L', icon: '🧫', unit: 'mg/L' },
  total_suspended_solids: { max: 50, label: '< 50 mg/L', icon: '🔬', unit: 'mg/L' },
}

function getStatus(field, value) {
  const range = SAFE_RANGES[field]
  if (!range || value === null || value === undefined) return 'unknown'
  if (field === 'ph_level') {
    if (value >= range.min && value <= range.max) return 'good'
    return Math.abs(value - 7.0) > 2 ? 'danger' : 'warning'
  }
  if (field === 'dissolved_oxygen') {
    if (value >= range.min) return 'good'
    return value < 2 ? 'danger' : 'warning'
  }
  // For max-bounded params
  if (value <= range.max * 0.6) return 'good'
  if (value <= range.max) return 'warning'
  return 'danger'
}

export default function WaterQualityDashboard({ district: initialDistrict }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [district, setDistrict] = useState(initialDistrict || 'Nalgonda')

  const DISTRICTS = [
    'Hyderabad', 'Ranga Reddy', 'Nalgonda', 'Warangal Urban', 'Warangal Rural',
    'Karimnagar', 'Nizamabad', 'Khammam', 'Mahbubnagar', 'Adilabad',
    'Kamareddy', 'Nirmal', 'Nagarkurnool', 'Wanaparthy', 'Medchal-Malkajgiri',
    'Vikarabad'
  ]

  useEffect(() => {
    fetchWaterQuality()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district])

  const fetchWaterQuality = async () => {
    try {
      setLoading(true)
      setError(false)
      const response = await api.get(`/water-quality/list?district=${district}`)
      // Get the latest reading
      const records = response.data || []
      setData(records.length > 0 ? records[0] : null)
    } catch (err) {
      console.error('Water quality fetch error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-300 text-green-900'
      case 'warning': return 'bg-yellow-50 border-yellow-300 text-yellow-900'
      case 'danger': return 'bg-red-50 border-red-300 text-red-900'
      default: return 'bg-slate-50 border-slate-300 text-slate-900'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'good': return '✅'
      case 'warning': return '⚠️'
      case 'danger': return '🚫'
      default: return '❓'
    }
  }

  const metrics = data ? [
    { label: 'pH Level', value: data.ph_level?.toFixed(1), field: 'ph_level', description: 'Water acidity/alkalinity' },
    { label: 'Turbidity', value: data.turbidity?.toFixed(2), field: 'turbidity', description: 'Water clarity measure' },
    { label: 'Dissolved Oxygen', value: data.dissolved_oxygen?.toFixed(2), field: 'dissolved_oxygen', description: 'Oxygen content in water' },
    { label: 'Nitrates', value: data.nitrates?.toFixed(2), field: 'nitrates', description: 'Chemical contamination indicator' },
    { label: 'Sulphates', value: data.sulphates?.toFixed(2), field: 'sulphates', description: 'Mineral content indicator' },
    { label: 'Total Suspended Solids', value: data.total_suspended_solids?.toFixed(2), field: 'total_suspended_solids', description: 'Particulate matter in water' },
  ] : []

  const overallStatus = data ? (
    metrics.some(m => getStatus(m.field, data[m.field]) === 'danger') ? 'danger' :
    metrics.some(m => getStatus(m.field, data[m.field]) === 'warning') ? 'warning' :
    'good'
  ) : 'unknown'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <span>Water Quality Dashboard</span>
          </h3>
          <p className="text-slate-600 text-sm mt-1">Real-time water quality parameters from district monitoring</p>
        </div>
        <button
          onClick={fetchWaterQuality}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* District Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select District</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="input-field w-full md:w-72"
        >
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-blue-700 font-semibold">Loading water quality data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-800 font-semibold">Could not load water quality data</p>
          <button onClick={fetchWaterQuality} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold">Try Again</button>
        </div>
      ) : !data ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
          <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No water quality data for {district}</p>
          <p className="text-slate-500 text-sm mt-1">Water quality readings will appear here once officials upload monitoring data</p>
        </div>
      ) : (
        <>
          {/* Overall Status */}
          <div className={`rounded-xl border-2 p-6 ${
            overallStatus === 'good' ? 'bg-green-50 border-green-300' :
            overallStatus === 'warning' ? 'bg-yellow-50 border-yellow-300' :
            'bg-red-50 border-red-300'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium opacity-75 mb-1">Overall Water Quality</p>
                <p className={`text-3xl font-bold ${
                  overallStatus === 'good' ? 'text-green-600' :
                  overallStatus === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {overallStatus === 'good' ? '✅ SAFE' : overallStatus === 'warning' ? '⚠️ CAUTION' : '🚫 UNSAFE'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium opacity-75 mb-1">Water Quality Index</p>
                <p className="text-3xl font-bold text-slate-900">{data.water_quality_index?.toFixed(1) || 'N/A'}</p>
                <p className="text-xs opacity-75">higher = better quality</p>
              </div>
              <div>
                <p className="text-sm font-medium opacity-75 mb-1">Location</p>
                <p className="text-lg font-bold text-slate-900">{data.village || district}</p>
                <p className="text-sm opacity-75">{data.district}, {data.state}</p>
                <p className="text-xs opacity-60 mt-1">{data.recorded_month}/{data.recorded_year}</p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m, idx) => {
              const range = SAFE_RANGES[m.field]
              const status = getStatus(m.field, data[m.field])
              return (
                <div key={idx} className={`rounded-xl border-2 p-5 ${getStatusColor(status)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium opacity-75">{m.label}</p>
                      <p className="text-3xl font-bold mt-1">
                        {m.value ?? 'N/A'}
                        {m.value && <span className="text-base ml-1 font-normal">{range?.unit}</span>}
                      </p>
                    </div>
                    <span className="text-2xl">{range?.icon || '📊'}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-75">Status</span>
                      <span className="font-bold">{getStatusEmoji(status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-75">Safe range</span>
                      <span className="font-bold">{range?.label || 'N/A'}</span>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 mt-2">{m.description}</p>
                </div>
              )
            })}
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="font-bold text-blue-900 mb-3">💡 Water Safety Recommendations for {district}</h4>
            <ul className="space-y-2 text-sm text-blue-900">
              {overallStatus === 'good' ? (
                <>
                  <li>✓ Water quality parameters are within safe limits</li>
                  <li>✓ Continue regular boiling before drinking as a precaution</li>
                  <li>✓ Store water in clean, covered containers</li>
                  <li>✓ Report any symptoms of waterborne illness immediately</li>
                </>
              ) : overallStatus === 'warning' ? (
                <>
                  <li>⚠️ Some parameters are approaching unsafe levels</li>
                  <li>⚠️ Boil all drinking water before consumption</li>
                  <li>⚠️ Avoid using river or open water sources</li>
                  <li>⚠️ Health authorities have been notified</li>
                </>
              ) : (
                <>
                  <li>🚫 Water quality is unsafe for direct consumption</li>
                  <li>🚫 Use only government-supplied drinking water</li>
                  <li>🚫 Report all symptoms to ASHA worker or health center</li>
                  <li>🚫 Emergency health teams are being dispatched</li>
                </>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
