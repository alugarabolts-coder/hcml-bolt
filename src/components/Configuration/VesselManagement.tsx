import React, { useState } from 'react';
import { Ship, Plus, Edit, Trash2, MapPin, X, Wifi, WifiOff } from 'lucide-react';
import { mockVessels } from '../../data/mockData';
import { Vessel } from '../../types/vessel';

export default function VesselManagement() {
  const [vessels, setVessels] = useState<Vessel[]>(mockVessels);
  const [showModal, setShowModal] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'Cargo',
    status: 'Active' as 'Active' | 'Inactive' | 'Warning' | 'Critical',
    image: '',
    owner: '',
    vtsActive: true,
    emsActive: true,
    fmsActive: true,
    vesselKey: '',
    minSpeed: 0,
    maxSpeed: 0,
    minRPM: 0,
    maxRPM: 0,
  });

  // Get default specs based on vessel type
  const getDefaultSpecs = (vesselType: string) => {
    switch (vesselType) {
      case 'Tanker':
        return { minSpeed: 8, maxSpeed: 18, minRPM: 800, maxRPM: 2200 };
      case 'Container':
        return { minSpeed: 12, maxSpeed: 25, minRPM: 1200, maxRPM: 2800 };
      case 'Cargo':
        return { minSpeed: 10, maxSpeed: 20, minRPM: 1000, maxRPM: 2500 };
      case 'Ferry':
        return { minSpeed: 8, maxSpeed: 22, minRPM: 900, maxRPM: 2400 };
      default:
        return { minSpeed: 8, maxSpeed: 20, minRPM: 800, maxRPM: 2500 };
    }
  };
  const handleAdd = () => {
    const defaultSpecs = getDefaultSpecs('Cargo');
    setEditingVessel(null);
    setFormData({
      name: '',
      type: 'Cargo',
      status: 'Active',
      image: '',
      owner: '',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: '',
      minSpeed: defaultSpecs.minSpeed,
      maxSpeed: defaultSpecs.maxSpeed,
      minRPM: defaultSpecs.minRPM,
      maxRPM: defaultSpecs.maxRPM,
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (vessel: Vessel) => {
    const defaultSpecs = getDefaultSpecs(vessel.type);
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      type: vessel.type,
      status: vessel.status,
      image: vessel.image || '',
      owner: vessel.owner,
      vtsActive: vessel.vtsActive,
      emsActive: vessel.emsActive,
      fmsActive: vessel.fmsActive,
      vesselKey: vessel.vesselKey,
      minSpeed: (vessel as any).minSpeed || defaultSpecs.minSpeed,
      maxSpeed: (vessel as any).maxSpeed || defaultSpecs.maxSpeed,
      minRPM: (vessel as any).minRPM || defaultSpecs.minRPM,
      maxRPM: (vessel as any).maxRPM || defaultSpecs.maxRPM,
    });
    setImageFile(null);
    setImagePreview(vessel.image || '');
    setShowModal(true);
  };

  // Handle vessel type change to update default specs
  const handleTypeChange = (newType: string) => {
    const defaultSpecs = getDefaultSpecs(newType);
    setFormData(prev => ({
      ...prev,
      type: newType,
      minSpeed: defaultSpecs.minSpeed,
      maxSpeed: defaultSpecs.maxSpeed,
      minRPM: defaultSpecs.minRPM,
      maxRPM: defaultSpecs.maxRPM,
    }));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({...formData, image: ''});
  };

  const handleDelete = (vesselId: string) => {
    if (window.confirm('Are you sure you want to delete this vessel?')) {
      setVessels(vessels.filter(vessel => vessel.id !== vesselId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle image - in real app, you'd upload to server and get URL
    const imageUrl = imageFile ? imagePreview : formData.image;
    
    if (editingVessel) {
      // Update existing vessel
      setVessels(vessels.map(vessel => 
        vessel.id === editingVessel.id 
          ? { 
              ...vessel,
              name: formData.name,
              type: formData.type,
              status: formData.status,
              image: imageUrl,
              owner: formData.owner,
              vtsActive: formData.vtsActive,
              emsActive: formData.emsActive,
              fmsActive: formData.fmsActive,
              vesselKey: formData.vesselKey,
              lastUpdate: new Date()
            }
          : vessel
      ));
    } else {
      // Add new vessel
      const newVessel: Vessel = {
        id: `V${String(vessels.length + 1).padStart(3, '0')}`,
        name: formData.name,
        type: formData.type,
        status: formData.status,
        image: imageUrl,
        owner: formData.owner,
        vtsActive: formData.vtsActive,
        emsActive: formData.emsActive,
        fmsActive: formData.fmsActive,
        vesselKey: formData.vesselKey,
        position: { lat: -7.0, lng: 113.8 }, // Default position
        speed: 0,
        heading: 0,
        rpmPortside: 0,
        rpmStarboard: 0,
        rpmCenter: 0,
        fuelConsumption: 0,
        lastUpdate: new Date()
      };
      setVessels([...vessels, newVessel]);
    }
    
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button 
          onClick={handleAdd}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Vessel</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vessel
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Owner
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Specifications
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Sensors
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vessels.map((vessel) => (
                <tr key={vessel.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16">
                        {vessel.image ? (
                          <img 
                            src={vessel.image} 
                            alt={vessel.name}
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-blue-100 flex items-center justify-center border border-gray-200">
                            <Ship className="text-blue-600" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{vessel.name}</div>
                        <div className="text-xs text-gray-500">{vessel.id} • {vessel.type}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{vessel.owner}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-xs sm:text-sm text-gray-900">{vessel.owner}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vessel.status)}`}>
                      {vessel.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-medium">
                          {(vessel as any).minSpeed || getDefaultSpecs(vessel.type).minSpeed}-{(vessel as any).maxSpeed || getDefaultSpecs(vessel.type).maxSpeed} kts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">RPM:</span>
                        <span className="font-medium">
                          {(vessel as any).minRPM || getDefaultSpecs(vessel.type).minRPM}-{(vessel as any).maxRPM || getDefaultSpecs(vessel.type).maxRPM}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="flex space-x-2">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                        vessel.vtsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vessel.vtsActive ? <Wifi size={12} /> : <WifiOff size={12} />}
                        <span>VTS</span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                        vessel.emsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vessel.emsActive ? <Wifi size={12} /> : <WifiOff size={12} />}
                        <span>EMS</span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                        vessel.fmsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vessel.fmsActive ? <Wifi size={12} /> : <WifiOff size={12} />}
                        <span>FMS</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1 sm:space-x-2">
                      <button 
                        onClick={() => handleEdit(vessel)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Vessel"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(vessel.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Vessel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingVessel ? 'Edit Vessel' : 'Add New Vessel'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Vessel Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vessel Name *
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
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cargo">Cargo</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Container">Container</option>
                      <option value="Ferry">Ferry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Warning">Warning</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner *
                    </label>
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => setFormData({...formData, owner: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vessel Image
                    </label>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mb-4 relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Vessel preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleImageDelete}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm"
                          title="Delete image"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    {/* Image Upload */}
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="vessel-image-upload"
                      />
                      <label
                        htmlFor="vessel-image-upload"
                        className="cursor-pointer bg-blue-50 border border-blue-200 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </label>
                      
                      {/* Alternative: URL Input */}
                      <span className="text-gray-500">or</span>
                      <div className="flex-1">
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData({...formData, image: e.target.value});
                            if (e.target.value && !imageFile) {
                              setImagePreview(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Or paste image URL"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload an image file or paste an image URL
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vessel Key *
                    </label>
                    <input
                      type="text"
                      value={formData.vesselKey}
                      onChange={(e) => setFormData({...formData, vesselKey: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="e.g., SB001-2024-CARGO"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vessel Specifications */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Vessel Specifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Speed (knots) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.minSpeed}
                      onChange={(e) => setFormData({...formData, minSpeed: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Speed (knots) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.maxSpeed}
                      onChange={(e) => setFormData({...formData, maxSpeed: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum RPM *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={formData.minRPM}
                      onChange={(e) => setFormData({...formData, minRPM: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum RPM *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={formData.maxRPM}
                      onChange={(e) => setFormData({...formData, maxRPM: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Spesifikasi ini akan digunakan untuk rekomendasi optimal di Daily Report
                </p>
              </div>
              {/* Sensor Configuration */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Sensor Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="vtsActive"
                      checked={formData.vtsActive}
                      onChange={(e) => setFormData({...formData, vtsActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="vtsActive" className="text-sm font-medium text-gray-700">
                      VTS Active (GPS Sensor)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emsActive"
                      checked={formData.emsActive}
                      onChange={(e) => setFormData({...formData, emsActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="emsActive" className="text-sm font-medium text-gray-700">
                      EMS Active (Engine Sensor)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="fmsActive"
                      checked={formData.fmsActive}
                      onChange={(e) => setFormData({...formData, fmsActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="fmsActive" className="text-sm font-medium text-gray-700">
                      FMS Active (Fuel Sensor)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingVessel ? 'Update Vessel' : 'Create Vessel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}