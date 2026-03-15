import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import InsightCard from '../components/InsightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useData } from '../context/DataContext';
import insightService from '../services/insightService';
import { Lightbulb, Search, Sparkles, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const INSIGHT_TYPES = ['all', 'trend', 'anomaly', 'correlation', 'recommendation'];

function Insights() {
  const { datasets, currentDataset, setCurrentDataset, insights, fetchInsights, insightsLoading } = useData();
  const [filterType, setFilterType] = useState('all');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (currentDataset) {
      fetchInsights(currentDataset.id);
    } else {
      fetchInsights();
    }
  }, [currentDataset, fetchInsights]);

  const filteredInsights = insights.filter(i =>
    filterType === 'all' || i.type?.toLowerCase() === filterType
  );

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const result = await insightService.queryInsights(query, currentDataset?.id);
      setQueryResult(result);
    } catch (err) {
      toast.error('Query failed. Please try again.');
    } finally {
      setQueryLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentDataset) {
      toast.error('Please select a dataset first');
      return;
    }
    setGenerating(true);
    try {
      await insightService.generateInsights(currentDataset.id);
      await fetchInsights(currentDataset.id);
      toast.success('Insights generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout title="Insights">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              value={currentDataset?.id || ''}
              onChange={e => {
                const ds = datasets.find(d => String(d.id) === e.target.value);
                setCurrentDataset(ds || null);
              }}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All datasets</option>
              {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
            </select>

            <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
              {INSIGHT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    filterType === type ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !currentDataset}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>

        {/* Natural language query */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            Natural Language Query
          </h2>
          <form onSubmit={handleQuery} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask anything about your data... e.g. 'What are the main trends?'"
              className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={queryLoading || !query.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {queryLoading ? 'Asking...' : 'Ask'}
            </button>
          </form>

          {queryLoading && <LoadingSpinner size="sm" message="Processing query..." />}

          {queryResult && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-sm font-medium text-blue-400 mb-2">Query Result</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {queryResult.answer || queryResult.result || JSON.stringify(queryResult)}
              </p>
              {queryResult.insights && queryResult.insights.length > 0 && (
                <div className="mt-3 space-y-2">
                  {queryResult.insights.map((ins, i) => (
                    <InsightCard key={i} insight={ins} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Insights list */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              Insights
              {filteredInsights.length > 0 && (
                <span className="ml-2 text-sm text-slate-400 font-normal">({filteredInsights.length})</span>
              )}
            </h2>
          </div>

          {insightsLoading ? (
            <LoadingSpinner message="Loading insights..." />
          ) : filteredInsights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Lightbulb className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-slate-400 font-medium">No insights found</p>
              <p className="text-sm mt-1">
                {currentDataset
                  ? 'Click "Generate Insights" to analyze this dataset'
                  : 'Select a dataset and generate insights'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInsights.map((insight, i) => (
                <InsightCard key={insight.id || i} insight={insight} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Insights;
