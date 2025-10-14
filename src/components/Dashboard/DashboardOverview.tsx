import { useState, useEffect } from 'react';
import { Ship, Activity, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import StatCard from './StatCard';
import { getDashboardStats, getHistoryData, fetchVesselsFromBackend } from '../../data/mockData';
import { Vessel } from '../../types/vessel';

export default function DashboardOverview() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVessels = async () => {
      try {
        const dbVessels = await fetchVesselsFromBackend();
        console.log('dbVessels:', dbVessels); // Debug log
        setVessels(Array.isArray(dbVessels) ? dbVessels : []);
      } catch (error) {
        console.error('Failed to load vessels from backend:', error);
        setVessels([]); // fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadVessels();
  }, []);

  const stats = getDashboardStats(vessels);
  const historyData = getHistoryData();

  // Get latest data for each vessel from history
  const getLatestVesselData = () => {
    const vesselMap = new Map();

    // Get the most recent record for each vessel
    historyData.forEach(record => {
      if (!vesselMap.has(record.vesselId) ||
          record.timestamp > vesselMap.get(record.vesselId).timestamp) {
        vesselMap.set(record.vesselId, record);
      }
    });

    // Merge with vessel info from backend
    return vessels.map(vessel => {
      const latestData = vesselMap.get(vessel.id);
      if (latestData) {
        return {
          ...vessel,
          speed: parseFloat(latestData.speed.toFixed(2)),
          heading: Math.round(latestData.heading),
          position: {
            lat: parseFloat(latestData.latitude.toFixed(2)),
            lng: parseFloat(latestData.longitude.toFixed(2))
          },
          rpmPortside: Math.round(latestData.rpmPortside),
          rpmStarboard: Math.round(latestData.rpmStarboard),
          rpmCenter: Math.round(latestData.rpmCenter),
          lastUpdate: latestData.timestamp
        };
      }
      return vessel;
    });
  };

  const vesselsWithLatestData = getLatestVesselData();

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

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Vessels"
          value={stats.totalVessels}
          icon={Ship}
          color="blue"
          subtitle="Fleet size"
        />
        <StatCard
          title="Active Vessels"
          value={stats.activeVessels}
          icon={Activity}
          color="green"
          subtitle="Currently operational"
        />
        <StatCard
          title="Warning Status"
          value={stats.warningCount}
          icon={AlertTriangle}
          color="yellow"
          subtitle="Need attention"
        />
        <StatCard
          title="Critical Status"
          value={stats.criticalCount}
          icon={AlertCircle}
          color="red"
          subtitle="Immediate action required"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Fleet Status Overview</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {vesselsWithLatestData.map((vessel) => (
                <div key={vessel.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      vessel.status === 'Active' ? 'bg-green-500' :
                      vessel.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-800">{vessel.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{vessel.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-gray-800">
                      {typeof vessel.speed === 'number' ? vessel.speed.toFixed(2) : '--'} kts
                    </p>
                    <p className="text-xs text-gray-500">{vessel.heading}°</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Alerts</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Engine RPM Warning</p>
                  <p className="text-xs text-gray-600">Maritim Jaya - Starboard engine RPM below threshold</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={12} className="mr-1" />
                    <span>2 minutes ago</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Critical Speed Drop</p>
                  <p className="text-xs text-gray-600">Nusantara Express - Speed below 6 knots</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={12} className="mr-1" />
                    <span>5 minutes ago</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity className="text-blue-600 mt-0.5" size={16} />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Position Update</p>
                  <p className="text-xs text-gray-600">Sinar Bahari - Entered Jakarta port area</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={12} className="mr-1" />
                    <span>8 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}