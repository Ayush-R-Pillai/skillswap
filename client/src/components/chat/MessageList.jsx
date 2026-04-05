import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function MessageList({ messages, currentUserId, loading }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: '12px', padding: '8px 0' }}>
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="glass-card skeleton"
            style={{
              height: '72px',
              width: item % 2 === 0 ? '64%' : '52%',
              justifySelf: item % 2 === 0 ? 'end' : 'start',
              borderRadius: '24px',
            }}
          />
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div
        className="glass-card soft"
        style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--muted)',
        }}
      >
        No messages yet — start the conversation
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '12px', padding: '8px 0' }}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}
      <div ref={endRef} />
    </div>
  )
}
