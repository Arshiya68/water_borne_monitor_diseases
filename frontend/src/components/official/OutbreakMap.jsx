import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Loader, AlertCircle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const TELANGANA_COORDS = {
  Hyderabad: [17.3850, 78.4867],
  'Ranga Reddy': [17.4060, 78.4772],
  'Medchal-Malkajgiri': [17.3705, 78.5919],
  Nalgonda: [17.5738, 79.1335],
  'Warangal Urban': [17.9689, 79.5941],
  'Warangal Rural': [18.0067, 79.5882],
  Vikarabad: [18.3183, 78.1380],
  Karimnagar: [18.4386, 78.8478],
  Rajahmundry: [17.0753, 81.7740],
  Kakinada: [16.9891, 82.2475],
  Nizamabad: [18.6725, 78.1358],
  Kamareddy: [18.4569, 78.3422],
  Adilabad: [19.6648, 78.5239],
  Nirmal: [19.1427, 78.3789],
  Khammam: [17.2673, 80.6193],
  Mahbubnagar: [16.7394, 78.6716],
  Nagarkurnool: [16.1761, 78.3383],
  Wanaparthy: [16.5122, 77.9378],
}

export default function OutbreakMap() {
  const [hotspots, setHotspots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHotspots()
  }, [])

  const fetchHotspots = async () => {
    try {
      const response = await api.get('/analytics/hotspot-map')
      setHotspots(response.data || [])
    } catch (error) {
      toast.error('Failed to load map data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-slate-100 rounded-lg">
        <div className="flex items-center space-x-2 text-slate-600">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Loading map data...</span>
        </div>
      </div>
    )
  }

  const defaultCenter = [17.3850, 78.4867]

  const highCount = hotspots.filter(h => h.risk_level === 'High').length
  const medCount = hotspots.filter(h => h.risk_level === 'Medium').length
  const lowCount = hotspots.filter(h => h.risk_level === 'Low').length

  return (
    <div className="space-y-4">

      {/* Summary Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-red-800">
            {highCount} High Risk
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-sm font-semibold text-amber-800">
            {medCount} Medium Risk
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-semibold text-emerald-800">
            {lowCount} Low Risk
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">

        {/* No Data */}
        {hotspots.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
            <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-slate-500 font-semibold">
              No hotspot data available
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Report symptoms to see outbreak locations
            </p>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-3">
              <p className="font-semibold text-blue-900">
                🛰 Real-Time Disease Surveillance Map
              </p>
              <p className="text-sm text-blue-700">
                Red zones indicate higher outbreak risk. Click a hotspot for details.
              </p>
            </div>

            {/* Map */}
            <MapContainer
              center={defaultCenter}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {hotspots.map((hotspot, idx) => {
                const size = Math.max(
                  6,
                  Math.min(Math.sqrt(hotspot.total_cases || 1) * 4, 25)
                )

                const centerCoords =
                  TELANGANA_COORDS[hotspot.district] || [
                    hotspot.latitude || 17.3850,
                    hotspot.longitude || 78.4867,
                  ]

                return (
                  <CircleMarker
                    key={idx}
                    center={centerCoords}
                    radius={size}
                    fillColor={hotspot.color}
                    color={hotspot.color}
                    weight={2}
                    opacity={0.9}
                    fillOpacity={0.6}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-bold text-base">
                          {hotspot.village}
                        </p>
                        <p className="text-slate-500">
                          {hotspot.district}
                        </p>

                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Cases:</span>
                            <span className="font-bold">
                              {hotspot.total_cases}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-600">Verified:</span>
                            <span className="font-bold">
                              {hotspot.verified_cases}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              hotspot.risk_level === 'High'
                                ? 'bg-red-100 text-red-800'
                                : hotspot.risk_level === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {hotspot.risk_level} Risk
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </>
        )}

        {/* Legend */}
        {hotspots.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg z-[1000] border border-slate-200">
            <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Risk Level
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs text-slate-600 font-medium">
                  High Risk
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                <span className="text-xs text-slate-600 font-medium">
                  Medium Risk
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-600 font-medium">
                  Low Risk
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}