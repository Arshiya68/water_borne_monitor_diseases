import Navbar from '../components/common/Navbar'
import AdvancedMapView from '../components/official/AdvancedMapView'

export default function MapViewPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🗺️ Outbreak Hotspot Map</h1>
        <p className="text-slate-600 mb-6">View affected districts and risk levels across Telangana</p>
        <AdvancedMapView />
      </div>
    </div>
  )
}