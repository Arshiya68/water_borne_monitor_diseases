import { useState, useEffect, useContext, createContext } from 'react'

const LanguageContext = createContext()

const translations = {
  en: {
    'home.title': 'Community-Based Early Warning System',
    'home.subtitle': 'Protecting communities from water-borne diseases through real-time monitoring',
    'dashboard.report_symptoms': 'Report Symptoms',
    'dashboard.view_alerts': 'View Alerts',
    'alert.new_cases': 'New Cases Reported',
    'alert.water_contamination': 'Water Contamination Alert',
    'button.submit': 'Submit',
    'button.cancel': 'Cancel',
    'common.loading': 'Loading...',
  },
  hi: {
    'home.title': 'जल-जनित रोग प्रारंभिक चेतावनी प्रणाली',
    'home.subtitle': 'वास्तविक समय निगरानी के माध्यम से समुदायों की सुरक्षा',
    'dashboard.report_symptoms': 'लक्षणों की रिपोर्ट करें',
    'dashboard.view_alerts': 'सतर्कताएं देखें',
    'alert.new_cases': 'नए मामलों की सूचना',
    'alert.water_contamination': 'जल संदूषण सतर्कता',
    'button.submit': 'जमा करें',
    'button.cancel': 'रद्द करें',
    'common.loading': 'लोड हो रहा है...',
  },
  te: {
    'home.title': 'సమాజం-ఆధారిత నీటి-జన్యుల వ్యాధుల ముందస్తు హెచ్చరిక వ్యవస్థ',
    'home.subtitle': 'రియల్-టైమ్ పర్యవేక్షణ ద్వారా సమాజాలను రక్షించడం',
    'dashboard.report_symptoms': 'రోగ లక్షణాలను నివేదించండి',
    'dashboard.view_alerts': 'హెచ్చరికలను చూడండి',
    'alert.new_cases': 'కొత్త కేసుల నివేదన',
    'alert.water_contamination': 'నీటి కలుషణ హెచ్చరిక',
    'button.submit': 'సమర్పించండి',
    'button.cancel': 'రద్దు చేయండి',
    'common.loading': 'లోడ్ చేస్తోంది...',
  },
  ur: {
    'home.title': 'کمیونٹی پر مبنی پانی سے پیدا ہونے والی بیماریوں کا ابتدائی انتباہ نظام',
    'home.subtitle': 'حقیقی وقت کی نگرانی کے ذریعے کمیونٹیز کی حفاظت',
    'dashboard.report_symptoms': 'علامات کی اطلاع دیں',
    'dashboard.view_alerts': 'الرتس دیکھیں',
    'alert.new_cases': 'نئے کیسوں کی اطلاع',
    'alert.water_contamination': 'پانی کی آلودگی کا الرٹ',
    'button.submit': 'جمع کریں',
    'button.cancel': 'منسوخ کریں',
    'common.loading': 'لوڈ ہو رہا ہے...',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const translate = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, translate }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-300 p-2">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-3 py-1 border-none font-medium text-slate-900 focus:outline-none bg-white cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="te">తెలుగు</option>
        <option value="ur">اردو</option>
      </select>
    </div>
  )
}
