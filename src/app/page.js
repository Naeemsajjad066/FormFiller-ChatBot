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
  const [activeTab, setActiveTab] = useState("chat") // For mobile view toggle
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])




  const sendMessage = async () => {
    setLoading(true)
    const userMsg = prompt
   const newMessages= [...messages,{ role: "user", text: userMsg }]
   setMessages(newMessages)
    setPrompt("")

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
    setLoading(false)
  }





  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#1D546D] via-[#164158] to-[#0c2230] flex flex-col">
      
      {/* Header */}
      <header className="bg-[#061E29]/80 backdrop-blur-sm border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
          AI Chat Bot
        </h1>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-[#061E29]/60 border-b border-white/10 px-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === "chat"
                ? "text-white border-b-2 border-[#5F9598]"
                : "text-white/60"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === "form"
                ? "text-white border-b-2 border-[#5F9598]"
                : "text-white/60"
            }`}
          >
            📋 Form
          </button>
        </div>
      </div>

      {/* Main Content Area - CRITICAL: min-h-0 for proper flex overflow handling */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="h-full flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5 min-h-0">
          
          {/* CHAT SECTION - Show on mobile when activeTab === "chat" */}
          <div className={`${
            activeTab === "chat" ? "flex" : "hidden"
          } lg:flex flex-col flex-1 bg-[#061E29]/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl min-h-0`}>
            
            {/* Chat Header */}
            <div className="flex-shrink-0 bg-white/5 px-4 py-3 border-b border-white/10">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Conversation
              </h2>
            </div>

            {/* Messages Area - CRITICAL: min-h-0 and flex-1 for proper overflow */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3">
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

            {/* Input Area - CRITICAL: flex-shrink-0 keeps it fixed at bottom */}
            <div className="flex-shrink-0 bg-black/20 border-t border-white/10 p-3 sm:p-4">
              <div className="flex gap-2">
                <input
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && prompt.trim()) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-500 border-2 border-transparent focus:border-[#5F9598] focus:outline-none disabled:opacity-50 text-base"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !prompt.trim()}
                  className="flex-shrink-0 px-5 py-2.5 bg-[#5F9598] hover:bg-[#4a7679] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all active:scale-95 text-base shadow-lg"
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* FORM SECTION - Show on mobile when activeTab === "form" */}
          <div className={`${
            activeTab === "form" ? "flex" : "hidden"
          } lg:flex flex-col w-full lg:w-96 bg-[#0d2b39]/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden`}>
            
            {/* Form Header */}
            <div className="bg-white/5 px-4 py-3 border-b border-white/10">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Extracted Information
              </h2>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  value={state?.name || ""}
                  readOnly
                  placeholder="Not extracted"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5F9598] text-sm sm:text-base"
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
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5F9598] text-sm sm:text-base"
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
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5F9598] text-sm sm:text-base"
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
  );
}