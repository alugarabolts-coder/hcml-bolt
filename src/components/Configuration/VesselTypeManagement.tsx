import React, { useState } from 'react';
import { Layers, Plus, Edit, Trash2, X } from 'lucide-react';

interface VesselType {
  id: string;
  name: string;
  description: string;
  maxSpeed: number;
  fuelCapacity: number;
  engineCount: number;
  color: string;
}

const mockVesselTypes: VesselType[] = [
  {
    id: '1',
    name: 'Cargo',
    description: 'General cargo vessels',
    maxSpeed: 20,
    fuelCapacity: 5000,
    engineCount: 2,
    color: '#3b82f6'
  },
  {
    id: '2',
    name: 'Tanker',
    description: 'Oil and liquid cargo tankers',
    maxSpeed: 15,
    fuelCapacity: 8000,
    engineCount: 2,
    color: '#ef4444'
  },
  {
    id: '3',
    name: 'Container',
    description: 'Container cargo ships',
    maxSpeed: 25,
    fuelCapacity: 6000,
    engineCount: 3,
    color: '#10b981'
  },
  {
    id: '4',
    name: 'Ferry',
    description: 'Passenger and vehicle ferries',
    maxSpeed: 18,
    fuelCapacity: 3000,
    engineCount: 2,
    color: '#f59e0b'
  }
];

const colorOptions = [
  { value: '#3b82f6', name: 'Blue' },
  { value: '#ef4444', name: 'Red' },
  { value: '#10b981', name: 'Green' },
  { value: '#f59e0b', name: 'Yellow' },
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#f97316', name: 'Orange' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#84cc16', name: 'Lime' }
];

export default function VesselTypeManagement() {
  const [vesselTypes, setVesselTypes] = useState<VesselType[]>(mockVesselTypes);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<VesselType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxSpeed: 0,
    fuelCapacity: 0,
    engineCount: 1,
    color: '#3b82f6'
  });

  const handleAdd = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      maxSpeed: 0,
      fuelCapacity: 0,
      engineCount: 1,
      color: '#3b82f6'
    });
    setShowModal(true);
  };

  const handleEdit = (type: VesselType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description,
      maxSpeed: type.maxSpeed,
      fuelCapacity: type.fuelCapacity,
      engineCount: type.engineCount,
      color: type.color
    });
    setShowModal(true);
  };

  const handleDelete = (typeId: string) => {
    if (window.confirm('Are you sure you want to delete this vessel type?')) {
      setVesselTypes(vesselTypes.filter(type => type.id !== typeId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType) {
      // Update existing type
      setVesselTypes(vesselTypes.map(type => 
        type.id === editingType.id 
          ? { 
              ...type,
              name: formData.name,
              description: formData.description,
              maxSpeed: formData.maxSpeed,
              fuelCapacity: formData.fuelCapacity,
              engineCount: formData.engineCount,
              color: formData.color
            }
          : type
      ));
    } else {
      // Add new type
      const newType: VesselType = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        maxSpeed: formData.maxSpeed,
        fuelCapacity: formData.fuelCapacity,
        engineCount: formData.engineCount,
        color: formData.color
      };
      setVesselTypes([...vesselTypes, newType]);
    }
    
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button 
          onClick={handleAdd}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Type</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {vesselTypes.map((type) => (
          <div key={type.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="h-24 sm:h-32 flex items-center justify-center"
              style={{ backgroundColor: `${type.color}20` }}
            >
              <Layers 
                size={32}
                className="sm:w-12 sm:h-12"
                style={{ color: type.color }}
              />
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">{type.name}</h3>
                <div className="flex space-x-1 sm:space-x-2">
                  <button 
                    onClick={() => handleEdit(type)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Type"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(type.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Type"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-4">{type.description}</p>
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Speed:</span>
                  <span className="font-medium">{type.maxSpeed} kts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Capacity:</span>
                  <span className="font-medium">{type.fuelCapacity.toLocaleString()} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engine Count:</span>
                  <span className="font-medium">{type.engineCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingType ? 'Edit Vessel Type' : 'Add New Vessel Type'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Speed (knots)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxSpeed}
                  onChange={(e) => setFormData({...formData, maxSpeed: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Capacity (Liters)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.fuelCapacity}
                  onChange={(e) => setFormData({...formData, fuelCapacity: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engine Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.engineCount}
                  onChange={(e) => setFormData({...formData, engineCount: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({...formData, color: color.value})}
                      className={`w-full h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}