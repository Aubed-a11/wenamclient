import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      const dismissed = sessionStorage.getItem('pwa-dismissed')
      if (!dismissed) setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setVisible(false) })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setVisible(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1')
    setVisible(false)
  }

  if (!visible || installed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9999,
      background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(26,15,0,0.18)',
      border: '1.5px solid #EDE0C4', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp 0.35s ease',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      <img src="/images/wenam-logo.png" alt="Wenam"
        style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0, mixBlendMode: 'multiply' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1A0F00', fontFamily: "'Playfair Display',serif" }}>
          Wênam
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#8B6B3D' }}>
          Ajouter à l'écran d'accueil
        </p>
      </div>

      <button onClick={handleInstall} style={{
        background: '#C4531A', color: '#fff', border: 'none', borderRadius: 10,
        padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
      }}>
        Installer
      </button>

      <button onClick={handleDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0,
      }}>
        <X size={16} color="#8B6B3D" />
      </button>
    </div>
  )
}
