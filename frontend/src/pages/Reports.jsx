import React, { useEffect, useState } from 'react';
import { Download, FileText, Plus } from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { useAppContext } from '../context/AppContext';
import { formatDate } from '../utils/helpers';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Reports = () => {
  const { currentDataset } = useAppContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getReports();
        setReports(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    if (!currentDataset) return;
    setGenerating(true);
    try {
      const report = await analyticsService.generateReport(currentDataset._id);
      setReports((prev) => [report, ...prev]);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId, title) => {
    const blob = await analyticsService.downloadReport(reportId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <Button
          onClick={handleGenerate}
          loading={generating}
          disabled={!currentDataset}
          size="sm"
        >
          <Plus size={14} /> Generate Report
        </Button>
      </div>

      {!currentDataset && (
        <div className="p-4 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
          Select a dataset first to generate a report.
        </div>
      )}

      <Card title="Generated Reports" subtitle="Download PDF analytics reports">
        {loading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500">No reports generated yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reports.map((report) => (
              <li key={report._id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(report.generatedAt)}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(report._id, report.title)}
                >
                  <Download size={14} /> Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Reports;
