import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TELANGANA_COORDS = {
  'Hyderabad': [17.3850, 78.4867],
  'Ranga Reddy': [17.4060, 78.4772],
  'Medchal-Malkajgiri': [17.3705, 78.5919],
  'Nalgonda': [17.5738, 79.1335],
  'Warangal Urban': [17.9689, 79.5941],
  'Warangal Rural': [18.0067, 79.5882],
  'Vikarabad': [18.3183, 78.1380],
  'Karimnagar': [18.4386, 78.8478],
  'Rajahmundry': [17.0753, 81.7740],
  'Kakinada': [16.9891, 82.2475],
  'Nizamabad': [18.6725, 78.1358],
  'Kamareddy': [18.4569, 78.3422],
  'Adilabad': [19.6648, 78.5239],
  'Nirmal': [19.1427, 78.3789],
  'Khammam': [17.2673, 80.6193],
  'Mahbubnagar': [16.7394, 78.6716],
  'Nagarkurnool': [16.1761, 78.3383],
  'Wanaparthy': [16.5122, 77.9378],
}

export default function MapView() {
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchDistricts()
  }, [])

  const fetchDistricts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/analytics/districts')
      setDistricts(response.data)
    } catch (error) {
      console.error('Error fetching districts:', error)
      toast.error('Failed to load map data')
      setDistricts([])
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    if (risk === 'High') return '#EF4444'
    if (risk === 'Medium') return '#F59E0B'
    return '#10B981'
  }

  const getRiskLabel = (risk) => {
    if (risk === 'High') return '🔴 High Risk'
    if (risk === 'Medium') return '🟡 Medium Risk'
    return '🟢 Low Risk'
  }

  const filtered = districts.filter(d => 
    filter === 'All' || d.overall_risk === filter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600">Loading map data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Filter Districts by Risk</h3>
        <div className="flex gap-3 flex-wrap">
          {['All', 'High', 'Medium', 'Low'].map(risk => (
            <button
              key={risk}
              onClick={() => setFilter(risk)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === risk
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {risk === 'All' ? '📍 All Districts' : getRiskLabel(risk)}
            </button>
          ))}
        </div>
      </div>

      {/* Simple Map Visualization */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📍 Telangana District Overview</h3>
        <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-lg border-2 border-blue-200 min-h-96 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">Telangana Outbreak Map</p>
            <p className="text-slate-500 text-sm mt-2">Districts: {filtered.length}</p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Low Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* District List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">District Details ({filtered.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length > 0 ? (
            filtered.map(district => (
              <div key={district.name} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-slate-900">{district.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    district.overall_risk === 'High' ? 'bg-red-600' :
                    district.overall_risk === 'Medium' ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}>
                    {district.overall_risk}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Cases:</span>
                    <span className="font-semibold">{district.total_reports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Risk %:</span>
                    <span className="font-semibold">{district.risk_percentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Water Quality:</span>
                    <span className="font-semibold">{district.water_quality ? district.water_quality.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 text-xs">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded">H: {district.high_risk}</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">M: {district.medium_risk}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">L: {district.low_risk}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-slate-500">
              No districts match the selected filter
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-3">📌 How to Read the Map</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>🔴 <strong>High Risk:</strong> Active outbreak detected, take precautions</li>
          <li>🟡 <strong>Medium Risk:</strong> Few cases reported, monitor situation</li>
          <li>🟢 <strong>Low Risk:</strong> Safe zone, normal precautions recommended</li>
        </ul>
      </div>
    </div>
  )
}