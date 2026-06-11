import { BookOpen, Droplet, Heart, AlertCircle } from 'lucide-react'

export default function HealthEducationCenter() {
  const educationCards = [
    {
      id: 1,
      disease: 'Prevent Cholera',
      icon: '🫗',
      tips: ['Boil water before drinking', 'Wash hands with soap and water', 'Use clean containers for storing water', 'Avoid street food and raw vegetables'],
      color: 'bg-blue-50 border-blue-300',
    },
    {
      id: 2,
      disease: 'Prevent Typhoid',
      icon: '🌡️',
      tips: ['Avoid contaminated food', 'Drink purified water only', 'Maintain proper hygiene', 'Cook food at safe temperatures'],
      color: 'bg-orange-50 border-orange-300',
    },
    {
      id: 3,
      disease: 'Prevent Diarrhea',
      icon: '🚫',
      tips: ['Drink clean water', 'Wash hands frequently', 'Use clean utensils', 'Store food properly in cool places'],
      color: 'bg-yellow-50 border-yellow-300',
    },
    {
      id: 4,
      disease: 'General Water Safety',
      icon: '💧',
      tips: ['Store water in clean containers', 'Cover water containers', 'Inspect local water sources', 'Report contaminated water sources'],
      color: 'bg-green-50 border-green-300',
    },
  ]

  const quickTips = [
    { emoji: '🧼', tip: 'Wash hands after using toilet and before eating' },
    { emoji: '💦', tip: 'Boil water for 5 minutes to kill harmful bacteria' },
    { emoji: '🍲', tip: 'Cook food thoroughly to prevent infections' },
    { emoji: '🧊', tip: 'Use ice made from purified water only' },
    { emoji: '👶', tip: 'Give children clean water and nutritious food' },
    { emoji: '📞', tip: 'Seek medical help immediately if symptoms appear' },
  ]

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2 mb-2">
          <BookOpen className="w-6 h-6 text-green-600" />
          <span>Health Education Center</span>
        </h3>
        <p className="text-slate-600">Learn how to prevent water-borne diseases in your community</p>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300 p-6">
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <span className="text-2xl">🧼</span>
          <span>Quick Safety Tips</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTips.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 bg-white rounded-lg p-4">
              <span className="text-2xl flex-shrink-0">{item.emoji}</span>
              <p className="text-sm font-medium text-slate-800">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disease Prevention Cards */}
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-4">Disease Prevention Guides</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationCards.map((card) => (
            <div key={card.id} className={`rounded-lg border-2 ${card.color} p-6`}>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl">{card.icon}</span>
                <h5 className="text-lg font-bold text-slate-900">{card.disease}</h5>
              </div>
              <ul className="space-y-3">
                {card.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-lg mt-1">✓</span>
                    <span className="text-slate-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center space-x-2">
          <Heart className="w-5 h-5" />
          <span>When to Seek Medical Help</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-red-900 mb-2">⚠️ Immediate Symptoms:</p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Severe dehydration</li>
              <li>• Blood in stool</li>
              <li>• High fever (above 102°F)</li>
              <li>• Persistent vomiting</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-red-900 mb-2">🏥 Visit Clinic If:</p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Symptoms persist for 3+ days</li>
              <li>• Affects children or elderly</li>
              <li>• Multiple family members affected</li>
              <li>• Symptoms are worsening</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Myth Busting */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h4 className="text-lg font-bold text-purple-900 mb-4">❌ Common Myths About Water Safety</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 bg-white rounded-lg p-4">
            <span className="text-2xl">🚫</span>
            <div>
              <p className="font-bold text-purple-900">Myth: Well water is always safe</p>
              <p className="text-sm text-purple-800">Truth: Well water can also be contaminated. Always test and boil it before drinking.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-white rounded-lg p-4">
            <span className="text-2xl">🚫</span>
            <div>
              <p className="font-bold text-purple-900">Myth: Boiling removes all bacteria</p>
              <p className="text-sm text-purple-800">Truth: Boiling kills most bacteria, but combining with storage in clean containers is best.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-white rounded-lg p-4">
            <span className="text-2xl">🚫</span>
            <div>
              <p className="font-bold text-purple-900">Myth: Children get natural immunity quickly</p>
              <p className="text-sm text-purple-800">Truth: Children are more vulnerable. Always give them safe water and clean food.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
