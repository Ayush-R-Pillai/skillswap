import { SendHorizontal } from 'lucide-react'

export default function MessageInput({ value, onChange, onSend, disabled, sending }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '14px',
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
      }}
    >
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Write a message..."
        style={{
          flex: 1,
          minHeight: '64px',
          maxHeight: '160px',
          resize: 'vertical',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text)',
          padding: '16px 18px',
          outline: 'none',
        }}
      />
      <button
        type="button"
        className="gradient-button"
        onClick={onSend}
        disabled={disabled || sending || !value.trim()}
        style={{
          minWidth: '56px',
          minHeight: '56px',
          padding: 0,
          borderRadius: '18px',
          opacity: disabled || sending || !value.trim() ? 0.6 : 1,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <SendHorizontal size={18} />
      </button>
    </div>
  )
}
