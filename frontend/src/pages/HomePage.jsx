import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { useAuth } from '../hooks/useAuth'
import { 
  AlertTriangle, 
  Activity, 
  Shield, 
  Droplet, 
  Bell, 
  Users, 
  ArrowRight, 
  Sparkles, 
  ClipboardList, 
  PhoneCall, 
  Map
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const workflowSteps = [
    {
      step: '01',
      title: 'Crowdsourced Logging',
      description: 'Villagers, citizens, and field workers log localized symptoms and water anomalies directly from their phones.',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      step: '02',
      title: 'ML Risk Analysis',
      description: 'The system correlates symptom reports with local water quality parameters (pH, Turbidity, DO) using our optimized ML model.',
      icon: <Activity className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      step: '03',
      title: 'Cluster Detection',
      description: 'If 3+ symptomatic reports occur in the same village or district within 7 days, an automatic cluster warning is triggered.',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      step: '04',
      title: 'Distributed Broadcast',
      description: 'Critical warnings and preventive guidelines are broadcasted to villagers, ASHA networks, and officials via SMS and dashboards.',
      icon: <Bell className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    }
  ]

  const sampleAlerts = [
    {
      id: 1,
      type: 'Cluster Warning',
      location: 'Nalgonda District',
      message: '⚠️ AUTOMATIC OUTBREAK WARNING: Cluster of 4 cases detected in Nalgonda in the last 7 days. Possible outbreak risk. Please boil water and notify ASHA workers.',
      time: 'Just now',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 2,
      type: 'Water Contamination',
      location: 'Hyderabad - Ward 3',
      message: '⚠️ AUTOMATIC WARNING: Suspicious water quality reports with high Turbidity and low pH in Ward 3. Avoid raw drinking water.',
      time: '4 hours ago',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ]

  const getDashboardLink = () => {
    if (!user) return '/login'
    const roleMap = {
      villager: '/villager',
      asha_worker: '/asha',
      official: '/official',
      admin: '/admin'
    }
    return roleMap[user.role] || '/login'
  }

  const getRoleLabel = (role) => {
    const labels = {
      villager: 'Citizen / Villager',
      asha_worker: 'ASHA Field Worker',
      official: 'Health Official',
      admin: 'System Admin'
    }
    return labels[role] || role
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/70 via-slate-50 to-slate-50 border-b border-slate-200/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 text-sm mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>AI-Optimized Early Warning System Active</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-emerald-600 to-cyan-600 mb-6 leading-tight">
            Community-Based Early Warning System <br className="hidden sm:inline" />
            for Water-Borne Outbreaks
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-650 font-medium mb-8 leading-relaxed">
            Can this system identify early signs of a water-borne disease outbreak and warn people before it becomes serious?
            <span className="block mt-2 text-emerald-600 font-semibold">Yes. By analyzing crowdsourced symptoms and physical water parameters, we catch threats at the source.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <button
                onClick={() => navigate(getDashboardLink())}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-emerald-500/10 transition duration-300 flex items-center space-x-2 group w-full sm:w-auto justify-center"
              >
                <span>Access Dashboard ({getRoleLabel(user.role)})</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition duration-300 w-full sm:w-auto justify-center"
                >
                  Join Surveillance Network
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl transition duration-300 w-full sm:w-auto justify-center shadow-sm"
                >
                  Sign In
                </button>
              </>
            )}
            <button
              onClick={() => navigate(user ? '/map' : '/login')}
              className="px-8 py-4 bg-transparent hover:bg-slate-100 text-blue-600 font-bold rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <Map className="w-5 h-5" />
              <span>Track Outbreak Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              The Outbreak Surveillance Workflow
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Our 4-step proactive pipeline continuously evaluates regional risk and issues distributed containment directives automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((item, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-2xl border ${item.border} bg-slate-50/50 p-6 flex flex-col hover:border-slate-300 hover:shadow-md transition duration-300`}
              >
                <div className="absolute top-4 right-4 text-slate-200 text-3xl font-extrabold">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Warning Monitoring Log */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center space-x-2 text-rose-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-wider text-xs">Live Early Warning Logs</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Automated Trigger Auditing</h3>
                <p className="text-slate-500 text-sm mt-1">
                  How system-wide rules auto-escalate reports to high-priority community containment directives.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs text-slate-500 font-semibold uppercase">EWS Monitoring Live</span>
              </div>
            </div>

            <div className="space-y-4">
              {sampleAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-slate-350 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${alert.badgeColor}`}>
                        {alert.type}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">📍 {alert.location}</span>
                    </div>
                    <span className="text-xs text-slate-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-mono bg-white p-3 rounded border border-slate-200/50">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
              <span>Cluster Rule Threshold: &ge; 3 reports / 7 days</span>
              <span>Model: Optimized Gradient Boosting Classifier</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific Entry Points */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Join the Outbreak Response</h3>
            <p className="text-slate-500 text-sm mt-2">Roles are structured for unified village surveillance and containment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Villager / Citizen</h4>
                <p className="text-xs text-slate-650 leading-relaxed mb-6">
                  Report gastrointestinal issues, suspect water clarity/leaks, receive local emergency containment alerts, and view safe water guidelines.
                </p>
              </div>
              <button 
                onClick={() => navigate('/villager')}
                className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-100 transition"
              >
                Villager Dashboard
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 mb-4">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">ASHA Field Worker</h4>
                <p className="text-xs text-slate-650 leading-relaxed mb-6">
                  Verify community-logged symptoms, refer high-risk villagers to Primary Health Centres (PHC), log home visits, and coordinate local warning actions.
                </p>
              </div>
              <button 
                onClick={() => navigate('/asha')}
                className="w-full py-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-100 transition"
              >
                ASHA Dashboard
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Health Official</h4>
                <p className="text-xs text-slate-650 leading-relaxed mb-6">
                  Review district-wide symptom metrics, analyze live GIS hotspot mapping, track model predictions, and broadcast manual emergency alerts via SMS.
                </p>
              </div>
              <button 
                onClick={() => navigate('/official')}
                className="w-full py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-100 transition"
              >
                Official Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-slate-50 text-center text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 WaterGuard Platform. All rights reserved.</span>
          <span className="flex items-center space-x-1 text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Community-Based Outbreak Early Warning Protocol</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
