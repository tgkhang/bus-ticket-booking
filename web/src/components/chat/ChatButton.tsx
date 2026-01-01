// components/ChatButton.tsx
"use client"

import { MessageCircle, X } from 'lucide-react'

interface ChatButtonProps {
  open: boolean
  onToggle: () => void
}

export default function ChatButton({ open, onToggle }: ChatButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={open ? "Close chat" : "Open chat"}
      className={`
        fixed right-6 bottom-6 z-50
        w-14 h-14 rounded-full
        flex items-center justify-center
        text-white shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900
        ${open 
          ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' 
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }
      `}
    >
      {open ? (
        <X className="w-7 h-7" strokeWidth={2.5} />
      ) : (
        <MessageCircle className="w-7 h-7" strokeWidth={2.5} />
      )}
    </button>
  )
}