import { Link, useLocation } from 'react-router-dom';
import { Home, Pill, Calendar, Activity } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Today', path: '/today', icon: Calendar },
    { name: 'Medicines', path: '/medicines', icon: Pill },
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
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
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