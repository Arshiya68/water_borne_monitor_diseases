import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Droplet, User, Mail, Lock, Phone, MapPin, Volume2, AlertCircle } from 'lucide-react'

const TELANGANA_DISTRICTS = [
  "Hyderabad",
  "Ranga Reddy",
  "Medchal-Malkajgiri",
  "Nalgonda",
  "Warangal Urban",
  "Warangal Rural",
  "Vikarabad",
  "Karimnagar",
  "Rajahmundry",
  "Kakinada",
  "Nizamabad",
  "Kamareddy",
  "Adilabad",
  "Nirmal",
  "Khammam",
  "Mahbubnagar",
  "Nagarkurnool",
  "Wanaparthy",
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'villager',
    village: '',
    district: '',
    state: 'Telangana',
    age: '',
    gender: '',
    prefer_sms: true,
    prefer_email: true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  const validateStep1 = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '')
      if (cleanPhone.length !== 10) {
        newErrors.phone = 'Phone must be 10 digits'
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.district || formData.district.trim() === '') {
      newErrors.district = 'Please select your district'
    }

    if (!formData.village || formData.village.trim() === '') {
      newErrors.village = 'Please enter your village or locality'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    setLoading(true)

    try {
      console.log('Registering user with data:', formData)
      await register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        role: formData.role,
        village: formData.village.trim(),
        district: formData.district,
        state: formData.state,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        prefer_sms: formData.prefer_sms,
        prefer_email: formData.prefer_email,
      })
      toast.success('Registration successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      console.error('Registration error:', error)
      const errorMsg = error.response?.data?.error || 'Registration failed. Please try again.'
      setErrors({ submit: errorMsg })
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-xl mb-4">
            <Droplet className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-white">WaterGuard</h1>
          <p className="text-blue-200 text-sm mt-1">Join Our Community Health Network</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 mx-4 rounded transition-all ${
                step >= 2 ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Details */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Account Details</h2>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-field w-full pl-12 pr-12 py-3 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Your full name"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => speakText('Enter your full name')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition"
                      title="Listen to field description"
                    >
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field w-full pl-12 pr-12 py-3 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your@email.com"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => speakText('Enter your email address')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition"
                      title="Listen to field description"
                    >
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Phone Number - IMPORTANT */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span> (For SMS Alerts)
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input-field w-full pl-12 pr-12 py-3 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      inputMode="numeric"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => speakText('Enter your 10 digit phone number. This will be used to send health alerts and updates')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition"
                      title="Listen to field description"
                    >
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    📱 We will send health alerts and updates to this number
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field w-full pl-12 pr-12 py-3 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => speakText('Enter a password of at least 6 characters')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition"
                      title="Listen to field description"
                    >
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field w-full pl-12 pr-12 py-3 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => speakText('Confirm your password')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition"
                      title="Listen to field description"
                    >
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center space-x-2"
                >
                  <span>Next Step</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Step 2: Location & Preferences */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Location & Role</h2>

                {/* Select Role */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Your Role <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'villager', label: 'Villager', icon: '👨‍🌾' },
                      { value: 'asha_worker', label: 'ASHA Worker', icon: '👩‍⚕️' },
                      { value: 'official', label: 'Health Official', icon: '🏥' },
                      { value: 'admin', label: 'Admin', icon: '🛡️' },
                    ].map((roleOpt) => (
                      <button
                        key={roleOpt.value}
                        type="button"
                        disabled={roleOpt.disabled}
                        onClick={() => {
                          setFormData({ ...formData, role: roleOpt.value })
                          if (errors.role) {
                            setErrors({ ...errors, role: '' })
                          }
                        }}
                        className={`p-4 rounded-lg border-2 transition font-semibold text-sm ${
                          formData.role === roleOpt.value
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 hover:border-blue-300 text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-2">
                          <div className="text-2xl">{roleOpt.icon}</div>
                          <span>{roleOpt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="block text-sm font-semibold text-slate-700">Your Village / Locality <span className="text-red-500">*</span></span>
                      <input
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        className={`input-field w-full ${errors.village ? 'border-red-500' : ''}`}
                        placeholder="Enter your village or locality"
                      />
                      {errors.village && (
                        <p className="text-xs text-red-500 mt-1">{errors.village}</p>
                      )}
                    </label>

                    <label className="space-y-2">
                      <span className="block text-sm font-semibold text-slate-700">District <span className="text-red-500">*</span></span>
                      <div className="relative flex items-center">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none" />
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          className={`input-field w-full pl-12 pr-4 py-3 ${errors.district ? 'border-red-500' : ''}`}
                        >
                          <option value="">-- Select Your District --</option>
                          {TELANGANA_DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.district && (
                        <p className="text-xs text-red-500 mt-1">{errors.district}</p>
                      )}
                    </label>
                  </div>

                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="State"
                    disabled
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Your age"
                    min="0"
                    max="120"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender (Optional)
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>

                {/* Notification Preferences */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-slate-900 mb-3">📬 Notification Preferences</p>
                  <label className="flex items-center space-x-2 mb-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                    <input
                      type="checkbox"
                      name="prefer_sms"
                      checked={formData.prefer_sms}
                      onChange={handleChange}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-slate-700">
                      📱 Receive SMS alerts on <strong>{formData.phone || '[Phone]'}</strong>
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                    <input
                      type="checkbox"
                      name="prefer_email"
                      checked={formData.prefer_email}
                      onChange={handleChange}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-slate-700">
                      📧 Receive email alerts on <strong>{formData.email || '[Email]'}</strong>
                    </span>
                  </label>
                </div>

                {/* Error Messages */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                    {!loading && <span>✓</span>}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center border-t border-slate-200 pt-6">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}