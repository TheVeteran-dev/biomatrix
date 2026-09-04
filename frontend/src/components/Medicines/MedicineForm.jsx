import { useState, useEffect } from 'react';
import { medicineAPI } from '../../services/api';
import { X } from 'lucide-react';

export default function MedicineForm({ medicine, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily',
    times: ['09:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    totalQuantity: 30,
    remainingQuantity: 30,
    lowStockThreshold: 5,
    notes: '',
    // Risk Alert Fields
    isCritical: false,
    category: 'other',
    interactsWith: [],
    contraindications: [],
    maxDailyDoses: null,
    minimumGapHours: 4
  });

  const [newInteraction, setNewInteraction] = useState('');
  const [newContraindication, setNewContraindication] = useState('');
  
  useEffect(() => {
    if (medicine) {
      setFormData({
        ...medicine,
        startDate: new Date(medicine.startDate).toISOString().split('T')[0],
        endDate: medicine.endDate ? new Date(medicine.endDate).toISOString().split('T')[0] : '',
        // Ensure new fields have defaults if not present
        isCritical: medicine.isCritical || false,
        category: medicine.category || 'other',
        interactsWith: medicine.interactsWith || [],
        contraindications: medicine.contraindications || [],
        maxDailyDoses: medicine.maxDailyDoses || null,
        minimumGapHours: medicine.minimumGapHours || 4
      });
    }
  }, [medicine]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-adjust times based on frequency
    if (name === 'frequency') {
      if (value === 'once_daily') {
        setFormData(prev => ({ ...prev, times: ['09:00'] }));
      } else if (value === 'twice_daily') {
        setFormData(prev => ({ ...prev, times: ['09:00', '21:00'] }));
      } else if (value === 'thrice_daily') {
        setFormData(prev => ({ ...prev, times: ['09:00', '14:00', '21:00'] }));
      }
    }
  };
  
  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const handleAddInteraction = () => {
    if (newInteraction.trim()) {
      setFormData(prev => ({
        ...prev,
        interactsWith: [...prev.interactsWith, newInteraction.trim()]
      }));
      setNewInteraction('');
    }
  };

  const handleRemoveInteraction = (index) => {
    setFormData(prev => ({
      ...prev,
      interactsWith: prev.interactsWith.filter((_, i) => i !== index)
    }));
  };

  const handleAddContraindication = () => {
    if (newContraindication.trim()) {
      setFormData(prev => ({
        ...prev,
        contraindications: [...prev.contraindications, newContraindication.trim()]
      }));
      setNewContraindication('');
    }
  };

  const handleRemoveContraindication = (index) => {
    setFormData(prev => ({
      ...prev,
      contraindications: prev.contraindications.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (medicine) {
        await medicineAPI.update(medicine._id, formData);
      } else {
        await medicineAPI.create(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert('Error saving medicine');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Aspirin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 100mg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="once_daily">Once Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="thrice_daily">Thrice Daily</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Times *
                </label>
                {formData.times.map((time, index) => (
                  <input
                    key={index}
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Inventory</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Quantity *
                </label>
                <input
                  type="number"
                  name="totalQuantity"
                  value={formData.totalQuantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remaining Quantity *
                </label>
                <input
                  type="number"
                  name="remainingQuantity"
                  value={formData.remainingQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Alert At
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Risk Management Section */}
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <h3 className="text-lg font-semibold mb-4 text-red-800">Risk Management</h3>
            
            <div className="space-y-4">
              {/* Critical Medicine Toggle */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isCritical"
                    checked={formData.isCritical}
                    onChange={(e) => setFormData(prev => ({ ...prev, isCritical: e.target.checked }))}
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      Mark as Critical Medicine
                    </span>
                    <p className="text-xs text-gray-600">
                      Enable alerts if this medicine is missed (e.g., insulin, blood pressure medication)
                    </p>
                  </div>
                </label>
              </div>

              {/* Category and Safety Limits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="other">Other</option>
                    <option value="antibiotic">Antibiotic</option>
                    <option value="painkiller">Painkiller</option>
                    <option value="cardiac">Cardiac</option>
                    <option value="diabetes">Diabetes</option>
                    <option value="blood_pressure">Blood Pressure</option>
                    <option value="vitamin">Vitamin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Daily Doses
                  </label>
                  <input
                    type="number"
                    name="maxDailyDoses"
                    value={formData.maxDailyDoses || ''}
                    onChange={handleChange}
                    placeholder="e.g., 4"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Overdose alert trigger</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Gap (hours)
                  </label>
                  <input
                    type="number"
                    name="minimumGapHours"
                    value={formData.minimumGapHours}
                    onChange={handleChange}
                    min="1"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Between doses</p>
                </div>
              </div>

              {/* Drug Interactions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drug Interactions
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newInteraction}
                    onChange={(e) => setNewInteraction(e.target.value)}
                    placeholder="e.g., Warfarin, Ibuprofen"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInteraction())}
                  />
                  <button
                    type="button"
                    onClick={handleAddInteraction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interactsWith.map((interaction, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                      <span>{interaction}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInteraction(index)}
                        className="text-orange-600 hover:text-orange-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  List medicines that should not be taken with this one
                </p>
              </div>

              {/* Contraindications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraindications (Health Conditions)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newContraindication}
                    onChange={(e) => setNewContraindication(e.target.value)}
                    placeholder="e.g., pregnancy, kidney disease"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddContraindication())}
                  />
                  <button
                    type="button"
                    onClick={handleAddContraindication}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.contraindications.map((contra, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                      <span>{contra}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveContraindication(index)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Health conditions that make this medicine unsafe
                </p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="e.g., Take with food, avoid alcohol"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {medicine ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

            