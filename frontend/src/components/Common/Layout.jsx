import { Link, useLocation } from 'react-router-dom';
import { Home, Pill, Calendar, Activity, AlertTriangle, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { riskAlertAPI } from '../../services/api';

export default function Layout({ children }) {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  
  useEffect(() => {
    loadAlertCount();
    const interval = setInterval(loadAlertCount, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadAlertCount = async () => {
    try {
      const response = await riskAlertAPI.getStats();
      setAlertCount(response.data.total);
    } catch (error) {
      console.error('Error loading alert count:', error);
    }
  };
  
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Today', path: '/today', icon: Calendar },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Risk Alerts', path: '/risk-alerts', icon: AlertTriangle, badge: alertCount }, // NEW
    { name: 'Profile', path: '/profile', icon: User }, // NEW
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <Activity className="w-8 h-8 text-white mr-2" />
          <h1 className="text-2xl font-bold text-white">Biomatrix</h1>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
                {item.badge > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}