import { AlertTriangle, TrendingUp, Cpu, HelpCircle, Layers, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getRiskPrediction } from '../../services/features'
import { useAuth } from '../../hooks/useAuth'

export default function RiskPredictionCard() {
  const { user } = useAuth()
  const [riskData, setRiskData] = useState({
    area: 'Your Area',
    level: 'Low',
    score: 25,
    factors: [
      { factor: 'Recent Cases', value: '0', status: 'low' },
      { factor: 'Water Quality', value: 'Good', status: 'good' },
      { factor: 'Rainfall', value: 'Normal', status: 'normal' },
    ],
    cases_7d: 0,
    cases_30d: 0,
    recommendations: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        if (user?.district) {
          const response = await getRiskPrediction(user.district)
          setRiskData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch risk data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [user?.district])

  const getRiskColors = (level) => {
    switch (level) {
      case 'High':
        return { badge: '🔴', color: 'bg-red-100 border-red-300 text-red-900 shadow-red-100', text: 'text-red-700' }
      case 'Moderate':
      case 'Medium':
        return { badge: '🟠', color: 'bg-amber-100 border-amber-300 text-amber-900 shadow-amber-100', text: 'text-amber-700' }
      case 'Low':
        return { badge: '🟢', color: 'bg-green-100 border-green-300 text-green-900 shadow-green-100', text: 'text-green-700' }
      default:
        return { badge: '⚪', color: 'bg-slate-100 border-slate-300 text-slate-900 shadow-slate-100', text: 'text-slate-700' }
    }
  }

  const colors = getRiskColors(riskData.level)

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      {loading ? (
        <div className="text-center py-8 bg-white border rounded-2xl shadow-sm">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Computing regional risk index...</p>
        </div>
      ) : (
        <div className={`rounded-2xl shadow-md border-2 p-8 ${colors.color} relative overflow-hidden transition`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Cpu className="w-32 h-32" />
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-5xl">{colors.badge}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-75">Regional Outbreak Risk</p>
                  <h3 className="text-3xl font-extrabold text-slate-900">{riskData.level}</h3>
                </div>
              </div>
              <p className="text-sm opacity-80 font-semibold mt-1">District: {riskData.area} Area</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border rounded-2xl p-4 text-center min-w-32 shadow-sm border-white">
              <p className="text-xs text-slate-500 font-bold uppercase">Risk Score</p>
              <div className="text-4xl font-extrabold text-slate-950 mt-1">{riskData.score}%</div>
              <p className="text-[10px] text-slate-400 mt-1">calculated weekly</p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-300/40 pt-4">
            <h4 className="text-sm font-bold uppercase opacity-85 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Risk Metrics Breakdown:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {riskData.factors.map((factor, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white/40 border border-white/60 rounded-xl text-sm">
                  <span className="opacity-80 text-slate-700 font-semibold">{factor.factor}</span>
                  <span className="font-extrabold text-slate-900">{factor.value}</span>
                </div>
              ))}
            </div>
          </div>

          {riskData.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-white/70 border border-white/60 rounded-xl text-sm">
              <p className="font-bold text-slate-900 mb-2">📋 Recommended Emergency Protocols:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-800 font-medium">
                {riskData.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Deep Dive ML Model Explanation */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-4">
          <Cpu className="text-purple-600 w-6 h-6 animate-pulse" />
          <span>Explainable AI (XAI) Model Architecture</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Explanation 1 */}
          <div className="space-y-4">
            <div>
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
                On What Basis is Risk Calculated?
              </h5>
              <p className="text-slate-600 leading-relaxed">
                The outbreak risk index represents a composite assessment evaluating municipal telemetry and active epidemiological reports in the district:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                <li><strong>Local Cases (40% weight):</strong> Weekly count of symptom reports flagged in the district.</li>
                <li><strong>Water Quality (30% weight):</strong> pH, turbidity, and chemical anomalies recorded in satellite/ground samples.</li>
                <li><strong>Outbreak Trend (30% weight):</strong> Case progression velocity over the past 30 days.</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Layers className="w-4.5 h-4.5 text-indigo-600" />
                The ML Classifier Framework
              </h5>
              <p className="text-slate-600 leading-relaxed">
                For individual symptom forms, WaterGuard runs a <strong>Gradient Boosting Classifier</strong> model. It maps the symptoms (Diarrhea, Vomiting, Fever, Abdominal Pain, Dehydration), symptom duration, household size, and local water parameters (pH, Nitrates, Turbidity, DO) against a historical dataset of 3,000+ regional records.
              </p>
            </div>
          </div>

          {/* Explanation 2 */}
          <div className="space-y-4">
            <div className="bg-slate-50 border rounded-2xl p-5 border-slate-200">
              <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4 text-purple-600" />
                Outbreak Classification Guide
              </h5>
              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="flex gap-2">
                  <span className="text-sm">🟢</span>
                  <div>
                    <p className="font-bold text-slate-900">Low Risk (&lt;50%)</p>
                    <p className="text-slate-500">Normal surveillance. Standard municipal safety precautions are sufficient.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm">🟠</span>
                  <div>
                    <p className="font-bold text-slate-900">Moderate Risk (50% - 69%)</p>
                    <p className="text-slate-500">Water purification testing is scheduled. Citizens are advised to boil municipal supply.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm">🔴</span>
                  <div>
                    <p className="font-bold text-slate-900">High Risk (&ge;70%)</p>
                    <p className="text-slate-500">Outbreak warning active. ASHA home verification campaigns and tanker distribution points are initialized.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-xs text-blue-900 leading-relaxed">
                <p className="font-bold mb-1">Interactive ML Integration</p>
                To generate a personalized health prediction, navigate to the <strong>Report Symptoms</strong> tab, fill out the symptom checkboxes, and click "Predict Risk" to get live confidence score estimations!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
