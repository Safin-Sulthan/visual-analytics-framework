import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import Card from '../components/common/Card';
import TimeSeriesChart from '../components/Charts/TimeSeriesChart';
import ScatterPlot from '../components/Charts/ScatterPlot';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TABS = ['Forecast', 'Regression'];

const Predictions = () => {
  const { currentDataset } = useAppContext();
  const { predictions, loading, fetchPredictions } = useAnalytics(currentDataset?._id);
  const [activeTab, setActiveTab] = useState('Forecast');

  useEffect(() => {
    if (currentDataset?._id) fetchPredictions();
  }, [currentDataset?._id]);

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500 font-medium">No dataset selected.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="xl" /></div>;

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold text-gray-900">Predictions — {currentDataset.name}</h2>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Forecast' && (
        <Card title="Time Series Forecast" subtitle="Prophet model — 30-day ahead forecast">
          <TimeSeriesChart
            data={predictions?.forecast?.data ?? []}
            xKey="ds"
            yKeys={['yhat', 'yhat_lower', 'yhat_upper']}
            colors={['#6366f1', '#a5b4fc', '#a5b4fc']}
            height={320}
            areaFill
          />
          {predictions?.forecast?.metrics && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              {Object.entries(predictions.forecast.metrics).map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase">{k}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{Number(v).toFixed(4)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'Regression' && (
        <Card title="Regression Predictions" subtitle="Actual vs predicted values">
          <ScatterPlot
            data={predictions?.regression?.points ?? []}
            xKey="actual"
            yKey="predicted"
            height={320}
          />
          {predictions?.regression?.metrics && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              {Object.entries(predictions.regression.metrics).map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase">{k}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{Number(v).toFixed(4)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Predictions;
