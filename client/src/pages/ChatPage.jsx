import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { MessageSquareText, RefreshCcw } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { ensureFirebaseChatAuth, firebaseDb, hasFirebaseWebConfig } from '../lib/firebase'
import ChatHeader from '../components/chat/ChatHeader'
import MessageInput from '../components/chat/MessageInput'
import MessageList from '../components/chat/MessageList'

const normalizeDate = (value) => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  return value
}

export default function ChatPage() {
  const { sessionId } = useParams()
  const { user } = useAuth()
  const [chatList, setChatList] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !sessionId) return undefined

    let unsubscribeChats = () => {}
    let cancelled = false

    const loadRealtimeChat = async () => {
      setLoading(true)
      setError('')

      try {
        if (!hasFirebaseWebConfig || !firebaseDb) {
          throw new Error('Firebase web config is missing for realtime chat.')
        }

        await ensureFirebaseChatAuth()
        const currentChatResponse = await api.get(`/chat/${sessionId}`)
        if (cancelled) return
        setActiveChat(currentChatResponse.data)

        const chatsQuery = query(
          collection(firebaseDb, 'chats'),
          where('participants', 'array-contains', user.id),
        )

        unsubscribeChats = onSnapshot(chatsQuery, async () => {
          const chatsResponse = await api.get('/chats')
          const hydratedChats = (chatsResponse.data || []).sort((a, b) => {
            const first = new Date(a.updatedAt || 0).getTime()
            const second = new Date(b.updatedAt || 0).getTime()
            return second - first
          })

          if (!cancelled) {
            setChatList(hydratedChats)
            const matched = hydratedChats.find((chat) => chat.sessionId === sessionId)
            if (matched) setActiveChat(matched)
          }
        })
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.response?.data?.message || loadError.message || 'Unable to open chat.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRealtimeChat()

    return () => {
      cancelled = true
      unsubscribeChats()
    }
  }, [sessionId, user])

  useEffect(() => {
    if (!activeChat?.id || !user || !firebaseDb || !hasFirebaseWebConfig) return undefined

    setMessageLoading(true)

    const messagesQuery = query(
      collection(firebaseDb, 'chats', activeChat.id, 'messages'),
      orderBy('createdAt', 'asc'),
    )

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const nextMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: normalizeDate(doc.data().createdAt),
      }))
      setMessages(nextMessages)
      setMessageLoading(false)
    }, () => {
      setMessageLoading(false)
      setError('Unable to stream messages right now.')
    })

    return () => unsubscribeMessages()
  }, [activeChat?.id, user])

  const activeChatList = useMemo(
    () => chatList.find((chat) => chat.sessionId === sessionId) || activeChat,
    [activeChat, chatList, sessionId],
  )

  const handleSend = async () => {
    if (!activeChat?.id || !draft.trim() || sending) return

    setSending(true)
    try {
      await api.post(`/chat/${activeChat.id}/message`, { text: draft.trim() })
      setDraft('')
    } catch (sendError) {
      setError(sendError?.response?.data?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-content" style={{ display: 'grid', gap: '22px' }}>
        <section className="glass-card surface-grid" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
          <div className="eyebrow">Realtime chat</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '18px', flexWrap: 'wrap' }}>
            <div>
              <h1 className="section-heading">Session messaging</h1>
              <p className="section-subtitle">A confirmed-session chat with realtime Firestore updates and participant-only access.</p>
            </div>
            <Link to="/dashboard" className="secondary-button">Back to dashboard</Link>
          </div>
        </section>

        {!hasFirebaseWebConfig ? (
          <section className="glass-card" style={{ padding: '28px', textAlign: 'center' }}>
            <MessageSquareText size={38} style={{ margin: '0 auto 12px', color: 'var(--cyan)' }} />
            <div style={{ fontWeight: 800, marginBottom: '8px' }}>Realtime chat needs Firebase web config</div>
            <div style={{ color: 'var(--muted)' }}>
              Add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
              `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`
              in the client environment to enable Firestore `onSnapshot`.
            </div>
          </section>
        ) : (
          <section className="chat-layout">
            <aside className="glass-card" style={{ padding: '18px', display: 'grid', gap: '12px', alignContent: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.06rem' }}>Chats</div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => window.location.reload()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <RefreshCcw size={14} />
                  Refresh
                </button>
              </div>

              {loading ? (
                [1, 2, 3].map((item) => (
                  <div key={item} className="glass-card skeleton" style={{ height: '88px', borderRadius: '18px' }} />
                ))
              ) : chatList.length === 0 ? (
                <div className="glass-card soft" style={{ padding: '22px', textAlign: 'center', color: 'var(--muted)' }}>
                  No confirmed chats yet.
                </div>
              ) : (
                chatList.map((chat) => {
                  const isActive = chat.sessionId === sessionId
                  return (
                    <Link
                      key={chat.id}
                      to={`/chat/${chat.sessionId}`}
                      className="hover-lift"
                      style={{
                        padding: '16px',
                        borderRadius: '20px',
                        border: `1px solid ${isActive ? 'rgba(137,81,255,0.24)' : 'rgba(255,255,255,0.06)'}`,
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(137,81,255,0.18), rgba(14,67,251,0.12))'
                          : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          display: 'grid',
                          placeItems: 'center',
                          background: 'linear-gradient(135deg, rgba(137,81,255,0.24), rgba(33,195,252,0.18))',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {chat.otherUser?.profilePhoto ? (
                          <img src={chat.otherUser.profilePhoto} alt={chat.otherUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          chat.otherUser?.name?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontWeight: 700 }}>{chat.otherUser?.name || 'Session partner'}</span>
                          <span style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.lastMessage || chat.session?.skillTitle || 'Start the conversation'}
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </aside>

            <div
              className="glass-card"
              style={{
                padding: '18px',
                display: 'grid',
                gridTemplateRows: 'auto minmax(0, 1fr) auto',
                gap: '14px',
                minHeight: 0,
              }}
            >
              {error && (
                <div className="glass-card soft" style={{ padding: '12px 14px', color: '#ff9bb7' }}>
                  {error}
                </div>
              )}

              {activeChatList ? (
                <>
                  <ChatHeader chat={activeChatList} />
                  <div style={{ minHeight: 0, overflowY: 'auto', paddingRight: '6px' }}>
                    <MessageList messages={messages} currentUserId={user?.id} loading={messageLoading} />
                  </div>
                  <MessageInput
                    value={draft}
                    onChange={setDraft}
                    onSend={handleSend}
                    disabled={!activeChatList || loading}
                    sending={sending}
                  />
                </>
              ) : (
                <div className="glass-card soft" style={{ padding: '42px', textAlign: 'center', color: 'var(--muted)' }}>
                  Select a confirmed session chat to start messaging.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
