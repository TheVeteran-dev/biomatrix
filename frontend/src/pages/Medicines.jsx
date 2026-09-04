import { useEffect, useState } from 'react';
import { medicineAPI } from '../services/api';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import MedicineForm from '../components/Medicines/MedicineForm';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  useEffect(() => {
    loadMedicines();
  }, []);
  
  const loadMedicines = async () => {
    try {
      const response = await medicineAPI.getAll();
      setMedicines(response.data);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineAPI.delete(id);
        loadMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };
  
  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setEditingMedicine(null);
    loadMedicines();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medicines</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Medicine
        </button>
      </div>
      
      {showForm && (
        <MedicineForm
          medicine={editingMedicine}
          onClose={handleFormClose}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicines.map((medicine) => (
          <div key={medicine._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{medicine.name}</h3>
                <p className="text-gray-600">{medicine.dosage}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(medicine)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(medicine._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Frequency:</span>
                <span className="font-semibold">{medicine.frequency.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Times:</span>
                <span className="font-semibold">{medicine.times.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining:</span>
                <span className={`font-semibold ${medicine.remainingQuantity <= medicine.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                  {medicine.remainingQuantity} / {medicine.totalQuantity}
                </span>
              </div>
              {medicine.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <p className="text-gray-600 text-xs">{medicine.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {medicines.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No medicines added yet</p>
        </div>
      )}
    </div>
  );
}