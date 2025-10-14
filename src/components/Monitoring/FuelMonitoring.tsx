import React, { useState, useEffect } from 'react';
import { Fuel, TrendingUp, TrendingDown, AlertTriangle, Calendar, Download, MapPin, Clock, BarChart3, Droplets, Gauge } from 'lucide-react';
import { mockVessels, getHistoryData, generateHourlyData } from '../../data/mockData';
import { Vessel, HistoryRecord } from '../../types/vessel';

interface FuelData {
  vesselId: string;
  vesselName: string;
  timestamp: Date;
  fuelLevel: number; // Percentage 0-100
  fuelCapacity: number; // Liters
  currentFuel: number; // Liters
  consumption: number; // L/h
  efficiency: number; // mile/L
  estimatedRange: number; // mile
  location: {
    lat: number;
    lng: number;
  };
}

interface FuelAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: 'low-fuel' | 'high-consumption' | 'efficiency-drop' | 'refuel-needed';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
}

export default function FuelMonitoring() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel>(mockVessels[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelData, setFuelData] = useState<FuelData[]>([]);
  const [fuelAlerts, setFuelAlerts] = useState<FuelAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate fuel data based on vessel history
  const generateFuelData = (vessel: Vessel, date: string): FuelData[] => {
    const historyData = getHistoryData();
    const selectedDateObj = new Date(date);
    const nextDay = new Date(selectedDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const vesselHistory = historyData
      .filter(record => 
        record.vesselId === vessel.id &&
        record.timestamp >= selectedDateObj &&
        record.timestamp < nextDay
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const fuelCapacity = getFuelCapacity(vessel.type);
    let currentFuelLevel = 85; // Start with 85% fuel

    return vesselHistory.map((record, index) => {
      // Simulate fuel consumption based on speed and RPM
      const consumptionRate = calculateConsumption(record.speed, record.rpmPortside);
      const timeDiff = index > 0 ? (record.timestamp.getTime() - vesselHistory[index - 1].timestamp.getTime()) / (1000 * 60 * 60) : 0;
      
      // Decrease fuel level based on consumption
      if (index > 0) {
        const fuelUsed = (consumptionRate * timeDiff / fuelCapacity) * 100;
        currentFuelLevel = Math.max(5, currentFuelLevel - fuelUsed);
      }

      // Add some randomness for realistic variation
      currentFuelLevel += (Math.random() - 0.5) * 2;
      currentFuelLevel = Math.max(5, Math.min(100, currentFuelLevel));

      const currentFuel = (currentFuelLevel / 100) * fuelCapacity;
      const efficiency = record.speed > 0 ? record.speed / consumptionRate : 0;
      const estimatedRange = currentFuel * efficiency;

      return {
        vesselId: vessel.id,
        vesselName: vessel.name,
        timestamp: record.timestamp,
        fuelLevel: currentFuelLevel,
        fuelCapacity,
        currentFuel,
        consumption: consumptionRate,
        efficiency,
        estimatedRange,
        location: {
          lat: record.latitude,
          lng: record.longitude
        }
      };
    });
  };

  const getFuelCapacity = (vesselType: string): number => {
    switch (vesselType) {
      case 'Tanker': return 8000;
      case 'Container': return 6000;
      case 'Cargo': return 5000;
      case 'Ferry': return 3000;
      default: return 5000;
    }
  };

  const calculateConsumption = (speed: number, rpm: number): number => {
    // Base consumption formula considering speed and RPM
    const baseConsumption = 20; // L/h at idle
    const speedFactor = speed * 1.5;
    const rpmFactor = (rpm / 1000) * 8;
    return Math.max(5, baseConsumption + speedFactor + rpmFactor);
  };

  const generateFuelAlerts = (fuelData: FuelData[]): FuelAlert[] => {
    const alerts: FuelAlert[] = [];
    
    fuelData.forEach((data, index) => {
      // Low fuel alert
      if (data.fuelLevel < 20) {
        alerts.push({
          id: `${data.vesselId}-low-fuel-${index}`,
          vesselId: data.vesselId,
          vesselName: data.vesselName,
          type: 'low-fuel',
          severity: data.fuelLevel < 10 ? 'critical' : 'warning',
          message: `Fuel level at ${data.fuelLevel.toFixed(1)}% - ${data.fuelLevel < 10 ? 'Critical' : 'Low'} fuel warning`,
          timestamp: data.timestamp,
          location: data.location
        });
      }

      // High consumption alert
      if (data.consumption > 60) {
        alerts.push({
          id: `${data.vesselId}-high-consumption-${index}`,
          vesselId: data.vesselId,
          vesselName: data.vesselName,
          type: 'high-consumption',
          severity: 'warning',
          message: `High fuel consumption: ${data.consumption.toFixed(1)} L/h`,
          timestamp: data.timestamp,
          location: data.location
        });
      }

      // Efficiency drop alert
      if (index > 0 && data.efficiency < fuelData[index - 1].efficiency * 0.7) {
        alerts.push({
          id: `${data.vesselId}-efficiency-drop-${index}`,
          vesselId: data.vesselId,
          vesselName: data.vesselName,
          type: 'efficiency-drop',
          severity: 'warning',
          message: `Fuel efficiency dropped to ${data.efficiency.toFixed(2)} mile/L`,
          timestamp: data.timestamp,
          location: data.location
        });
      }

      // Refuel needed alert
      if (data.estimatedRange < 50) {
        alerts.push({
          id: `${data.vesselId}-refuel-needed-${index}`,
          vesselId: data.vesselId,
          vesselName: data.vesselName,
          type: 'refuel-needed',
          severity: data.estimatedRange < 20 ? 'critical' : 'warning',
          message: `Estimated range: ${data.estimatedRange.toFixed(0)} mile - Refuel recommended`,
          timestamp: data.timestamp,
          location: data.location
        });
      }
    });

    return alerts.slice(-10); // Keep only latest 10 alerts
  };

  useEffect(() => {
    setLoading(true);
    const data = generateFuelData(selectedVessel, selectedDate);
    const alerts = generateFuelAlerts(data);
    setFuelData(data);
    setFuelAlerts(alerts);
    setLoading(false);
  }, [selectedVessel, selectedDate]);

  const getLatestFuelData = (): FuelData | null => {
    return fuelData.length > 0 ? fuelData[fuelData.length - 1] : null;
  };

  const getAverageFuelData = () => {
    if (fuelData.length === 0) return null;
    
    const avgConsumption = fuelData.reduce((sum, data) => sum + data.consumption, 0) / fuelData.length;
    const avgEfficiency = fuelData.reduce((sum, data) => sum + data.efficiency, 0) / fuelData.length;
    const totalFuelUsed = fuelData.length > 0 ? 
      (fuelData[0].currentFuel - fuelData[fuelData.length - 1].currentFuel) : 0;

    return {
      avgConsumption,
      avgEfficiency,
      totalFuelUsed: Math.max(0, totalFuelUsed)
    };
  };

  const exportFuelReport = () => {
    const csvContent = [
      ['Timestamp', 'Vessel', 'Fuel Level (%)', 'Current Fuel (L)', 'Consumption (L/h)', 'Efficiency (mile/L)', 'Range (mile)', 'Latitude', 'Longitude'],
      ...fuelData.map(data => [
        data.timestamp.toISOString(),
        data.vesselName, 
        data.fuelLevel.toFixed(1),
        data.currentFuel.toFixed(0),
        data.consumption.toFixed(1),
        data.efficiency.toFixed(2),
        data.estimatedRange.toFixed(0),
        data.location.lat.toFixed(6),
        data.location.lng.toFixed(6)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-report-${selectedVessel.name}-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderFuelChart = () => {
    if (fuelData.length === 0) return null;

    const maxConsumption = Math.max(...fuelData.map(d => d.consumption));
    const minConsumption = Math.min(...fuelData.map(d => d.consumption));
    const maxFuelLevel = Math.max(...fuelData.map(d => d.fuelLevel));
    const minFuelLevel = Math.min(...fuelData.map(d => d.fuelLevel));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fuel Level & Consumption Trend</h3>
        
        <div className="h-64 sm:h-80 relative overflow-x-auto">
          <svg className="w-full h-full min-w-96" viewBox="0 0 800 300">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1="60"
                y1={50 + i * 40}
                x2="760"
                y2={50 + i * 40}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Fuel Level Line */}
            <polyline
              points={fuelData
                .map((data, index) => {
                  const x = 60 + (index * 700) / (fuelData.length - 1);
                  const y = 50 + (200 * (100 - data.fuelLevel)) / 100;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              className="drop-shadow-sm"
            />
            
            {/* Consumption Line */}
            <polyline
              points={fuelData
                .map((data, index) => {
                  const x = 60 + (index * 700) / (fuelData.length - 1);
                  const y = 50 + (200 * (maxConsumption - data.consumption)) / (maxConsumption - minConsumption);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="drop-shadow-sm"
            />
            
            {/* Data points for fuel level */}
            {fuelData.map((data, index) => {
              const x = 60 + (index * 700) / (fuelData.length - 1);
              const y = 50 + (200 * (100 - data.fuelLevel)) / 100;
              return (
                <circle
                  key={`fuel-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${data.timestamp.toLocaleTimeString()}: ${data.fuelLevel.toFixed(1)}%`}</title>
                </circle>
              );
            })}
            
            {/* Y-axis labels */}
            {[0, 20, 40, 60, 80, 100].map((value, i) => (
              <text
                key={i}
                x="50"
                y={58 + (200 * (100 - value)) / 100}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {value}%
              </text>
            ))}
            
            {/* X-axis labels */}
            {fuelData.filter((_, i) => i % Math.ceil(fuelData.length / 8) === 0).map((data, i) => (
              <text
                key={i}
                x={60 + (i * Math.ceil(fuelData.length / 8) * 700) / (fuelData.length - 1)}
                y="280"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {data.timestamp.toLocaleTimeString()}
              </text>
            ))}
            
            {/* Legend */}
            <g transform="translate(600, 20)">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#3b82f6" strokeWidth="3" />
              <text x="25" y="5" className="text-xs fill-gray-600">Fuel Level (%)</text>
              <line x1="0" y1="15" x2="20" y2="15" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="25" y="20" className="text-xs fill-gray-600">Consumption (L/h)</text>
            </g>
          </svg>
        </div>
      </div>
    );
  };

  const latestData = getLatestFuelData();
  const avgData = getAverageFuelData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading fuel monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
        </div>

        <button
          onClick={exportFuelReport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Current Fuel Level</h3>
            <Droplets className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {latestData ? `${latestData.fuelLevel.toFixed(1)}%` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            {latestData ? `${latestData.currentFuel.toFixed(0)} L` : 'No data'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Current Consumption</h3>
            <Gauge className="text-orange-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {latestData ? `${latestData.consumption.toFixed(1)}` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">L/h</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Fuel Efficiency</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {latestData ? `${latestData.efficiency.toFixed(1)}` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">mile/L</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Estimated Range</h3>
            <MapPin className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {latestData ? `${latestData.estimatedRange.toFixed(0)}` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">mile</p>
        </div>
      </div>

      {/* Chart */}
      {renderFuelChart()}

      {/* Daily Summary & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Daily Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Fuel Summary</h3>
          {avgData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Average Consumption</span>
                <span className="text-lg font-bold text-blue-600">{avgData.avgConsumption.toFixed(1)} L/h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Average Efficiency</span>
                <span className="text-lg font-bold text-green-600">{avgData.avgEfficiency.toFixed(2)} mile/L</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Fuel Used</span>
                <span className="text-lg font-bold text-orange-600">{avgData.totalFuelUsed.toFixed(0)} L</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Fuel Capacity</span>
                <span className="text-lg font-bold text-purple-600">{latestData?.fuelCapacity.toLocaleString()} L</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No data available for selected date</p>
          )}
        </div>

        {/* Fuel Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fuel Alerts</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {fuelAlerts.length > 0 ? (
              fuelAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle
                          size={16}
                          className={alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}
                        />
                        <span className={`text-sm font-medium ${
                          alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {alert.type.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        alert.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{alert.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={12} />
                          <span>{alert.location.lat.toFixed(3)}, {alert.location.lng.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No fuel alerts for selected date</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Fuel History Table */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Fuel History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumption
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fuelData.slice(-20).reverse().map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${
                            data.fuelLevel > 50 ? 'bg-green-500' :
                            data.fuelLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${data.fuelLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {data.fuelLevel.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.consumption.toFixed(1)} L/h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.efficiency.toFixed(2)} mile/L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.estimatedRange.toFixed(0)} mile
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}