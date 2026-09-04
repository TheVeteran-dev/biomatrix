import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { Activity, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import AdherenceChart from '../components/Dashboard/AdherenceChart';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboard();
  }, []);
  
  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }
  
  if (!data) {
    return <div className="text-center py-12">No data available</div>;
  }
  
  const stats = [
    {
      name: 'Today\'s Adherence',
      value: `${data.today.adherence}%`,
      icon: Activity,
      color: 'blue',
      subtext: `${data.today.taken}/${data.today.total} taken`
    },
    {
      name: 'Weekly Adherence',
      value: `${data.weekly.adherence}%`,
      icon: TrendingUp,
      color: 'green',
    },
    {
      name: 'Active Medicines',
      value: data.activeMedicines,
      icon: Package,
      color: 'purple',
    },
    {
      name: 'Low Stock',
      value: data.lowStock.length,
      icon: AlertTriangle,
      color: 'red',
    },
  ];
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                  )}
                </div>
                <Icon className={`w-12 h-12 text-${stat.color}-500`} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Today's Medications</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Taken</span>
              <span className="font-semibold text-green-600">{data.today.taken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{data.today.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Missed</span>
              <span className="font-semibold text-red-600">{data.today.missed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skipped</span>
              <span className="font-semibold text-gray-600">{data.today.skipped}</span>
            </div>
          </div>
        </div>
        
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Low Stock Alerts</h2>
          {data.lowStock.length === 0 ? (
            <p className="text-gray-500">No low stock items</p>
          ) : (
            <div className="space-y-3">
              {data.lowStock.map((med) => (
                <div key={med._id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                  </div>
                  <span className="text-red-600 font-bold">{med.remainingQuantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Adherence Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">7-Day Adherence Trend</h2>
        <AdherenceChart />
      </div>
    </div>
  );
}