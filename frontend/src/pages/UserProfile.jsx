import { useEffect, useState } from 'react';
import { userProfileAPI, riskAlertAPI } from '../services/api';
import { User, Save, AlertTriangle } from 'lucide-react';

export default function UserProfile() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    weight: '',
    allergies: [],
    medicalConditions: [],
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    doctorContact: {
      name: '',
      phone: '',
      specialization: ''
    }
  });
  
  const [newAllergy, setNewAllergy] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userProfileAPI.get();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleConditionToggle = (condition) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition]
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      await userProfileAPI.update(profile);
      // Trigger risk detection after profile update
      await riskAlertAPI.triggerDetection();
      setMessage('Profile saved successfully! Risk detection updated.');
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const conditionOptions = [
    'diabetes',
    'hypertension',
    'heart_disease',
    'kidney_disease',
    'liver_disease',
    'asthma',
    'pregnancy',
    'breastfeeding',
    'other'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <User className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={profile.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Medical Conditions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {conditionOptions.map(condition => (
              <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.medicalConditions.includes(condition)}
                  onChange={() => handleConditionToggle(condition)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm capitalize">
                  {condition.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Allergies
          </h2>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="Add allergy..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
            />
            <button
              type="button"
              onClick={handleAddAllergy}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((allergy, index) => (
              <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>{allergy}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.emergencyContact.name}
                onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={profile.emergencyContact.phone}
                onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relation
              </label>
              <input
                type="text"
                value={profile.emergencyContact.relation}
                onChange={(e) => handleNestedChange('emergencyContact', 'relation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Doctor Contact */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Doctor Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={profile.doctorContact.name}
                onChange={(e) => handleNestedChange('doctorContact', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={profile.doctorContact.phone}
                onChange={(e) => handleNestedChange('doctorContact', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={profile.doctorContact.specialization}
                onChange={(e) => handleNestedChange('doctorContact', 'specialization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {message && (
              <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}