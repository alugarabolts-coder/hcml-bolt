import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { MapPin, Navigation as NavigationIcon, Clock, Route, Calendar, Download, ArrowLeft, X } from 'lucide-react';
import { mockVessels, getHistoryData } from '../../data/mockData';
import { Vessel, HistoryRecord } from '../../types/vessel';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VesselTrackingProps {
  selectedVesselId?: string;
  onBack?: () => void;
}

export default function VesselTracking({ selectedVesselId, onBack }: VesselTrackingProps) {
  const [selectedVessel, setSelectedVessel] = useState<Vessel>(
    selectedVesselId ? mockVessels.find(v => v.id === selectedVesselId) || mockVessels[0] : mockVessels[0]
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trackingData, setTrackingData] = useState<HistoryRecord[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<HistoryRecord | null>(null);
  const [zoomLevel, setZoomLevel] = useState(10);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Get tracking data for selected vessel and date
    const allHistory = getHistoryData();
    const selectedDateObj = new Date(selectedDate);
    const nextDay = new Date(selectedDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const vesselTrackingData = allHistory
      .filter(record => 
        String(record.vesselId) === String(selectedVessel.id) &&
        record.timestamp >= selectedDateObj &&
        record.timestamp < nextDay
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    setTrackingData(vesselTrackingData);
  }, [selectedVessel.id, selectedDate]);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const createTrackingPointIcon = (record: HistoryRecord, index: number, isStart: boolean, isEnd: boolean) => {
    const pointColor = isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6';
    const pointSize = isStart || isEnd ? 16 : 12;
    
    return divIcon({
      html: `
        <div style="position: relative; width: 32px; height: 32px;">
          <!-- Point marker -->
          
          <!-- Heading arrow -->
          <div style="
            position: absolute; 
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${record.heading}deg);
            width: 20px;
            height: 20px;
            opacity: 1;
            z-index: 3;
          ">
            <img src="/arrow3.png" alt="Heading" style="width: 20px; height: 20px;" />
          </div>
        </div>
      `,
      className: 'tracking-point-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600';
      case 'Warning': return 'text-yellow-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const exportTrackingData = () => {
    const csvContent = [
      ['Timestamp', 'Latitude', 'Longitude', 'Speed (kts)', 'Heading (°)', 'RPM Portside', 'RPM Starboard', 'RPM Center'],
      ...trackingData.map(record => [
        record.timestamp.toISOString(),
        record.latitude.toFixed(6),
        record.longitude.toFixed(6),
        record.speed.toFixed(1),
        record.heading.toString(),
        record.rpmPortside.toFixed(2),
        record.rpmStarboard.toFixed(2),
        record.rpmCenter.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedVessel.name}-tracking-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRouteCenter = (data: HistoryRecord[]): [number, number] => {
    const latitudes = data.map(record => record.latitude);
    const longitudes = data.map(record => record.longitude);
    const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
    const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
    return [centerLat, centerLng];
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Map</span>
            </button>
          )}
          {/* <div>
            <h2 className="text-xl font-bold text-gray-800">Vessel Tracking</h2>
            <p className="text-sm text-gray-600">Journey path and movement history</p>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Vessel
            </label>
            <select
              value={selectedVessel.id}
              onChange={(e) => {
                const vessel = mockVessels.find(v => v.id === e.target.value);
                if (vessel) setSelectedVessel(vessel);
              }}
              className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {mockVessels.map((vessel) => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name} ({vessel.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-6 sm:mt-0">
            <div className="flex items-center space-x-2">
              <Route size={16} />
              <span>{trackingData.length} tracking points</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            <Route size={16} />
            <span className="hidden sm:inline">{showDetails ? 'Hide Details' : 'Show Details'}</span>
          </button>
          <button
            onClick={exportTrackingData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
      </div> */}

      {/* Map and Details */}
      <div className={`grid ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {/* Map */}
        <div className={showDetails ? 'lg:col-span-2' : ''}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-[70vh] lg:h-[80vh] relative">
              <MapContainer
                ref={mapRef}
                center={trackingData.length > 0 ? getRouteCenter(trackingData) : [-7.2, 113.8]}
                zoom={10}
                whenReady={() => {
                  const mapInstance = mapRef.current;
                  if (mapInstance) {
                    mapInstance.on('zoomend', () => {
                      setZoomLevel(mapInstance.getZoom());
                    });
                    setZoomLevel(mapInstance.getZoom());
                  }
                }}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Journey path */}
                {trackingData.length > 1 && (
                  <Polyline
                    positions={trackingData.map(record => [record.latitude, record.longitude])}
                    color="#073799ff"
                    weight={5}
                    opacity={0.8}
                    dashArray="10,5"
                  />
                )}
                
                {/* Tracking points */}
                {trackingData.map((record, index) => {
                  const isStart = index === 0;
                  const isEnd = index === trackingData.length - 1;
                  
                  return (
                    <Marker
                      key={record.id}
                      position={[record.latitude, record.longitude]}
                      icon={createTrackingPointIcon(record, index, isStart, isEnd)}
                      eventHandlers={{
                        click: () => setSelectedPoint(record)
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-48">
                          <h4 className="text-base font-semibold text-gray-800 mb-2">
                            Tracking Point {index + 1}
                            {isStart && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">START</span>}
                            {isEnd && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">END</span>}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Time:</span>
                              <span className="font-medium">{record.timestamp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Speed:</span>
                              <span className="font-medium">{record.speed.toFixed(1)} kts</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Heading:</span>
                              <span className="font-medium">{record.heading.toFixed(1)}°</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Position:</span>
                              <span className="font-medium text-xs">
                                {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
              
              {/* Legend */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-3 z-10">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Journey Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Start Point</span>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-blue-600 flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <span>Tracking Points</span>
                  </div> */}
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>End Point</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 border-t-2 border-dashed border-blue-500"></div>
                    <span>Journey Path</span>
                  </div>
                  {/* <div className="flex items-center space-x-2"> */}
                    {/* <div className="flex items-center">
                      <div className="w-4 h-0.5 bg-gray-700"></div>
                      <div 
                        className="w-0 h-0 ml-0.5"
                        style={{
                          borderLeft: '3px solid #374151',
                          borderTop: '1.5px solid transparent',
                          borderBottom: '1.5px solid transparent'
                        }}
                      ></div>
                    </div> */}
                    {/* <span>Vessel Heading</span> */}
                  {/* </div> */}
                  <div className="pt-1 border-t border-gray-200 mt-2">
                    <span className="text-gray-600">Total: {trackingData.length} points</span>
                    <div className="text-xs text-gray-500 mt-1">Click any point for details</div>
                  </div>
                </div>
              </div>

              {/* Journey Stats */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm p-3 z-10">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Journey Stats</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {trackingData.length > 0 ? 
                        Math.round((trackingData[trackingData.length - 1]?.timestamp.getTime() - trackingData[0]?.timestamp.getTime()) / (1000 * 60 * 60)) + 'h' 
                        : '0h'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Speed:</span>
                    <span className="font-medium">
                      {trackingData.length > 0 ? 
                        (trackingData.reduce((sum, r) => sum + r.speed, 0) / trackingData.length).toFixed(1) + ' kts'
                        : '0 kts'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Speed:</span>
                    <span className="font-medium">
                      {trackingData.length > 0 ? 
                        Math.max(...trackingData.map(r => r.speed)).toFixed(1) + ' kts'
                        : '0 kts'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {showDetails && (
          <div className="space-y-6">
            {/* Journey Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Journey Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium">
                    {trackingData[0]?.timestamp.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Time:</span>
                  <span className="font-medium">
                    {trackingData[trackingData.length - 1]?.timestamp.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-medium">{trackingData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Speed:</span>
                  <span className="font-medium">
                    {trackingData.length > 0 ? 
                      (trackingData.reduce((sum, r) => sum + r.speed, 0) / trackingData.length).toFixed(1) + ' kts'
                      : '0 kts'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Tracking Points */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Points</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trackingData.slice(-10).reverse().map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <span className="font-medium">{record.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                        <MapPin size={12} />
                        <span>{record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{record.speed.toFixed(1)} kts</div>
                      <div className="text-xs text-gray-600">{record.heading}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Point Details Modal */}
      {selectedPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Tracking Point Details
              </h3>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <p className="text-sm text-gray-900">{selectedPoint.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Point Number</label>
                  <p className="text-sm text-gray-900">
                    {trackingData.findIndex(r => r.id === selectedPoint.id) + 1} of {trackingData.length}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedPoint.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedPoint.longitude.toFixed(6)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Speed</label>
                  <p className="text-sm text-gray-900">{selectedPoint.speed.toFixed(1)} knots</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heading</label>
                  <p className="text-sm text-gray-900">{selectedPoint.heading.toFixed(1)}°</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Engine RPM</label>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Portside:</span>
                    <p className="font-medium">{selectedPoint.rpmPortside.toFixed(0)} RPM</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Starboard:</span>
                    <p className="font-medium">{selectedPoint.rpmStarboard.toFixed(0)} RPM</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Center:</span>
                    <p className="font-medium">{selectedPoint.rpmCenter.toFixed(0)} RPM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setSelectedPoint(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}