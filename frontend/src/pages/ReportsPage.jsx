import { useState } from 'react'
import { FileText, Download, Loader2, CheckCircle, Eye } from 'lucide-react'

const REPORT_TYPES = [
  { id: 'summary', label: 'Executive Summary', desc: 'High-level overview with key metrics and trends', icon: '📊' },
  { id: 'detailed', label: 'Detailed Analysis', desc: 'Full EDA, correlations, distributions, and charts', icon: '📈' },
  { id: 'anomaly', label: 'Anomaly Report', desc: 'All detected anomalies with explanations', icon: '🔍' },
  { id: 'forecast', label: 'Forecast Report', desc: 'Prediction models and forecast confidence intervals', icon: '🎯' },
]

const PAST_REPORTS = [
  { name: 'Executive Summary — March 2024', date: '2024-03-14', size: '1.2 MB', type: 'summary' },
  { name: 'Anomaly Detection Report — Q1', date: '2024-03-10', size: '0.8 MB', type: 'anomaly' },
  { name: 'Detailed Analysis — sales_data_q3', date: '2024-03-05', size: '3.4 MB', type: 'detailed' },
  { name: 'Forecast Report — Revenue 2024', date: '2024-02-28', size: '2.1 MB', type: 'forecast' },
]

export default function ReportsPage() {
  const [selected, setSelected] = useState('summary')
  const [dataset, setDataset] = useState('sales_data_q3.csv')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)

  const generate = () => {
    setGenerating(true)
    setGenerated(null)
    setTimeout(() => {
      setGenerating(false)
      setGenerated({ name: `${REPORT_TYPES.find((r) => r.id === selected)?.label} — ${new Date().toLocaleDateString()}`, size: '2.3 MB' })
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and download PDF analytics reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="lg:col-span-2 space-y-5">
          {/* Report type */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORT_TYPES.map(({ id, label, desc, icon }) => (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selected === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className={`font-semibold text-sm ${selected === id ? 'text-blue-700' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Config */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Report Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dataset</label>
                <select
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['sales_data_q3.csv', 'customer_behavior.csv', 'marketing_campaigns.csv'].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include Sections</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Executive Summary', 'Data Overview', 'Key Metrics', 'Charts & Visualizations', 'Anomalies', 'Recommendations'].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <div className="flex gap-3">
                  {['PDF', 'HTML', 'Excel'].map((f) => (
                    <label key={f} className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                      <input type="radio" name="format" defaultChecked={f === 'PDF'} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={generating}
              className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {generating ? 'Generating Report...' : 'Generate Report'}
            </button>

            {generated && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">{generated.name}</p>
                    <p className="text-xs text-green-600">{generated.size} · Ready to download</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 bg-white border border-green-200 px-3 py-1.5 rounded-lg">
                    <Eye size={13} /> Preview
                  </button>
                  <button className="flex items-center gap-1 text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg">
                    <Download size={13} /> Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Past reports */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Previous Reports</h3>
          <div className="space-y-3">
            {PAST_REPORTS.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.date} · {r.size}</p>
                </div>
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0">
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
