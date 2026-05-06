import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Bienvenue !')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream flex">

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-dark relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
          alt="Restaurant"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 flex flex-col justify-center items-center px-16 text-center">
          <img
            src="/images/wenam-logo.png" alt="Wenam" style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 24, display: 'block', margin: '0 auto 24px', mixBlendMode: 'screen' }}
          />
          <h1 className="font-display text-5xl font-bold text-white mb-4">Wênam</h1>
          <p className="font-display text-xl italic" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Cuisine africaine façon Bénin : du cœur à l'assiette
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Logo mobile */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src="/images/wenam-logo.png" alt="Wenam" style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', margin: '0 auto 12px', mixBlendMode: 'multiply' }}
            />
            <h2
              className="font-display lg:hidden"
              style={{ fontSize: 22, fontWeight: 700, color: '#C4531A', marginBottom: 4 }}
            >
              Wênam
            </h2>
            <p style={{ fontSize: 11, color: '#C4531A', fontStyle: 'italic' }}>
              Cuisine africaine façon Bénin
            </p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(22px,5vw,30px)', fontWeight: 700, marginBottom: 6 }}>
              Bon retour !
            </h1>
            <p style={{ fontSize: 13, color: '#8B6B3D' }}>Connectez-vous pour commander</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                  className="input"
                  style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{ paddingLeft: 36, paddingRight: 40, width: '100%', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B6B3D', padding: 0 }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', marginTop: 4 }}
            >
              {loading && (
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8B6B3D' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#C4531A', fontWeight: 600, textDecoration: 'none' }}>
              S'inscrire
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
