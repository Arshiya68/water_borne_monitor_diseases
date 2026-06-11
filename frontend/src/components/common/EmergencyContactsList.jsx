import { Phone, ShieldAlert, HeartPulse, Droplet, UserCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function EmergencyContactsList() {
  const { user } = useAuth()

  // Dynamic details based on user location
  const isWarangal = user?.district === 'Warangal'
  
  const contacts = [
    {
      role: 'ASHA Worker',
      name: 'Priya Sharma',
      number: '9876543211',
      availability: '24/7 - Your Village Coordinator',
      icon: <UserCheck className="w-5 h-5 text-purple-600" />
    },
    {
      role: 'Primary Health Centre (PHC)',
      name: isWarangal ? 'Warangal Rural PHC' : 'Nalgonda Town PHC',
      number: '+91 9000 123 456',
      availability: '24/7 Emergency Ward',
      icon: <HeartPulse className="w-5 h-5 text-red-600" />
    },
    {
      role: 'District Health Officer (DHO)',
      name: 'Dr. Rao / Dr. Singh',
      number: '1075',
      availability: 'Official Epidemic Control',
      icon: <ShieldAlert className="w-5 h-5 text-blue-600" />
    },
    {
      role: 'Water Department Helpline',
      name: 'Municipal Safe Water Cell',
      number: '1916',
      availability: 'Contamination Reports / Tankers',
      icon: <Droplet className="w-5 h-5 text-cyan-600" />
    }
  ]

  const emergencyNumbers = [
    { label: '🚑 Ambulance', number: '108' },
    { label: '👮 Emergency Response', number: '112' }
  ]

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="border-b pb-4">
        <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <span>🚨 Emergency Contact Directory</span>
        </h4>
        <p className="text-xs text-slate-500 mt-1">Available 24/7 for immediate medical and water assistance.</p>
      </div>

      {/* Hotlines */}
      <div className="grid grid-cols-2 gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
        {emergencyNumbers.map((num, idx) => (
          <div key={idx} className="text-center bg-white border border-red-100 p-3 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">{num.label}</span>
            <a href={`tel:${num.number}`} className="text-2xl font-black text-red-600 block mt-1 hover:underline">
              {num.number}
            </a>
          </div>
        ))}
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {contacts.map((contact, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 transition hover:shadow-sm">
            <div className="p-2 bg-white rounded-lg border shadow-sm flex-shrink-0">
              {contact.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {contact.role}
              </span>
              <p className="font-bold text-slate-900 truncate text-sm mt-0.5">{contact.name}</p>
              <span className="text-[11px] text-slate-500 block">{contact.availability}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <a
                href={`tel:${contact.number}`}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100 font-bold text-xs"
                title={`Call ${contact.name}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
