import { useEffect, useState } from 'react';
import { logAPI } from '../services/api';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

export default function Today() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    loadLogs();
  }, []);
  
  const loadLogs = async () => {
    try {
      const response = await logAPI.getByDate(today);
      setLogs(response.data);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };
  
  const handleTake = async (logId) => {
    try {
      await logAPI.update(logId, { status: 'taken' });
      loadLogs();
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };
  
  const handleSkip = async (logId) => {
    try {
      await logAPI.update(logId, { status: 'skipped' });
      loadLogs();
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };
  
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken': return <Check className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'missed': return <AlertCircle className="w-5 h-5" />;
      case 'skipped': return <X className="w-5 h-5" />;
      default: return null;
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Today's Medications</h1>
      
      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        {['all', 'pending', 'taken', 'missed', 'skipped'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>
      
      {/* Medication List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold">{log.medicineName}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getStatusColor(log.status)}`}>
                    {getStatusIcon(log.status)}
                    <span className="capitalize">{log.status}</span>
                  </span>
                </div>
                <p className="text-gray-600 mt-1">Scheduled: {log.scheduledTime}</p>
                {log.takenAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Taken at: {new Date(log.takenAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              {log.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleTake(log._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Take
                  </button>
                  <button
                    onClick={() => handleSkip(log._id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Skip
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No medications for this filter</p>
        </div>
      )}
    </div>
  );
}