import { Hospital, Phone, MapPin, AlertTriangle, Clock } from 'lucide-react'

export default function EmergencyResponseModule() {
  const nearestHospital = {
    name: 'District Government Hospital',
    distance: 2.3,
    time: '8 mins',
    address: 'Hospital Rd, Ward 2',
    phone: '+91 9876 543 210',
    services: ['Emergency', '24/7 OPD', 'Pathology', 'Water-borne Diseases'],
    availability: 'Open Now',
    beds: 'Available',
  }

  const waterDistributionPoints = [
    {
      id: 1,
      name: 'Tanker Distribution Point 1',
      location: 'Ward 1 - Main Square',
      distance: 0.5,
      time: '2 mins',
      availability: '09:00 - 18:00',
      capacity: '5000 L',
    },
    {
      id: 2,
      name: 'Water Distribution Center',
      location: 'Ward 2 - Community Hall',
      distance: 1.2,
      time: '5 mins',
      availability: '08:00 - 20:00',
      capacity: '10000 L',
    },
    {
      id: 3,
      name: 'Relief Camp Distribution',
      location: 'Ward 3 - School Ground',
      distance: 0.8,
      time: '3 mins',
      availability: '24/7 Emergency',
      capacity: 'Unlimited',
    },
  ]

  const emergencyNumbers = [
    { service: 'Ambulance', number: '102', availability: '24/7' },
    { service: 'Health Helpline', number: '+91 9000 123 456', availability: '24/7' },
    { service: 'District Hospital', number: '+91 9876 543 210', availability: '24/7' },
    { service: 'Poison Control', number: '+91 9700 123 456', availability: 'On Call' },
  ]

  const emergencyChecklist = [
    { step: 1, action: 'Stay calm and keep the patient hydrated', status: 'important' },
    { step: 2, action: 'Note symptoms: diarrhea, vomiting, fever', status: 'important' },
    { step: 3, action: 'Do NOT self-medicate without consulting doctor', status: 'warning' },
    { step: 4, action: 'Call ambulance or go to nearest hospital', status: 'critical' },
    { step: 5, action: 'Inform doctor about water source used', status: 'important' },
    { step: 6, action: 'Keep the patient isolated if infectious', status: 'important' },
  ]

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <span>Emergency Response Module</span>
        </h3>
        <p className="text-slate-600">Immediate assistance during health emergencies</p>
      </div>

      {/* Emergency Numbers Quick Access */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h4 className="font-bold text-red-900 mb-4">📱 Quick Emergency Contacts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyNumbers.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border-2 border-red-200 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.service}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.availability}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{item.number}</p>
                  <button className="text-xs text-blue-600 font-bold hover:underline mt-1">Call Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearest Hospital */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <Hospital className="w-8 h-8 text-blue-600 mt-1" />
            <div>
              <h4 className="text-xl font-bold text-slate-900">{nearestHospital.name}</h4>
              <p className="text-slate-600 flex items-center space-x-1 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{nearestHospital.address}</span>
              </p>
            </div>
          </div>
          <div className="text-right bg-white rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-slate-600">Distance</p>
            <p className="text-3xl font-bold text-blue-600">{nearestHospital.distance} km</p>
            <p className="text-sm text-slate-600 mt-1">~{nearestHospital.time}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
            <p className="text-xs text-slate-600 font-medium mb-2">Status</p>
            <p className="text-lg font-bold text-green-600">✅ {nearestHospital.availability}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
            <p className="text-xs text-slate-600 font-medium mb-2">Beds</p>
            <p className="text-lg font-bold text-green-600">✅ {nearestHospital.beds}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
            <p className="text-xs text-slate-600 font-medium mb-2">Contact</p>
            <p className="font-bold text-blue-600">{nearestHospital.phone}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
            <p className="text-xs text-slate-600 font-medium mb-2">Call</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition">
              📞 Call Now
            </button>
          </div>
        </div>

        <div>
          <p className="font-bold text-slate-900 mb-2">Services Available:</p>
          <div className="flex flex-wrap gap-2">
            {nearestHospital.services.map((service, idx) => (
              <span key={idx} className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm font-medium">
                ✓ {service}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Safe Water Distribution Points */}
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Droplet className="w-5 h-5 text-blue-600" />
          <span>Nearest Safe Water Distribution Points</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {waterDistributionPoints.map((point) => (
            <div key={point.id} className="bg-green-50 border-2 border-green-300 rounded-lg p-5 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-bold text-slate-900">{point.name}</h5>
                  <p className="text-sm text-slate-600 flex items-center space-x-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{point.location}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Distance</span>
                  <span className="font-bold">{point.distance} km ({point.time})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hours</span>
                  <span className="font-bold">{point.availability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Capacity</span>
                  <span className="font-bold">{point.capacity}</span>
                </div>
              </div>
              <button className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition text-sm">
                Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Checklist */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h4 className="font-bold text-yellow-900 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>What to Do in Case of Emergency</span>
        </h4>
        <div className="space-y-3">
          {emergencyChecklist.map((item) => (
            <div
              key={item.step}
              className={`flex items-start space-x-4 p-4 rounded-lg ${
                item.status === 'critical'
                  ? 'bg-red-100 border-2 border-red-400'
                  : item.status === 'warning'
                  ? 'bg-orange-100 border-2 border-orange-400'
                  : 'bg-white border-2 border-yellow-200'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                item.status === 'critical'
                  ? 'bg-red-600'
                  : item.status === 'warning'
                  ? 'bg-orange-600'
                  : 'bg-green-600'
              }`}>
                {item.step}
              </div>
              <p className="font-medium text-slate-900">{item.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <p className="text-purple-900 font-medium">
          ⚠️ In life-threatening situations, always call the ambulance first (102) before any other action. Every minute counts in medical emergencies.
        </p>
      </div>
    </div>
  )
}

// Import Droplet icon
import { Droplet } from 'lucide-react'
