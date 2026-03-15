import { useState } from 'react'
import {
  ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { PlayCircle, Database } from 'lucide-react'

const DATASETS = ['sales_data_q3.csv', 'customer_behavior.csv', 'marketing_campaigns.csv']

const histData = [
  { bin: '0-10', count: 45 }, { bin: '10-20', count: 89 }, { bin: '20-30', count: 134 },
  { bin: '30-40', count: 178 }, { bin: '40-50', count: 203 }, { bin: '50-60', count: 156 },
  { bin: '60-70', count: 112 }, { bin: '70-80', count: 78 }, { bin: '80-90', count: 45 }, { bin: '90-100', count: 20 },
]

const scatterData = Array.from({ length: 50 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100 + i * 0.5,
}))

const stats = [
  { label: 'Mean', value: '47.3' }, { label: 'Median', value: '49.1' },
  { label: 'Std Dev', value: '18.4' }, { label: 'Min', value: '0.2' },
  { label: 'Max', value: '99.7' }, { label: 'Missing', value: '0.3%' },
]

export default function EdaPage() {
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0])
  const [analyzed, setAnalyzed] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exploratory Data Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Analyze distributions, correlations, and data quality</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Dataset</label>
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DATASETS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button
          onClick={() => setAnalyzed(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <PlayCircle size={16} />
          Run EDA
        </button>
      </div>

      {analyzed && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Histogram */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Value Distribution (Histogram)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={histData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {histData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${220 + i * 8}, 70%, ${55 + i * 2}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Scatter Plot (Feature Correlation)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="x" name="Feature A" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="y" name="Feature B" tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={scatterData} fill="#3b82f6" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Column summary */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Column Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Column', 'Type', 'Non-Null', 'Unique', 'Mean', 'Std Dev'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['revenue', 'float64', '99.7%', '12,431', '47.3', '18.4'],
                    ['quantity', 'int64', '100%', '1,200', '23.1', '9.2'],
                    ['category', 'object', '98.2%', '8', '-', '-'],
                    ['date', 'datetime', '100%', '365', '-', '-'],
                    ['customer_id', 'int64', '100%', '4,230', '5,421', '2,341'],
                  ].map(([col, type, nn, uniq, mean, std]) => (
                    <tr key={col} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{col}</td>
                      <td className="px-5 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{type}</span></td>
                      <td className="px-5 py-3 text-gray-600">{nn}</td>
                      <td className="px-5 py-3 text-gray-600">{uniq}</td>
                      <td className="px-5 py-3 text-gray-600">{mean}</td>
                      <td className="px-5 py-3 text-gray-600">{std}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!analyzed && (
        <div className="bg-white rounded-xl border border-gray-200 py-24 text-center">
          <Database size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">Select a dataset and click Run EDA to begin analysis</p>
        </div>
      )}
    </div>
  )
}
