import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Droplet, LogIn, AlertCircle, Volume2, Cpu, Shield, Activity } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try {
      console.log('Attempting login with:', email)
      await login(email, password)
      toast.success('Login successful!')
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.'
      setError(errorMsg)
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
      <div className="absolute top-10 left-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

      <div className="max-w-6xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Info Column */}
        <div className="text-white p-6 lg:p-12 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-xl mb-6">
            <Droplet className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">WaterGuard</h1>
          <p className="text-xl text-blue-200 mb-8">Protecting Communities with AI</p>
          
          <button
            onClick={() => speakText("WaterGuard is a digital health assistant. When someone reports feeling sick from water, we use a Gradient Boosting Machine Learning Model to predict outbreaks. This Artificial Intelligence sends instant SMS alerts to your phone so you can boil water and stay safe!")}
            className="mb-8 flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Listen to what this is</span>
          </button>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-lg"><Activity className="w-6 h-6 text-blue-300" /></div>
              <div>
                <h3 className="font-bold text-lg">Early Warning System</h3>
                <p className="text-blue-100/80 text-sm mt-1">We track symptoms like diarrhea and fever in your village to spot diseases early before they spread.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg"><Cpu className="w-6 h-6 text-emerald-300" /></div>
              <div>
                <h3 className="font-bold text-lg">Machine Learning Magic</h3>
                <p className="text-blue-100/80 text-sm mt-1">Our system uses a <strong>Gradient Boosting ML Model</strong>. It learns from thousands of past records, water quality data, and symptoms to predict the risk of diseases like Cholera instantly.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 p-3 rounded-lg"><Shield className="w-6 h-6 text-purple-300" /></div>
              <div>
                <h3 className="font-bold text-lg">Keeping You Safe</h3>
                <p className="text-blue-100/80 text-sm mt-1">If the AI detects high risk, it automatically sends SMS alerts directly to your mobile phone so you can take action (like boiling water).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card Column */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
          <p className="text-slate-500 mb-8">Access your dashboard to view localized alerts.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition"
            >
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-slate-600 text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold">
                Create one
              </Link>
            </p>
          </div>

          {/* Demo Info */}
          <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-900 mb-2">🔐 Secure Login</p>
            <p className="text-xs text-slate-600">Use your registered email and password. Each user can sign in with their own credentials after registration.</p>
          </div>
        </div>
      </div>
    </div>
  )
}