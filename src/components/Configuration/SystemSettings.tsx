import React, { useState } from 'react';
import { Settings, Building, Palette, Upload, X, Eye } from 'lucide-react';
import { useSystemConfig } from '../../contexts/SystemConfigContext';

const themeColors = [
  { name: 'Blue', value: '#1e40af', bg: 'bg-blue-700' },
  { name: 'Green', value: '#059669', bg: 'bg-green-600' },
  { name: 'Purple', value: '#7c3aed', bg: 'bg-purple-600' },
  { name: 'Red', value: '#dc2626', bg: 'bg-red-600' },
  { name: 'Orange', value: '#ea580c', bg: 'bg-orange-600' },
  { name: 'Teal', value: '#0d9488', bg: 'bg-teal-600' },
  { name: 'Indigo', value: '#4338ca', bg: 'bg-indigo-600' },
  { name: 'Pink', value: '#db2777', bg: 'bg-pink-600' }
];

export default function SystemSettings() {
  const { config, updateConfig, resetConfig } = useSystemConfig();
  const [showPreview, setShowPreview] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        updateConfig({ companyLogo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setImageFile(null);
    setImagePreview('');
    updateConfig({ companyLogo: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400' });
  };

  const handleSave = async () => {
    setSaveMessage('');
    
    // Config is already saved via updateConfig, just show message
    setSaveMessage('Settings saved successfully!');
    
    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      resetConfig();
      setImageFile(null);
      setImagePreview('');
      setSaveMessage('Settings reset to default');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">System Settings</h2>
          <p className="text-sm text-gray-600">Configure company branding and theme</p>
        </div>
        <div className="flex space-x-3">
          {saveMessage && (
            <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
              {saveMessage}
            </div>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            <Eye size={16} />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            <X size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Settings size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Company Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => updateConfig({ companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                
                {/* Logo Preview */}
                {config.companyLogo && (
                  <div className="mb-4 relative inline-block">
                    <img 
                      src={config.companyLogo} 
                      alt="Company logo preview"
                      className="w-24 h-24 object-contain rounded-lg border border-gray-300 bg-gray-50 p-2"
                    />
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm"
                      title="Remove logo"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* Logo Upload */}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-blue-50 border border-blue-200 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors flex items-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>{config.companyLogo ? 'Change Logo' : 'Upload Logo'}</span>
                  </label>
                  
                  {/* Alternative: URL Input */}
                  <span className="text-gray-500">or</span>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={config.companyLogo.startsWith('data:') ? '' : config.companyLogo}
                      onChange={(e) => {
                        updateConfig({ companyLogo: e.target.value });
                        if (e.target.value && !imageFile) {
                          setImagePreview('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Or paste logo URL"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image file or paste an image URL. Recommended size: 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Theme Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Theme Configuration</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Theme Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {themeColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateConfig({ themeColor: color.value })}
                    className={`relative w-full h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                      config.themeColor === color.value ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-300'
                    } ${color.bg}`}
                    title={color.name}
                  >
                    {config.themeColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Custom Color Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Color (Hex)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => updateConfig({ themeColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.themeColor}
                    onChange={(e) => updateConfig({ themeColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="#1e40af"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Feature Settings</h3>
            </div>
            <div className="flex items-center space-x-3">
              <label className="block text-sm font-medium text-gray-700">
                Enable Fuel Monitoring
              </label>
              <input
                type="checkbox"
                checked={config.fuelMonitoringEnabled ?? true}
                onChange={e => updateConfig({ fuelMonitoringEnabled: e.target.checked })}
                className="ml-2 w-5 h-5 accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
            
            {/* Login Page Preview */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Login Page</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                  <div className="text-center">
                    <div 
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                      style={{ backgroundColor: config.themeColor }}
                    >
                      <img 
                        src={config.companyLogo} 
                        alt="Logo preview" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <h1 className="text-lg font-bold text-gray-800">E-Merti</h1>
                    <h1 className="text-lg font-bold text-gray-800">{config.companyName}</h1>
                    <p className="text-gray-600 text-sm">Vessel Monitoring System</p>
                    <div className="mt-2 text-center">
                      <p className="text-gray-500 text-xs">Powered by</p>
                      <span className="text-blue-600 text-xs font-semibold">alugara.id</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Sidebar</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="p-4 text-white"
                  style={{ backgroundColor: config.themeColor }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={config.companyLogo} 
                      alt="Logo preview" 
                      className="w-8 h-8 object-contain"
                    />
                    <div>
                      <h1 className="text-lg font-bold text-orange-400">E-Merti</h1>
                      <p className="text-blue-300 text-xs">{config.companyName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-orange-600 text-white px-3 py-2 rounded text-sm">
                      Dashboard
                    </div>
                    <div className="text-blue-200 px-3 py-2 text-sm">
                      Daily Report
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-blue-700 text-center">
                    <p className="text-blue-300 text-xs">Powered by</p>
                    <span className="text-orange-400 text-sm font-semibold">alugara.id</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Configuration Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Company Name:</span>
            <p className="font-medium text-gray-800">{config.companyName}</p>
          </div>
          <div>
            <span className="text-gray-600">Logo:</span>
            <p className="font-medium text-gray-800">
              {config.companyLogo.startsWith('data:') ? 'Custom uploaded image' : 'Default E-Merti logo'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Theme Color:</span>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: config.themeColor }}
              ></div>
              <span className="font-medium text-gray-800 font-mono">{config.themeColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}