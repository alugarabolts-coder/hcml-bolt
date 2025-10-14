import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Navigation, Clock } from 'lucide-react';
import { mockVessels, fetchVesselsFromBackend } from '../../data/mockData';
import { Vessel } from '../../types/vessel';
import VesselTracking from './VesselTracking';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function VesselMap() {
  const [vessels, setVessels] = useState<Vessel[]>(mockVessels);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingVesselId, setTrackingVesselId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVessels = async () => {
      try {
        const dbVessels = await fetchVesselsFromBackend();
        setVessels(dbVessels);
      } catch (error) {
        console.error('Failed to load vessels from database:', error);
        setVessels(mockVessels);
      } finally {
        setLoading(false);
      }
    };

    loadVessels();
  }, []);

  const handleShowTracking = (vesselId: string) => {
    setTrackingVesselId(vesselId);
    setShowTracking(true);
  };

  const handleBackToMap = () => {
    setShowTracking(false);
    setTrackingVesselId('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Warning': return '#f59e0b';
      case 'Critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const createVesselIcon = (vessel: Vessel) => {
    const color = getStatusColor(vessel.status);
    
    return divIcon({
      html: `
        <div style="position: relative; width: 40px; height: 40px;">
          <!-- Vessel icon with rotation -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${vessel.heading}deg);
            width: 32px;
            height: 32px;
            background: white;
            border: 3px solid ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <img src="/ship.png" alt="Vessel" style="width: 20px; height: 20px; object-fit: contain;" />
          </div>
          <!-- Status indicator -->
          <div style="
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
        </div>
      `,
      className: 'vessel-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  if (showTracking) {
    return <VesselTracking selectedVesselId={trackingVesselId} onBack={handleBackToMap} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading vessel data...</p>
        </div>
      </div>
    );
  }

  // Map center (Madura Island area)
  const mapCenter: [number, number] = [-7.2, 113.8];

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[70vh] lg:h-[80vh] relative">
          <MapContainer
            center={mapCenter}
            zoom={9}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {vessels.map((vessel) => (
              <Marker
                key={vessel.id}
                position={[vessel.latitude, vessel.longitude]}
                icon={createVesselIcon(vessel)}
                eventHandlers={{
                  click: () => setSelectedVessel(vessel)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-48">
                    <h4 className="text-base font-semibold text-gray-800 mb-2">{vessel.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{vessel.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          vessel.status === 'Active' ? 'text-green-600' :
                          vessel.status === 'Warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {vessel.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span className="font-medium">{vessel.speed.toFixed(1)} kts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heading:</span>
                        <span className="font-medium">{vessel.heading}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Position:</span>
                        <span className="font-medium text-xs">
                          {vessel.latitude.toFixed(4)}, {vessel.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span className="font-medium text-xs">
                          {vessel.lastUpdate
                            ? new Date(vessel.lastUpdate).toLocaleTimeString()
                            : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowTracking(vessel.id);
                        }}
                        className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Navigation size={14} />
                        <span>Show Tracking</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-3 z-10">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Fleet Status</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active ({vessels.filter(v => v.status === 'Active').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Warning ({vessels.filter(v => v.status === 'Warning').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical ({vessels.filter(v => v.status === 'Critical').length})</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
              Total: {vessels.length} vessels
            </div>
          </div>

          {/* Map Info */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm p-3 z-10">
            <div className="text-xs text-gray-600">
              <div className="flex items-center space-x-1 mb-1">
                <Clock size={12} />
                <span>Real-time tracking</span>
              </div>
              <div>Center: {mapCenter[0]}, {mapCenter[1]}</div>
              <div className="mt-1 text-gray-500">Click vessel for details</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}