import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { BarChart3, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      await login(data)
      navigate('/')
    } catch {
      // error set in store
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <BarChart3 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VAF Platform</h1>
            <p className="text-sm text-gray-500">Visual Analytics Framework</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700 flex justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="font-semibold">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
