import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import CompanyLogo from '../../components/shared/CompanyLogo'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (!user?.is_admin) {
        toast.error('Not an admin account')
        return
      }
      toast.success('Welcome back!')
      navigate('/admin/dashboard')
    } catch(err) {
      toast.error(err.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CompanyLogo className="h-32 w-auto mx-auto rounded bg-white/95 mb-4 shadow-lg" />
          <p className="text-navy-200 text-sm mt-1">Trading Portal Control Panel</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-heading font-bold text-gray-900 mb-6">Sign in to Admin</h2>
          <form onSubmit={handle} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                  className="input-field pl-9" placeholder="Enter your email" autoComplete="new-email" required/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                  className="input-field pl-9" placeholder="••••••••" autoComplete="new-password" required/>
                <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-secondary w-full mt-2">
              {loading?'Signing in…':'Sign In'}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-6">
            Admin access only. <Link to="/" className="text-accent hover:underline">Go to store</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
