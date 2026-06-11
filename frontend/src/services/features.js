import api from './api'

// ===== WATER SOURCES =====
export const getWaterSources = (village, district) => {
  let url = '/water-sources/list'
  const params = []
  if (village) params.push(`village=${village}`)
  if (district) params.push(`district=${district}`)
  if (params.length > 0) url += '?' + params.join('&')
  return api.get(url)
}

export const getWaterSourceById = (id) => {
  return api.get(`/water-sources/${id}`)
}

export const addWaterSource = (data) => {
  return api.post('/water-sources/add', data)
}

export const updateWaterSourceStatus = (id, data) => {
  return api.post(`/water-sources/${id}/update-status`, data)
}

export const getDistrictWaterStatus = (district) => {
  return api.get(`/water-sources/status/${district}`)
}

export const getCriticalWaterSources = () => {
  return api.get('/water-sources/critical')
}

// ===== EMERGENCY LOCATIONS =====
export const getHospitals = (district) => {
  return api.get(`/emergency/hospitals/${district}`)
}

export const getNearestHospital = (lat, lon, district) => {
  return api.get(`/emergency/nearest-hospital?lat=${lat}&lon=${lon}&district=${district}`)
}

export const getWaterDistributionPoints = (district) => {
  return api.get(`/emergency/water-distribution/${district}`)
}

export const getHealthClinics = (district) => {
  return api.get(`/emergency/health-clinics/${district}`)
}

export const getEmergencyContacts = () => {
  return api.get('/emergency/emergency-contacts')
}

export const addEmergencyLocation = (data) => {
  return api.post('/emergency/add', data)
}

// ===== COMMUNITY ENGAGEMENT =====
export const getCommunityEngagement = (district) => {
  return api.get(`/community/engagement/${district}`)
}

export const getTopContributors = (district, limit = 10) => {
  return api.get(`/community/top-contributors/${district}?limit=${limit}`)
}

export const getParticipationScore = (district) => {
  return api.get(`/community/participation-score/${district}`)
}

export const updateEngagementMetrics = (district, data) => {
  return api.post(`/community/update-engagement/${district}`, data)
}

export const getHealthWorkers = (district) => {
  return api.get(`/community/health-workers/${district}`)
}

// ===== RISK PREDICTION =====
export const getRiskPrediction = (district) => {
  return api.get(`/risk/${district}`)
}

export const getAllDistrictRisks = () => {
  return api.get('/risk/all')
}

// ===== SMS ALERTS =====
export const sendSmsAlert = (data) => {
  return api.post('/sms/send-alert', data)
}

export const getSmsHistory = (limit = 20) => {
  return api.get(`/sms/history?limit=${limit}`)
}

export const getSmsStatistics = () => {
  return api.get('/sms/statistics')
}

export const getSmsTemplates = () => {
  return api.get('/sms/templates')
}

export const sendBulkSms = (userIds, message) => {
  return api.post('/sms/send-bulk', {
    user_ids: userIds,
    message: message,
  })
}

// ===== ALERTS (ENHANCED) =====
export const triggerAlert = (data) => {
  return api.post('/alerts/trigger', data)
}

export const getAlerts = () => {
  return api.get('/alerts')
}
