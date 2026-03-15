import { useState } from 'react'
import { MessageSquare, Send, Loader2, BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const SUGGESTIONS = [
  'What is the average revenue per customer?',
  'Which product category has the highest growth?',
  'Show me sales trends for Q3',
  'How many customers churned last month?',
  'What are the top 5 revenue-generating regions?',
]

const MOCK_RESPONSES = {
  default: {
    text: 'Based on your dataset, the average revenue per customer is $347.20. The top performing segment is "Premium" with 42% higher LTV than standard customers.',
    chartData: [
      { segment: 'Premium', value: 612 }, { segment: 'Standard', value: 347 },
      { segment: 'Basic', value: 189 }, { segment: 'Trial', value: 45 },
    ],
    chartKey: 'value',
    chartLabel: 'Avg Revenue ($)',
  },
}

export default function NlpPage() {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSend = (text) => {
    const q = text || query
    if (!q.trim()) return
    setHistory((prev) => [...prev, { role: 'user', text: q }])
    setQuery('')
    setLoading(true)
    setTimeout(() => {
      const resp = MOCK_RESPONSES.default
      setHistory((prev) => [...prev, { role: 'assistant', text: resp.text, chart: resp }])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Natural Language Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Ask questions about your data in plain English</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col" style={{ height: '70vh' }}>
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Ask your data</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {history.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <BarChart2 size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">Start by asking a question about your data</p>
              </div>
            )}
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'} px-4 py-3`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.chart && (
                    <div className="mt-3 bg-white rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-2 font-medium">{msg.chart.chartLabel}</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={msg.chart.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="segment" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey={msg.chart.chartKey} fill="#3b82f6" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Analyzing...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question about your data..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!query.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Suggested Questions</h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-sm text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-2.5 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Query History</h3>
            {history.filter((m) => m.role === 'user').length === 0 ? (
              <p className="text-sm text-gray-400">No queries yet</p>
            ) : (
              <div className="space-y-2">
                {history
                  .filter((m) => m.role === 'user')
                  .slice(-5)
                  .reverse()
                  .map((m, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(m.text)}
                      className="w-full text-left text-xs text-gray-500 hover:text-blue-600 truncate"
                    >
                      {m.text}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
