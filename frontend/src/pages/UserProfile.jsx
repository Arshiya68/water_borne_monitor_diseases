import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/common/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Edit2, Save, X, Check } from 'lucide-react'

const TELANGANA_DISTRICTS = [
  "Hyderabad", "Ranga Reddy", "Medchal-Malkajgiri", "Nalgonda",
  "Warangal Urban", "Warangal Rural", "Vikarabad", "Karimnagar",
  "Rajahmundry", "Kakinada", "Nizamabad", "Kamareddy",
  "Adilabad", "Nirmal", "Khammam", "Mahbubnagar",
  "Nagarkurnool", "Wanaparthy",
]

export default function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        village: user.village || '',
        district: user.district || '',
        age: user.age || '',
        gender: user.gender || '',
        prefer_sms: user.prefer_sms !== false,
        prefer_email: user.prefer_email !== false,
      })
      setLoading(false)
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/profile/update', formData)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      villager: { label: 'Villager', color: 'bg-blue-100 text-blue-800', icon: '👨‍🌾' },
      asha_worker: { label: 'ASHA Worker', color: 'bg-purple-100 text-purple-800', icon: '👩‍⚕️' },
      official: { label: 'Health Official', color: 'bg-green-100 text-green-800', icon: '🏥' },
      admin: { label: 'Admin', color: 'bg-slate-100 text-slate-800', icon: '🛡️' },
    }
    return badges[user.role] || badges.villager
  }

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-12">Loading profile...</div>
      </div>
    )
  }

  const badge = getRoleBadge(user.role)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
          <button
            onClick={() => {
              if (isEditing) {
                setFormData({
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  village: user.village,
                  district: user.district,
                  age: user.age || '',
                  gender: user.gender || '',
                  prefer_sms: user.prefer_sms !== false,
                  prefer_email: user.prefer_email !== false,
                })
              }
              setIsEditing(!isEditing)
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              isEditing
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit2 className="w-5 h-5" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                {badge.icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-4">{user.name}</h2>
              <span className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-bold ${badge.color}`}>
                {badge.label}
              </span>
              <p className="text-slate-600 mt-4 text-sm">
                Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h3>

              {!isEditing ? (
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="text-lg text-slate-900">{user.name}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="text-lg text-slate-900">{user.email}</span>
                      </div>
                      {user.prefer_email && <Check className="w-5 h-5 text-green-600" />}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="text-lg text-slate-900">{user.phone}</span>
                      </div>
                      {user.prefer_sms && <Check className="w-5 h-5 text-green-600" />}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Location</label>
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-lg text-slate-900">
                        {user.district}, {user.state}
                      </span>
                    </div>
                  </div>

                  {/* Age */}
                  {user.age && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Age</label>
                      <p className="text-lg text-slate-900 p-3 bg-slate-50 rounded-lg">{user.age} years</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      maxLength="10"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select District</option>
                      {TELANGANA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      min="0"
                      max="120"
                    />
                  </div>

                  {/* Notifications */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-slate-900 mb-3">📬 Notification Preferences</p>
                    <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="prefer_sms"
                        checked={formData.prefer_sms}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">📱 Receive SMS alerts</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="prefer_email"
                        checked={formData.prefer_email}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">📧 Receive email alerts</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}