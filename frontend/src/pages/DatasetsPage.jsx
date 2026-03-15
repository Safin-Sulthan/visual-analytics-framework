import { useState, useRef, useCallback } from 'react'
import { Upload, File, Trash2, Eye, CheckCircle, XCircle, Loader2, CloudUpload } from 'lucide-react'

const MOCK_DATASETS = [
  { id: 1, name: 'sales_data_q3.csv', size: '2.4 MB', rows: 15420, columns: 18, uploaded: '2024-03-14', status: 'ready' },
  { id: 2, name: 'customer_behavior.csv', size: '1.1 MB', rows: 8300, columns: 12, uploaded: '2024-03-12', status: 'ready' },
  { id: 3, name: 'inventory_2024.csv', size: '4.7 MB', rows: 32100, columns: 24, uploaded: '2024-03-10', status: 'processing' },
  { id: 4, name: 'marketing_campaigns.csv', size: '890 KB', rows: 4200, columns: 9, uploaded: '2024-03-08', status: 'ready' },
]

function FileDropZone({ onFilesSelected }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const files = [...e.dataTransfer.files].filter((f) => f.name.endsWith('.csv'))
    if (files.length) onFilesSelected(files)
  }, [onFilesSelected])

  const handleChange = (e) => {
    const files = [...e.target.files]
    if (files.length) onFilesSelected(files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <CloudUpload size={40} className={`mx-auto mb-3 ${dragging ? 'text-blue-500' : 'text-gray-400'}`} />
      <p className="text-sm font-semibold text-gray-700">Drop CSV files here or click to browse</p>
      <p className="text-xs text-gray-400 mt-1">Only .csv files are accepted · Max 100MB</p>
      <input ref={inputRef} type="file" accept=".csv" multiple onChange={handleChange} className="hidden" />
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    ready: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    processing: { color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
    error: { color: 'bg-red-100 text-red-700', icon: XCircle },
  }
  const { color, icon: Icon } = map[status] || map.ready
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState(MOCK_DATASETS)
  const [uploads, setUploads] = useState([])

  const handleFilesSelected = (files) => {
    const newUploads = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      progress: 0,
      status: 'uploading',
    }))
    setUploads((prev) => [...prev, ...newUploads])

    newUploads.forEach((upload) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setUploads((prev) => prev.filter((u) => u.id !== upload.id))
          setDatasets((prev) => [
            {
              id: Date.now(),
              name: upload.name,
              size: upload.size,
              rows: Math.floor(Math.random() * 20000) + 1000,
              columns: Math.floor(Math.random() * 20) + 5,
              uploaded: new Date().toISOString().split('T')[0],
              status: 'ready',
            },
            ...prev,
          ])
        } else {
          setUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, progress } : u)))
        }
      }, 300)
    })
  }

  const deleteDataset = (id) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
        <p className="text-sm text-gray-500 mt-1">Upload and manage your CSV datasets</p>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} />

      {/* Active uploads */}
      {uploads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Uploading</h3>
          {uploads.map((u) => (
            <div key={u.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <File size={14} className="text-gray-400" />
                  <span className="text-gray-700">{u.name}</span>
                </div>
                <span className="text-gray-500">{u.progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dataset table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">All Datasets ({datasets.length})</h3>
          <button
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload size={14} />
            Upload CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Size', 'Rows', 'Columns', 'Uploaded', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {datasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <File size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{ds.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{ds.size}</td>
                  <td className="px-5 py-3 text-gray-600">{ds.rows.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-600">{ds.columns}</td>
                  <td className="px-5 py-3 text-gray-600">{ds.uploaded}</td>
                  <td className="px-5 py-3"><StatusBadge status={ds.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Preview">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteDataset(ds.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {datasets.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Database size={40} className="mx-auto mb-3 opacity-40" />
              <p>No datasets yet. Upload a CSV file to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

