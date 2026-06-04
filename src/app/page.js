"use client"
import { useState, useRef, useEffect } from "react"

export default function Home() {
  const [messages, setMessages] = useState([])
  const [state, setState] = useState({
    name: null,
    age: null,
    city: null
  })
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = async () => {
    if (!prompt.trim() || loading) return
    
    setLoading(true)
    const userMsg = prompt
    const newMessages = [...messages, { role: "user", text: userMsg }]
    setMessages(newMessages)
    setPrompt("")

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: newMessages,
          state
        })
      })
      const data = await res.json()

      setState((prev) => ({ ...prev, ...data.updatedFields }))
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && prompt.trim()) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#1D546D] via-[#164158] to-[#0c2230] flex flex-col overflow-hidden">
      
      {/* Header - Fixed at top */}
      <header className="flex-shrink-0 bg-[#061E29]/80 backdrop-blur-sm border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 z-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
          AI Chat Bot
        </h1>
      </header>

      {/* Mobile Tab Navigation - Fixed below header */}
      <div className="flex-shrink-0 lg:hidden bg-[#061E29]/60 border-b border-white/10 px-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 text-sm font-medium transition-all touch-manipulation ${
              activeTab === "chat"
                ? "text-white border-b-2 border-[#5F9598]"
                : "text-white/60"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-3 text-sm font-medium transition-all touch-manipulation ${
              activeTab === "form"
                ? "text-white border-b-2 border-[#5F9598]"
                : "text-white/60"
            }`}
          >
            📋 Form
          </button>
        </div>
      </div>

      {/* Main Content - Takes remaining space with proper overflow handling */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="h-full flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5 min-h-0">
          
          {/* CHAT SECTION */}
          <div className={`
            flex flex-col flex-1 bg-[#061E29]/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl
            ${activeTab === "chat" ? "flex" : "hidden"} 
            lg:flex
            min-h-0 h-full
          `}>
            
            {/* Chat Header - Fixed */}
            <div className="flex-shrink-0 bg-white/5 px-4 py-3 border-b border-white/10 rounded-t-2xl">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Conversation
              </h2>
            </div>

            {/* Messages Area - Scrollable, takes available space */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3"
              style={{ overscrollBehavior: 'contain' }}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center text-white/50 p-6">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-sm sm:text-base">No messages yet</p>
                    <p className="text-xs sm:text-sm mt-1">Start chatting to extract information</p>
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg ${
                        m.role === "user"
                          ? "bg-white text-gray-900"
                          : "bg-[#5F9598] text-white"
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-semibold mb-1 capitalize">
                        {m.role}
                      </div>
                      <div className="text-xs sm:text-sm md:text-base break-words">
                        {m.text}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-[#5F9598] text-white shadow-lg">
                    <div className="text-xs sm:text-sm font-semibold mb-1">Bot</div>
                    <div className="text-xs sm:text-sm md:text-base">
                      <span className="animate-pulse">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - FIXED at bottom, always visible */}
            <div className="flex-shrink-0 bg-black/20 backdrop-blur-sm border-t border-white/10 p-3 sm:p-4 rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  onKeyDown={handleKeyPress}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-500 border-2 border-transparent focus:border-[#5F9598] focus:outline-none disabled:opacity-50 text-base sm:text-base"
                  style={{ WebkitAppearance: 'none' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !prompt.trim()}
                  className="flex-shrink-0 px-5 py-2.5 bg-[#5F9598] hover:bg-[#4a7679] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all active:scale-95 text-base shadow-lg touch-manipulation"
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
              <div className="text-xs text-white/40 text-center mt-2 sm:hidden">
                Press Enter to send
              </div>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className={`
            flex flex-col w-full lg:w-96 bg-[#0d2b39]/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl
            ${activeTab === "form" ? "flex" : "hidden"}
            lg:flex
            h-full
          `}>
            
            {/* Form Header - Fixed */}
            <div className="flex-shrink-0 bg-white/5 px-4 py-3 border-b border-white/10 rounded-t-2xl">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Extracted Information
              </h2>
            </div>

            {/* Form Fields - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  value={state?.name || ""}
                  readOnly
                  placeholder="Not extracted"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5F9598] text-sm sm:text-base cursor-default"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <input
                  value={state?.age || ""}
                  readOnly
                  placeholder="Not extracted"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5F9598] text-sm sm:text-base cursor-default"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  value={state?.city || ""}
                  readOnly
                  placeholder="Not extracted"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5F9598] text-sm sm:text-base cursor-default"
                />
              </div>

              {/* Status Indicator */}
              <div className="mt-6 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Auto-extracting from chat</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}