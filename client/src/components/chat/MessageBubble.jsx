export default function MessageBubble({ message, isOwn }) {
  const timeLabel = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Sending...'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        animation: 'riseIn 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          borderRadius: '24px',
          padding: '14px 16px',
          background: isOwn
            ? 'linear-gradient(135deg, #8951FF, #0E43FB)'
            : 'linear-gradient(180deg, rgba(19, 32, 60, 0.82), rgba(12, 20, 40, 0.68))',
          border: isOwn ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isOwn ? '0 18px 36px rgba(14, 67, 251, 0.22)' : 'var(--shadow-md)',
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap', color: isOwn ? 'white' : 'var(--text)', lineHeight: 1.55 }}>
          {message.text}
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '0.74rem',
            color: isOwn ? 'rgba(255,255,255,0.78)' : 'var(--muted)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span>{timeLabel}</span>
          {isOwn && <span>{message.seen ? 'Seen' : 'Delivered'}</span>}
        </div>
      </div>
    </div>
  )
}
