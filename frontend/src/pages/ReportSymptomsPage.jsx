import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/common/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertCircle,
  Activity,
  Droplet,
  HeartPulse,
  Shield,
  Sparkles,
  Volume2,
  MapPin,
} from 'lucide-react'

const TELANGANA_DISTRICTS = [
  { name: 'Hyderabad', coords: [17.3850, 78.4867] },
  { name: 'Ranga Reddy', coords: [17.4060, 78.4772] },
  { name: 'Medchal-Malkajgiri', coords: [17.3705, 78.5919] },
  { name: 'Nalgonda', coords: [17.5738, 79.1335] },
  { name: 'Warangal Urban', coords: [17.9689, 79.5941] },
  { name: 'Warangal Rural', coords: [18.0067, 79.5882] },
  { name: 'Vikarabad', coords: [18.3183, 78.1380] },
  { name: 'Karimnagar', coords: [18.4386, 78.8478] },
  { name: 'Rajahmundry', coords: [17.0753, 81.7740] },
  { name: 'Kakinada', coords: [16.9891, 82.2475] },
  { name: 'Nizamabad', coords: [18.6725, 78.1358] },
  { name: 'Kamareddy', coords: [18.4569, 78.3422] },
  { name: 'Adilabad', coords: [19.6648, 78.5239] },
  { name: 'Nirmal', coords: [19.1427, 78.3789] },
  { name: 'Khammam', coords: [17.2673, 80.6193] },
  { name: 'Mahbubnagar', coords: [16.7394, 78.6716] },
  { name: 'Nagarkurnool', coords: [16.1761, 78.3383] },
  { name: 'Wanaparthy', coords: [16.5122, 77.9378] },
]

function ClickToLocate({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      // Find nearest district
      let nearest = TELANGANA_DISTRICTS[0]
      let minDist = Infinity
      for (const d of TELANGANA_DISTRICTS) {
        const dist = Math.sqrt(Math.pow(d.coords[0] - lat, 2) + Math.pow(d.coords[1] - lng, 2))
        if (dist < minDist) { minDist = dist; nearest = d }
      }
      onLocationSelect(nearest.name, lat, lng)
    }
  })
  return null
}

const WATER_SOURCES = [
  { value: 0, label: 'Tap Water' },
  { value: 1, label: 'Borewell' },
  { value: 2, label: 'Tank' },
  { value: 3, label: 'River' },
]

const AGE_GROUPS = [
  { value: 0, label: 'Child' },
  { value: 1, label: 'Adult' },
  { value: 2, label: 'Elderly' },
]

export default function ReportSymptomsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [locationData, setLocationData] = useState({
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || 'Telangana',
    latitude: null,
    longitude: null,
  })
  const [formData, setFormData] = useState({
    diarrhea: 0,
    vomiting: 0,
    fever: 0,
    abdominal_pain: 0,
    dehydration: 0,
    diarrhea_severity: 1,
    fever_severity: 1,
    water_source: 0,
    household_affected: 1,
    age_group: 1,
    symptom_duration: 1,
    turbidity: 0,
    ph: 7.0,
    nitrates: 0,
    dissolved_oxygen: 6.0,
    chlorophyll_a: 0,
    sulphates: 0,
    total_suspended_solids: 0,
  })

  const handleMapLocationSelect = (districtName, lat, lng) => {
    setSelectedDistrict(districtName)
    setLocationData(prev => ({
      ...prev,
      district: districtName,
      village: prev.village || districtName,
      latitude: lat,
      longitude: lng,
    }))
    toast.success(`📍 Location set to ${districtName}`)
  }

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : Number(value),
    })
  }

  const handleToggleSymptom = (name) => {
    setFormData({
      ...formData,
      [name]: formData[name] ? 0 : 1,
    })
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
    } else {
      toast.error('Speech not supported on this device')
    }
  }

  const predictRisk = async () => {
    setPredictionLoading(true)
    try {
      const payload = {
        diarrhea: formData.diarrhea,
        vomiting: formData.vomiting,
        fever: formData.fever,
        abdominal_pain: formData.abdominal_pain,
        dehydration: formData.dehydration,
        water_source: formData.water_source,
        household_affected: formData.household_affected,
        age_group: formData.age_group,
        symptom_duration: formData.symptom_duration,
        turbidity: formData.turbidity,
        ph: formData.ph,
        nitrates: formData.nitrates,
        dissolved_oxygen: formData.dissolved_oxygen,
        chlorophyll_a: formData.chlorophyll_a,
        sulphates: formData.sulphates,
        total_suspended_solids: formData.total_suspended_solids,
      }
      const response = await api.post('/predictions/predict', payload)
      setPrediction(response.data)
    } catch (error) {
      console.error('Prediction error:', error)
      toast.error('Unable to predict risk at this time')
    } finally {
      setPredictionLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/reports/submit', {
        // Location from GIS map or manual input
        village: locationData.village,
        district: locationData.district,
        state: locationData.state,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        // Symptoms
        diarrhea: formData.diarrhea,
        vomiting: formData.vomiting,
        fever: formData.fever,
        abdominal_pain: formData.abdominal_pain,
        dehydration: formData.dehydration,
        diarrhea_severity: formData.diarrhea_severity,
        fever_severity: formData.fever_severity,
        water_source: formData.water_source,
        household_affected: formData.household_affected,
        age_group: formData.age_group,
        symptom_duration: formData.symptom_duration,
        turbidity: formData.turbidity,
        ph: formData.ph,
        nitrates: formData.nitrates,
        dissolved_oxygen: formData.dissolved_oxygen,
        chlorophyll_a: formData.chlorophyll_a,
        sulphates: formData.sulphates,
        total_suspended_solids: formData.total_suspended_solids,
      })
      toast.success(response.data.message || 'Symptom report submitted')
      navigate('/villager')
    } catch (error) {
      console.error('Report submit error:', error)
      const errorMsg = error.response?.data?.error || 'Failed to submit report'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">🩺 Report Your Symptoms</h1>
            <p className="text-slate-600 mt-2">Submit a health report so the system can analyze outbreak risk for your area.</p>
          </div>
          <button
            type="button"
            onClick={() => speakText('Use this form to report symptoms and water conditions. Select the symptoms you are experiencing, then submit the report to help the system estimate outbreak risk.')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Volume2 className="w-4 h-4" />
            Listen to form guidance
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">

            {/* GIS Location Picker */}
            <div className="border border-emerald-200 rounded-2xl bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-900">📍 Select Your Location (GIS Map)</h3>
                {selectedDistrict && (
                  <span className="ml-auto px-3 py-1 bg-emerald-600 text-white text-xs rounded-full font-bold">
                    ✓ {selectedDistrict}
                  </span>
                )}
              </div>
              <p className="text-sm text-emerald-700 mb-3">
                Click on the map to select your district, or fill in the fields below manually.
              </p>
              {/* Map */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-emerald-300 shadow-sm mb-4">
                <MapContainer
                  center={[17.8, 79.0]}
                  zoom={7}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <ClickToLocate onLocationSelect={handleMapLocationSelect} />
                  {TELANGANA_DISTRICTS.map((d) => (
                    <CircleMarker
                      key={d.name}
                      center={d.coords}
                      radius={selectedDistrict === d.name ? 14 : 9}
                      pathOptions={{
                        color: selectedDistrict === d.name ? '#059669' : '#3b82f6',
                        fillColor: selectedDistrict === d.name ? '#10b981' : '#60a5fa',
                        fillOpacity: 0.8,
                        weight: selectedDistrict === d.name ? 3 : 2,
                      }}
                      eventHandlers={{
                        click: () => handleMapLocationSelect(d.name, d.coords[0], d.coords[1])
                      }}
                    >
                      <Popup>
                        <div className="text-sm font-semibold">{d.name}</div>
                        <div className="text-xs text-gray-500">Click to select</div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
              {/* Location text inputs */}
              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-800">Village / Area *</span>
                  <input
                    type="text"
                    placeholder="Enter village name"
                    value={locationData.village}
                    onChange={(e) => setLocationData(prev => ({ ...prev, village: e.target.value }))}
                    className="input-field w-full text-sm"
                    required
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-800">District *</span>
                  <input
                    type="text"
                    placeholder="Enter district"
                    value={locationData.district}
                    onChange={(e) => setLocationData(prev => ({ ...prev, district: e.target.value }))}
                    className="input-field w-full text-sm"
                    required
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-800">State</span>
                  <input
                    type="text"
                    placeholder="State"
                    value={locationData.state}
                    onChange={(e) => setLocationData(prev => ({ ...prev, state: e.target.value }))}
                    className="input-field w-full text-sm"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: 'diarrhea', label: 'Diarrhea' },
                { name: 'vomiting', label: 'Vomiting' },
                { name: 'fever', label: 'Fever' },
                { name: 'abdominal_pain', label: 'Abdominal Pain' },
                { name: 'dehydration', label: 'Dehydration' },
              ].map((symptom) => (
                <div
                  key={symptom.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggleSymptom(symptom.name)}
                  onKeyDown={(event) => event.key === 'Enter' && handleToggleSymptom(symptom.name)}
                  className={`rounded-2xl border p-4 text-left transition shadow-sm cursor-pointer ${formData[symptom.name] ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{symptom.label}</p>
                      <p className="text-xs text-slate-500 mt-1">Tap to mark whether you are experiencing {symptom.label.toLowerCase()}.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          speakText(`Tap this button if you are experiencing ${symptom.label}.`)
                        }}
                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                        title={`Listen to ${symptom.label} field description`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${formData[symptom.name] ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {formData[symptom.name] ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Diarrhea Severity</span>
                  <button
                    type="button"
                    onClick={() => speakText('Choose how severe your diarrhea symptoms are on a scale of one to five.')}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Listen to field description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  name="diarrhea_severity"
                  value={formData.diarrhea_severity}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Fever Severity</span>
                  <button
                    type="button"
                    onClick={() => speakText('Choose how severe your fever symptoms are on a scale of one to five.')}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Listen to field description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  name="fever_severity"
                  value={formData.fever_severity}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Water Source</span>
                  <button
                    type="button"
                    onClick={() => speakText('Select the water source used by your household.')}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Listen to field description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  name="water_source"
                  value={formData.water_source}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  {WATER_SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>{source.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Household Affected</span>
                  <button
                    type="button"
                    onClick={() => speakText('Enter the number of people in your household affected by these symptoms.')}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Listen to field description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="number"
                  name="household_affected"
                  value={formData.household_affected}
                  onChange={handleChange}
                  min="1"
                  className="input-field w-full"
                />
              </label>
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Age Group</span>
                  <button
                    type="button"
                    onClick={() => speakText('Choose the age group for the person reporting symptoms.')}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Listen to field description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  name="age_group"
                  value={formData.age_group}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  {AGE_GROUPS.map((group) => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Symptom Duration (days)</span>
                  <button
                    type="button"
                    onClick={() => speakText('Enter how many days you have been experiencing these symptoms.')}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Listen to field description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max="30"
                  name="symptom_duration"
                  value={formData.symptom_duration}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">Turbidity (NTU)</span>
                  <button
                    type="button"
                    onClick={() => speakText('Enter the water turbidity measurement if available.')}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                    title="Listen to field description"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="turbidity"
                  value={formData.turbidity}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">pH Level</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Dissolved Oxygen (mg/L)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="dissolved_oxygen"
                  value={formData.dissolved_oxygen}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Nitrates (mg/L)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="nitrates"
                  value={formData.nitrates}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Chlorophyll A (µg/L)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="chlorophyll_a"
                  value={formData.chlorophyll_a}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Sulfates (mg/L)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="sulphates"
                  value={formData.sulphates}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Total Suspended Solids (mg/L)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="total_suspended_solids"
                  value={formData.total_suspended_solids}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={predictRisk}
                disabled={predictionLoading}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {predictionLoading ? 'Predicting...' : 'Predict Risk'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

            {prediction && (() => {
              const advice = prediction.risk_level === 'High' ? {
                bg: 'bg-red-50 text-red-950 border-red-200',
                title: '🚨 CRITICAL SAFETY MEASURES:',
                items: [
                  'Avoid drinking water from tap/borewell/river without boiling first.',
                  'Boil drinking water for at least 5 minutes before consumption.',
                  'Contact your nearest ASHA Worker or Primary Health Centre (PHC) immediately.',
                  '📢 A high-risk alert has been dispatched to local health workers for ground verification.'
                ]
              } : prediction.risk_level === 'Medium' || prediction.risk_level === 'Moderate' ? {
                bg: 'bg-amber-50 text-amber-950 border-amber-200',
                title: '⚠️ PREVENTATIVE HEALTH GUIDANCE:',
                items: [
                  'Filter or boil water before drinking.',
                  'Avoid using open tank supplies for cooking.',
                  'Monitor other household members for symptom progression.'
                ]
              } : {
                bg: 'bg-green-50 text-green-950 border-green-200',
                title: '✅ STANDBY HEALTH TIPS:',
                items: [
                  'Maintain regular hygiene and hand washing protocols.',
                  'Store drinking water in closed, clean containers.',
                  'Safe to use municipal source with standard filtration.'
                ]
              };

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Predicted Outbreak Risk</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{prediction.risk_level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Confidence</p>
                      <p className="text-2xl font-bold text-slate-900">{(prediction.probability * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white border border-slate-200 p-4">
                      <p className="text-xs text-slate-500 uppercase">Low</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{(prediction.probabilities.low * 100).toFixed(1)}%</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 p-4">
                      <p className="text-xs text-slate-500 uppercase">Medium</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{(prediction.probabilities.medium * 100).toFixed(1)}%</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 p-4">
                      <p className="text-xs text-slate-500 uppercase">High</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{(prediction.probabilities.high * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Dynamic Recommendations */}
                  <div className={`p-4 border rounded-xl ${advice.bg} text-sm shadow-sm`}>
                    <p className="font-bold mb-2">{advice.title}</p>
                    <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs">
                      {advice.items.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </form>

          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-slate-900">Your registered location</p>
                  <p className="text-sm text-slate-600">{user?.village}, {user?.district}, {user?.state}</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Total reports in this system</p>
                  <p className="text-xl font-semibold text-slate-900">Tracked through symptom reports</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Submit symptoms</p>
                  <p className="text-xl font-semibold text-slate-900">Help the ML analytics detect outbreaks earlier</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3">
                <HeartPulse className="w-7 h-7" />
                <div>
                  <p className="text-lg font-bold">Report improves predictions</p>
                  <p className="text-sm opacity-90">Your health data improves outbreak detection and risk analysis for your region.</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                <li>• Accurate symptom reports feed analytics.</li>
                <li>• The backend uses ML to estimate outbreak risk.</li>
                <li>• Local water quality and symptoms are both used.</li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Droplet className="w-6 h-6 text-blue-600" />
                <p className="font-semibold text-slate-900">Water Source Guide</p>
              </div>
              <p className="text-sm text-slate-600">Choose the water source that best matches your household so the system can combine water quality and symptoms correctly.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
