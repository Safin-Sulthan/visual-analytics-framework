import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useData } from '../context/DataContext';
import reportService from '../services/reportService';
import { formatDate, formatFileSize } from '../utils/formatters';
import { FileText, Download, Trash2, Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

function Reports() {
  const { datasets, currentDataset, setCurrentDataset } = useData();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  const fetchReports = async () => {
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleGenerate = async () => {
    if (!currentDataset) {
      toast.error('Please select a dataset first');
      return;
    }
    setGenerating(true);
    try {
      const report = await reportService.generateReport(currentDataset.id);
      setReports(prev => [report, ...prev]);
      toast.success('Report generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const blob = await reportService.downloadReport(report.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name || 'report'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Failed to download report');
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await reportService.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete report');
    }
  };

  const handlePreview = async (report) => {
    try {
      const data = await reportService.getReport(report.id);
      setPreviewReport({ ...report, content: data });
    } catch {
      toast.error('Failed to load report preview');
    }
  };

  return (
    <Layout title="Reports">
      <div className="space-y-6">
        {/* Generate section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Generate New Report</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={currentDataset?.id || ''}
              onChange={e => {
                const ds = datasets.find(d => String(d.id) === e.target.value);
                setCurrentDataset(ds || null);
              }}
              className="flex-1 max-w-xs bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a dataset...</option>
              {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating || !currentDataset}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
          {generating && <LoadingSpinner size="sm" message="Generating report..." />}
        </div>

        {/* Reports list */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Reports</h2>
            <span className="text-sm text-slate-400">{reports.length} total</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading reports..." />
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-slate-400 font-medium">No reports yet</p>
              <p className="text-sm mt-1">Generate a report from a dataset to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {reports.map(report => (
                <div key={report.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-700/20">
                  <div className="p-2 bg-slate-700 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {report.name || `Report for ${report.dataset_name || 'dataset'}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(report.created_at)} · {formatFileSize(report.size)} · {report.status || 'ready'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handlePreview(report)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {previewReport.name || 'Report Preview'}
              </h3>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                {typeof previewReport.content === 'string' ? (
                  <pre className="whitespace-pre-wrap bg-slate-700/50 p-4 rounded-lg text-xs">{previewReport.content}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap bg-slate-700/50 p-4 rounded-lg text-xs">
                    {JSON.stringify(previewReport.content, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Reports;
