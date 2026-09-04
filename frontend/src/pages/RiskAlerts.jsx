import { useEffect, useState } from 'react';
import { riskAlertAPI } from '../services/api';
import RiskAlertCard from '../components/RiskAlerts/RiskAlertCard';
import { AlertTriangle, Filter, RefreshCw } from 'lucide-react';

export default function RiskAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, severityFilter, typeFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await riskAlertAPI.getAll();
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await riskAlertAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    setFilteredAlerts(filtered);
  };

  const handleDismiss = (alertId) => {
    setAlerts(alerts.filter(alert => alert._id !== alertId));
    loadStats();
  };

  const handleDetect = async () => {
    setDetecting(true);
    try {
      await riskAlertAPI.triggerDetection();
      await loadAlerts();
      await loadStats();
    } catch (error) {
      console.error('Error triggering detection:', error);
    } finally {
      setDetecting(false);
    }
  };

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'drug_interaction', label: 'Drug Interactions' },
    { value: 'missed_critical', label: 'Missed Critical' },
    { value: 'overdose_risk', label: 'Overdose Risk' },
    { value: 'low_adherence', label: 'Low Adherence' },
    { value: 'contraindication', label: 'Contraindication' },
    { value: 'allergy_warning', label: 'Allergy Warning' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading risk alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Risk Alerts</h1>
        <button
          onClick={handleDetect}
          disabled={detecting}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${detecting ? 'animate-spin' : ''}`} />
          {detecting ? 'Detecting...' : 'Run Detection'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Alerts</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border-l-4 border-red-600">
            <p className="text-sm text-red-600">Critical</p>
            <p className="text-2xl font-bold text-red-700">{stats.bySeverity.critical}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg shadow border-l-4 border-orange-600">
            <p className="text-sm text-orange-600">High</p>
            <p className="text-2xl font-bold text-orange-700">{stats.bySeverity.high}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border-l-4 border-yellow-600">
            <p className="text-sm text-yellow-600">Medium</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.bySeverity.medium}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow border-l-4 border-blue-600">
            <p className="text-sm text-blue-600">Low</p>
            <p className="text-2xl font-bold text-blue-700">{stats.bySeverity.low}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-2 gap-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {severityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {alerts.length === 0 
                ? 'No risk alerts found. Your health is looking good!'
                : 'No alerts match the selected filters.'
              }
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <RiskAlertCard 
              key={alert._id} 
              alert={alert} 
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>
    </div>
  );
}