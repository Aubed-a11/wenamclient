import { Edit2, LogOut, Package, Save, Star, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import { useAuthStore } from '../../store'

const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', preparing:'En préparation', out_for_delivery:'En route', delivered:'Livré', cancelled:'Annulée' }
const STATUS_COLORS = { pending:'bg-amber-100 text-amber-700', confirmed:'bg-blue-100 text-blue-700', preparing:'bg-orange-100 text-orange-700', out_for_delivery:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' }

const css = `
  .profile-layout { display: flex; flex-direction: column; gap: 20px; }
  @media (min-width: 640px) { .profile-layout { flex-direction: row; gap: 24px; } }
  .profile-sidebar { width: 100%; }
  @media (min-width: 640px) { .profile-sidebar { width: 220px; flex-shrink: 0; } }

  /* Tabs: horizontal scroll on mobile */
  .tab-list { display: flex; flex-direction: column; gap: 4px; }
  @media (max-width: 639px) {
    .tab-list { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
    .tab-list::-webkit-scrollbar { display: none; }
    .tab-btn { white-space: nowrap; flex-shrink: 0; padding: 10px 16px !important; min-height: 44px; }
    .sidebar-user { display: none; }
  }

  /* Orders: stack on mobile */
  .order-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; border: 1px solid #e5e7eb; gap: 8px; flex-wrap: wrap; }
  .order-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .order-num { font-size: 14px; font-weight: 600; margin: 0; word-break: break-word; }
  @media (max-width: 480px) {
    .order-row { padding: 10px 12px; }
    .order-meta { gap: 6px; }
    .order-track { font-size: 11px !important; padding: 4px 8px; background: rgba(196,83,26,0.08); border-radius: 6px; }
  }

  .profile-card { background: #fff; border-radius: 20px; border: 1px solid #e5e7eb; box-shadow: 0 2px 12px rgba(0,0,0,0.06); padding: 20px; }
  @media (min-width: 640px) { .profile-card { padding: 24px; } }
`

export default function ProfilePage() {
  const [tab, setTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [editing, setEditing] = useState(false)
  const { user, logout, updateProfile } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', street: user?.address?.street||'', city: user?.address?.city||'' })
  const navigate = useNavigate()

  useEffect(() => {
    if (tab === 'orders' && orders.length === 0) {
      api.get('/orders/my').then(({data}) => setOrders(data.orders || [])).catch(() => {})
    }
  }, [tab])

  const handleSave = async () => {
    try {
      await updateProfile({ name: form.name, phone: form.phone, address: { street: form.street, city: form.city } })
      toast.success('Profil mis à jour !'); setEditing(false)
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  const handleLogout = async () => { await logout(); navigate('/') }

  const TABS = [['profile','Mon profil',User],['orders','Mes commandes',Package],['reviews','Mes avis',Star]]

  return (
    <div className="min-h-screen bg-cream">
      <style>{css}</style>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        <div className="profile-layout">

          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              {/* User info — hidden on mobile */}
              <div className="sidebar-user" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, padding:'4px 4px' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(196,83,26,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C4531A', fontWeight:700, fontSize:18, flexShrink:0 }}>
                  {user?.name?.[0]}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:13, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
                  <p style={{ fontSize:11, color:'#8B6B3D', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
                </div>
              </div>

              <div className="tab-list">
                {TABS.map(([key,label,Icon])=>(
                  <button key={key} onClick={()=>setTab(key)} className="tab-btn"
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s', background: tab===key ? '#C4531A' : 'transparent', color: tab===key ? '#fff' : '#5C3D11', width:'100%', textAlign:'left' }}>
                    <Icon size={15} />{label}
                  </button>
                ))}
                <button onClick={handleLogout}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background:'transparent', color:'#ef4444', marginTop:4, width:'100%', textAlign:'left' }}>
                  <LogOut size={15} />Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* Profile tab */}
            {tab === 'profile' && (
              <div className="profile-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:8 }}>
                  <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, margin:0 }}>Mon profil</h2>
                  {!editing ? (
                    <button onClick={()=>setEditing(true)} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#C4531A', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      <Edit2 size={13} />Modifier
                    </button>
                  ) : (
                    <button onClick={handleSave} className="btn-primary" style={{ padding:'6px 16px', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                      <Save size={13} />Sauvegarder
                    </button>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[['Nom complet','name','text','Sophie Martel'],['Téléphone','phone','tel','+212 6 ...'],['Rue','street','text','123 Rue ...'],['Ville','city','text','Rabat']].map(([label,field,type,ph])=>(
                    <div key={field}>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#8B6B3D', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
                      {editing ? (
                        <input type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} placeholder={ph} className="input" style={{ width:'100%', boxSizing:'border-box' }} />
                      ) : (
                        <p style={{ fontSize:14, color:'#1A0F00', background:'#FAF3E8', borderRadius:10, padding:'10px 14px', margin:0 }}>
                          {form[field] || <span style={{ color:'#8B6B3D', fontStyle:'italic' }}>Non renseigné</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div className="profile-card">
                <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, marginBottom:24 }}>Mes commandes</h2>
                {orders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 16px' }}>
                    <div style={{ fontSize:48, marginBottom:16 }}></div>
                    <p className="font-display" style={{ fontSize:18, marginBottom:16 }}>Aucune commande</p>
                    <Link to="/menu" className="btn-primary">Commander maintenant</Link>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {orders.map((order)=>(
                      <div key={order._id} className="order-row">
                        <div>
                          <p style={{ fontWeight:600, fontSize:14, margin:0 }}>{order.orderNumber}</p>
                          <p style={{ fontSize:11, color:'#8B6B3D', margin:'2px 0 0' }}>{new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.items.length} article(s)</p>
                        </div>
                        <div className="order-meta">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full font-body ${STATUS_COLORS[order.status]||'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[order.status]||order.status}
                          </span>
                          <p className="font-display" style={{ fontWeight:700, color:'#C4531A', fontSize:14, margin:0 }}>{order.total} MAD</p>
                          <Link to={`/orders/${order._id}/track`} className="order-track" style={{ fontSize:12, color:'#C4531A', fontWeight:600, textDecoration:'none' }}>Suivre</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {tab === 'reviews' && (
              <div className="profile-card">
                <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, marginBottom:24 }}>Mes avis</h2>
                <div style={{ textAlign:'center', padding:'60px 16px' }}>
                  <div style={{ fontSize:48, marginBottom:16 }}></div>
                  <p style={{ color:'#8B6B3D', fontSize:14 }}>Vous n'avez pas encore posté d'avis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}


