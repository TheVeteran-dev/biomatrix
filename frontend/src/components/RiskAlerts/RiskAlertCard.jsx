import { AlertTriangle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useState } from 'react';
import { riskAlertAPI } from '../../services/api';

export default function RiskAlertCard({ alert, onDismiss }) {
  const [isDismissing, setIsDismissing] = useState(false);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-600'
        };
      case 'high':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-600'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-600'
        };
      case 'low':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-600'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          badgeColor: 'bg-gray-600'
        };
    }
  };

  const config = getSeverityConfig(alert.severity);
  const Icon = config.icon;

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await riskAlertAPI.dismiss(alert._id);
      if (onDismiss) onDismiss(alert._id);
    } catch (error) {
      console.error('Error dismissing alert:', error);
    } finally {
      setIsDismissing(false);
    }
  };

  const getTypeLabel = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-lg shadow-md relative`}>
      <button
        onClick={handleDismiss}
        disabled={isDismissing}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-3">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-1`} />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-bold text-lg ${config.textColor}`}>
              {alert.title}
            </h3>
            <span className={`${config.badgeColor} text-white text-xs px-2 py-1 rounded uppercase`}>
              {alert.severity}
            </span>
          </div>

          <p className={`${config.textColor} mb-2`}>
            {alert.description}
          </p>

          {alert.medicineNames && alert.medicineNames.length > 0 && (
            <div className="mb-2">
              <span className={`text-sm font-semibold ${config.textColor}`}>
                Medicines: 
              </span>
              <span className={`text-sm ${config.textColor} ml-2`}>
                {alert.medicineNames.join(', ')}
              </span>
            </div>
          )}

          {alert.actionRequired && (
            <div className={`mt-3 p-3 bg-white bg-opacity-50 rounded border ${config.borderColor}`}>
              <p className={`text-sm font-semibold ${config.textColor} mb-1`}>
                Action Required:
              </p>
              <p className={`text-sm ${config.textColor}`}>
                {alert.actionRequired}
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-600">
              Type: {getTypeLabel(alert.type)}
            </span>
            <span className="text-xs text-gray-600">
              {new Date(alert.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}