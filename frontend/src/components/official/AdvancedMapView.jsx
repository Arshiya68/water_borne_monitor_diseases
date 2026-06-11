import { useEffect, useState } from 'react'
import { AlertCircle, MapPin } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

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

export default function AdvancedMapView() {
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
      console.error('Error:', error)
      toast.error('Failed to load map data')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    if (risk === 'High') return '#EF4444'
    if (risk === 'Medium') return '#F59E0B'
    return '#10B981'
  }

  const filtered = districts.filter(d => 
    filter === 'All' || d.overall_risk === filter
  )

  const highCount = districts.filter(d => d.overall_risk === 'High').length
  const medCount = districts.filter(d => d.overall_risk === 'Medium').length
  const lowCount = districts.filter(d => d.overall_risk === 'Low').length

  if (loading) return <div className="text-center py-12">Loading map...</div>

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-sm font-bold text-red-800">{highCount} High Risk</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-sm font-bold text-amber-800">{medCount} Medium Risk</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-bold text-emerald-800">{lowCount} Low Risk</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-800">{districts.length} Total Districts</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Filter by Risk Level</h3>
        <div className="flex gap-3 flex-wrap">
          {['All', 'High', 'Medium', 'Low'].map(risk => (
            <button
              key={risk}
              onClick={() => setFilter(risk)}
              className={`px-6 py-2.5 rounded-xl font-semibold transition ${
                filter === risk
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {risk === 'All' ? '📍 All Districts' : risk === 'High' ? '🔴 High Risk' : risk === 'Medium' ? '🟡 Medium Risk' : '🟢 Low Risk'}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ height: '500px' }}>
        <MapContainer
          center={[18.1124, 79.0193]}
          zoom={8}
          style={{ height: '100%', borderRadius: '0.75rem' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          {filtered.map(district => {
            const radius = Math.max(8, Math.min(Math.sqrt(district.total_reports) * 4, 25))
            return (
              <CircleMarker
                key={district.name}
                center={TELANGANA_COORDS[district.name] || [17.3850, 78.4867]}
                radius={radius}
                pathOptions={{
                  color: getRiskColor(district.overall_risk),
                  fillColor: getRiskColor(district.overall_risk),
                  fillOpacity: 0.65,
                  weight: 3,
                }}
              >
                <Popup>
                  <div className="w-64">
                    <h3 className="font-bold text-base">{district.name}</h3>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Risk Level:</span>
                        <span className={`font-bold ${
                          district.overall_risk === 'High' ? 'text-red-600' :
                          district.overall_risk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{district.overall_risk}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Cases:</span>
                        <span className="font-bold">{district.total_reports}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Risk %:</span>
                        <span className="font-bold">{district.risk_percentage}%</span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(district.risk_percentage, 100)}%`,
                              backgroundColor: getRiskColor(district.overall_risk)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1 text-xs">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">H:{district.high_risk}</span>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">M:{district.medium_risk}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">L:{district.low_risk}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg z-[1000] border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Risk Level</p>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs text-slate-600 font-medium">High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="text-xs text-slate-600 font-medium">Medium Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-600 font-medium">Low Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* District List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">District Overview ({filtered.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(district => (
            <div key={district.name} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{district.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">Total Cases: {district.total_reports}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                  district.overall_risk === 'High' ? 'bg-red-600' :
                  district.overall_risk === 'Medium' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {district.overall_risk}
                </span>
              </div>
              {/* Risk mini bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Risk</span>
                  <span>{district.risk_percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(district.risk_percentage, 100)}%`,
                      backgroundColor: getRiskColor(district.overall_risk)
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 flex space-x-2 text-xs">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded">High: {district.high_risk}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Med: {district.medium_risk}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Low: {district.low_risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}