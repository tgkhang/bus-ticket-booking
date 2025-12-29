"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatButton from './ChatButton'
import { Send, Loader2, X, MapPin, Clock, DollarSign } from 'lucide-react'
import { useChatSocket } from '@/hooks/useChatSocket'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()
  
  const quickReplies = [
    'Search trips',
    'Check my booking',
    'Refund policy',
    'Contact support',
  ]
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Use custom hook for socket management
  const { sendMessage, messages, isTyping, isConnected } = useChatSocket(open)

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    setIsSending(true)
    sendMessage(inputMessage)
    setInputMessage('')
    setIsSending(false)
  }

  // Handle quick reply click
  const handleQuickReply = (text: string) => {
    setInputMessage(text)
    // Optionally auto-send:
    // sendMessage(text)
  }

  return (
    <>
      {/* Only show ChatButton when widget is closed */}
      {!open && <ChatButton open={open} onToggle={() => setOpen(true)} />}

      {open && (
        <div
          className={`
            fixed right-6 bottom-24 z-50
            w-[340px] sm:w-[380px] h-[520px]
            bg-white dark:bg-gray-950
            rounded-2xl shadow-2xl overflow-hidden
            border border-gray-200 dark:border-gray-800
            flex flex-col
            transition-all duration-300 ease-in-out
          `}
        >
          <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold backdrop-blur-sm shadow-sm">
                {/* Robot SVG icon (square head, eyes, antenna) */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#2563eb" />
                  {/* Head */}
                  <rect x="8" y="9" width="12" height="10" rx="3" fill="white" stroke="#2563eb" strokeWidth="1.2" />
                  {/* Eyes */}
                  <circle cx="12" cy="14" r="1.2" fill="#2563eb" />
                  <circle cx="16" cy="14" r="1.2" fill="#2563eb" />
                  {/* Mouth */}
                  <rect x="12.5" y="16.5" width="3" height="1" rx="0.5" fill="#2563eb" />
                  {/* Antenna */}
                  <rect x="13.25" y="7" width="1.5" height="3" rx="0.75" fill="#2563eb" />
                  <circle cx="14" cy="7" r="0.8" fill="#2563eb" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base">AI Assistant</h3>
                <p className="text-xs opacity-90 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <main className="flex-1 p-5 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1 ${msg.sender === 'User' ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-3 ${msg.sender === 'User' ? 'justify-end' : ''} w-full`}>
                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 shadow text-sm max-w-[80%] 
                      ${msg.sender === 'User' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'}
                    `}
                  >
                    {msg.sender === 'User' ? (
                      <p className="font-medium">{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-strong:text-blue-600 dark:prose-strong:text-blue-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {/* Show trip results if available */}
                    {msg.data?.trips && msg.data.trips.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.data.trips.map((trip: any, tripIdx: number) => (
                          <div 
                            key={tripIdx} 
                            onClick={() => {
                              router.push(`/trips/${trip.id}`)
                              setOpen(false) // Close chat after navigation
                            }}
                            className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">{trip.route}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(trip.departureTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                              </div>
                              <div className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                <DollarSign className="w-3 h-3" />
                                {trip.price.toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {trip.availableSeats} chỗ trống
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Timestamp */}
                <span className={`text-xs mt-0.5 ${msg.sender === 'User' ? 'text-blue-300 pr-2' : 'text-gray-400 pl-2'}`}>
                  {msg.timestamp &&
                    new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                {/* Typing bubble */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full inline-block animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full inline-block animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full inline-block animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Quick replies */}
          <div className="px-4 pt-2 pb-1 flex flex-wrap gap-2">
            {quickReplies.map((text, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickReply(text)}
                className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
              >
                {text}
              </button>
            ))}
          </div>
          <footer className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending || !isConnected}
                className={`
                  flex-1 px-4 py-3 rounded-full text-sm
                  border border-gray-300 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800
                  focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                  transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending || !isConnected}
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center
                  transition-all duration-200
                  disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:cursor-not-allowed
                  bg-blue-600 hover:bg-blue-700 shadow-md active:scale-95
                `}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  )
}
