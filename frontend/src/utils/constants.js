export const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'

export const ROLES = {
  VILLAGER: 'villager',
  ASHA_WORKER: 'asha_worker',
  OFFICIAL: 'official',
  ADMIN: 'admin',
}

export const SYMPTOMS = [
  { name: 'diarrhea', label: 'Diarrhea' },
  { name: 'vomiting', label: 'Vomiting' },
  { name: 'fever', label: 'Fever' },
  { name: 'abdominal_pain', label: 'Abdominal Pain' },
  { name: 'dehydration', label: 'Dehydration' },
]

export const WATER_SOURCES = {
  0: 'Tap Water',
  1: 'Borewell',
  2: 'River',
  3: 'Pond',
}

export const RISK_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
}