import { Circle } from 'lucide-react'

export default function ChatHeader({ chat }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '18px',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, rgba(137,81,255,0.28), rgba(33,195,252,0.22))',
            fontWeight: 800,
          }}
        >
          {chat?.otherUser?.profilePhoto ? (
            <img
              src={chat.otherUser.profilePhoto}
              alt={chat.otherUser.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            chat?.otherUser?.name?.[0]?.toUpperCase() || '?'
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '1.04rem' }}>{chat?.otherUser?.name || 'Session partner'}</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Circle size={10} fill="#3dd9a4" color="#3dd9a4" />
            Session confirmed
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700 }}>{chat?.session?.skillTitle || 'Session chat'}</div>
        <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
          {chat?.session?.scheduledAt ? new Date(chat.session.scheduledAt).toLocaleString() : 'Schedule pending'}
        </div>
      </div>
    </div>
  )
}
