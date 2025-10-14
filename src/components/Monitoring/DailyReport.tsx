import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, BarChart3 } from 'lucide-react';
import { getMockVessels, generateHourlyData } from '../../data/mockData';
import { Vessel } from '../../types/vessel';

export default function DailyReport() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<{
    hours: string[];
    speedData: number[];
    rpmData: number[];
    fuelData: number[];
    maxSpeed: string;
  }>({
    hours: [],
    speedData: [],
    rpmData: [],
    fuelData: [],
    maxSpeed: ''
  });

  // Ambil data vessel dari backend
  useEffect(() => {
    getMockVessels().then(vs => {
      setVessels(vs);
      if (vs.length > 0) setSelectedVessel(vs[0]);
    });
  }, []);

  // Ambil data hourly setiap kali vessel berubah
  useEffect(() => {
    let isMounted = true;
    if (selectedVessel && selectedDate) {
      generateHourlyData(selectedVessel, selectedDate).then(result => {
        if (isMounted) setData(result);
      });
    }
    return () => { isMounted = false; };
  }, [selectedVessel, selectedDate]);

  const getChartData = (type: 'speed' | 'rpm' | 'fuel') => {
    switch (type) {
      case 'speed':
        return {
          label: 'Speed (knots)',
          data: data.speedData,
          color: 'rgb(59, 130, 246)',
          bgColor: 'rgba(59, 130, 246, 0.1)'
        };
      case 'rpm':
        return {
          label: 'RPM',
          data: data.rpmData,
          color: 'rgb(249, 115, 22)',
          bgColor: 'rgba(249, 115, 22, 0.1)'
        };
      case 'fuel':
        return {
          label: 'Fuel Consumption (L/h)',
          data: data.fuelData,
          color: 'rgb(220, 38, 38)',
          bgColor: 'rgba(220, 38, 38, 0.1)'
        };
    }
  };

  const speedData = getChartData('speed');
  const rpmData = getChartData('rpm');
  const fuelData = getChartData('fuel');

  // Get vessel type specifications for recommendations
  const getVesselSpecs = (vesselType: string) => {
    switch (vesselType) {
      case 'Tanker':
        return { 
          minSpeed: 8, maxSpeed: 18, optimalSpeed: 12,
          minRPM: 800, maxRPM: 2200, optimalRPM: 1500
        };
      case 'Container':
        return { 
          minSpeed: 12, maxSpeed: 25, optimalSpeed: 18,
          minRPM: 1200, maxRPM: 2800, optimalRPM: 2000
        };
      case 'Cargo':
        return { 
          minSpeed: 5, maxSpeed: 15, optimalSpeed: 13,
          minRPM: 1000, maxRPM: 2500, optimalRPM: 1800
        };
      case 'Ferry':
        return { 
          minSpeed: 8, maxSpeed: 22, optimalSpeed: 16,
          minRPM: 900, maxRPM: 2400, optimalRPM: 1600
        };
      default:
        return { 
          minSpeed: 8, maxSpeed: 20, optimalSpeed: 14,
          minRPM: 800, maxRPM: 2500, optimalRPM: 1650
        };
    }
  };

  const vesselSpecs = getVesselSpecs(selectedVessel ? selectedVessel.type : '');

  const renderChart = (chartData: any, title: string) => {
    const maxValue = Math.max(...chartData.data);
    const minValue = Math.min(...chartData.data);
    
    // Determine if this is speed or RPM chart for recommendations
    const isSpeedChart = title.toLowerCase().includes('speed');
    const isRPMChart = title.toLowerCase().includes('rpm');
    
    let recommendedMin = minValue;
    let recommendedMax = maxValue;
    let optimalValue = (maxValue + minValue) / 2;
    
    if (isSpeedChart) {
      recommendedMin = vesselSpecs.minSpeed;
      recommendedMax = vesselSpecs.maxSpeed;
      optimalValue = vesselSpecs.optimalSpeed;
    } else if (isRPMChart) {
      recommendedMin = vesselSpecs.minRPM;
      recommendedMax = vesselSpecs.maxRPM;
      optimalValue = vesselSpecs.optimalRPM;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
          {title}
        </h3>
        
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-600">Average</div>
            <div className="text-sm sm:text-base font-bold text-gray-800">
              {(chartData.data.reduce((a: number, b: number) => a + b, 0) / chartData.data.length).toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">Maximum</div>
            <div className="text-sm sm:text-base font-bold text-green-600">
              {maxValue.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">Minimum</div>
            <div className="text-sm sm:text-base font-bold text-orange-600">
              {minValue.toFixed(1)}
            </div>
          </div>
        </div>
        
        {/* Recommendations for Speed and RPM charts */}
        {(isSpeedChart || isRPMChart) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2"> 
              📊 Rekomendasi untuk {selectedVessel ? selectedVessel.type : ''}
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-blue-600">Min Optimal</div>
                <div className="font-bold text-blue-800">
                  {recommendedMin.toFixed(0)}{isSpeedChart ? ' kts' : ' rpm'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-blue-600">Optimal</div>
                <div className="font-bold text-blue-800">
                  {optimalValue.toFixed(0)}{isSpeedChart ? ' kts' : ' rpm'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-blue-600">Max Optimal</div>
                <div className="font-bold text-blue-800">
                  {recommendedMax.toFixed(0)}{isSpeedChart ? ' kts' : ' rpm'}
                </div>
              </div>
            </div>
            {/* <div className="mt-2 text-xs text-blue-700">
              {isSpeedChart && (
                <>
                  {(chartData.data.reduce((a: number, b: number) => a + b, 0) / chartData.data.length) < recommendedMin ? 
                    '⚠️ Kecepatan rata-rata di bawah optimal' :
                    (chartData.data.reduce((a: number, b: number) => a + b, 0) / chartData.data.length) > recommendedMax ?
                    '⚠️ Kecepatan rata-rata di atas optimal' :
                    '✅ Kecepatan dalam rentang optimal'
                  }
                </>
              )}
              {isRPMChart && ( 
                <>
                  {(chartData.data.reduce((a: number, b: number) => a + b, 0) / chartData.data.length) < recommendedMin ? 
                    '⚠️ RPM rata-rata di bawah optimal' :
                    (chartData.data.reduce((a: number, b: number) => a + b, 0) / chartData.data.length) > recommendedMax ?
                    '⚠️ RPM rata-rata di atas optimal' :
                    '✅ RPM dalam rentang optimal'
                  }
                </>
              )}
            </div> */}
          </div>
        )}
        
        <div className="h-48 sm:h-64 relative overflow-x-auto">
          <svg className="w-full h-full min-w-96" viewBox="0 0 800 240">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="60"
                y1={40 + i * 40}
                x2="760"
                y2={40 + i * 40}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Recommendation zones for Speed and RPM charts */}
            {(isSpeedChart || isRPMChart) && (
              <>
                {/* Optimal range background */}
                <rect
                  x="60"
                  y={40 + (160 * (maxValue - recommendedMax)) / (maxValue - minValue)}
                  width="700"
                  height={(160 * (recommendedMax - recommendedMin)) / (maxValue - minValue)}
                  fill="rgba(34, 197, 94, 0.1)"
                  stroke="rgba(34, 197, 94, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                
                {/* Optimal line */}
                <line
                  x1="60"
                  y1={40 + (160 * (maxValue - optimalValue)) / (maxValue - minValue)}
                  x2="760"
                  y2={40 + (160 * (maxValue - optimalValue)) / (maxValue - minValue)}
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="10,5"
                />
              </>
            )}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map((i) => (
              <text
                key={i}
                x="50"
                y={48 + i * 40}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {(maxValue - (i * (maxValue - minValue) / 4)).toFixed(0)}
              </text>
            ))}
            
            {/* Chart area background */}
            <rect
              x="60"
              y="40"
              width="700"
              height="160"
              fill={chartData.bgColor}
              rx="4"
            />
            
            {/* Chart line */}
            <polyline
              points={chartData.data
                .map((value: number, index: number) => {
                  const x = 60 + (index * 700) / (chartData.data.length - 1);
                  const y = 40 + (160 * (maxValue - value)) / (maxValue - minValue);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke={chartData.color}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {chartData.data.map((value: number, index: number) => {
              const x = 60 + (index * 700) / (chartData.data.length - 1);
              const y = 40 + (160 * (maxValue - value)) / (maxValue - minValue);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={chartData.color}
                  className="hover:r-5 transition-all cursor-pointer"
                >
                  <title>{`${data.hours[index]}: ${value.toFixed(1)}`}</title>
                </circle>
              );
            })}
            
            {/* X-axis labels */}
            {data.hours.filter((_, i) => i % 4 === 0).map((hour, i) => (
              <text
                key={i}
                x={60 + (i * 4 * 700) / (data.hours.length - 1)}
                y="220"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {hour}
              </text>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const maxSpeed = speedData.data.length > 0 ? Math.max(...speedData.data) : 0;
  const avgSpeed = speedData.data.length > 0
    ? speedData.data.reduce((a, b) => a + b, 0) / speedData.data.length
    : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Select Vessel
            </label>
            <select
              value={selectedVessel ? String(selectedVessel.id) : ''}
              onChange={(e) => {
                const vessel = vessels.find(v => String(v.id) === e.target.value);
                if (vessel) setSelectedVessel(vessel);
              }}
            >
              {vessels.map((vessel) => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name} ({vessel.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
            <BarChart3 size={16} />
            <span className="hidden sm:inline">Generate Report</span>
            <span className="sm:hidden">Generate</span>
          </button>
          <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Download size={16} />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Vessel Info Header */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{selectedVessel.name}</h2>
            <p className="text-sm text-gray-600">{selectedVessel.type} • {selectedVessel.owner}</p>
            <p className="text-xs text-gray-500">Report Date: {new Date(selectedDate).toLocaleDateString()}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedVessel.status === 'Active' ? 'bg-green-100 text-green-800' :
            selectedVessel.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {selectedVessel.status}
          </div>
        </div>
      </div> */}

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Avg Speed</h3>
            <TrendingUp className="text-blue-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">
            {(speedData.data.reduce((a, b) => a + b, 0) / speedData.data.length).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">knots</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Avg RPM</h3>
            <TrendingUp className="text-orange-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">
            {(rpmData.data.reduce((a, b) => a + b, 0) / rpmData.data.length).toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">rpm</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Avg Fuel</h3>
            <TrendingUp className="text-red-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">
            {(fuelData.data.reduce((a, b) => a + b, 0) / fuelData.data.length).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">L/h</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Operating Hours</h3>
            <TrendingUp className="text-purple-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">24</p>
          <p className="text-xs text-gray-500">hours</p>
        </div>
      </div>

      {/* All Charts in One Page */}
      <div className="space-y-6">
        {/* Speed Chart */}
        {renderChart(speedData, `Speed Analysis - ${selectedVessel ? selectedVessel.name : ''}`)}
        
        {/* RPM Chart */}
        {renderChart(rpmData, `Engine RPM - ${selectedVessel ? selectedVessel.name : ''}`)}
        
        {/* Fuel Chart */}
        {renderChart(fuelData, `Fuel Consumption - ${selectedVessel ? selectedVessel.name : ''}`)}
      </div>

      {/* Summary Report */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Summary Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Speed Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Maximum Speed:</span>
                <span className="font-medium">{Math.max(...speedData.data).toFixed(1)} kts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Speed:</span>
                <span className="font-medium">{Math.min(...speedData.data).toFixed(1)} kts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Speed Variation:</span>
                <span className="font-medium">{(Math.max(...speedData.data) - Math.min(...speedData.data)).toFixed(1)} kts</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Engine Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Maximum RPM:</span>
                <span className="font-medium">{Math.max(...rpmData.data).toFixed(0)} rpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum RPM:</span>
                <span className="font-medium">{Math.min(...rpmData.data).toFixed(0)} rpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RPM Variation:</span>
                <span className="font-medium">{(Math.max(...rpmData.data) - Math.min(...rpmData.data)).toFixed(0)} rpm</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Fuel Efficiency</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Consumption:</span>
                <span className="font-medium">{Math.max(...fuelData.data).toFixed(1)} L/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lowest Consumption:</span>
                <span className="font-medium">{Math.min(...fuelData.data).toFixed(1)} L/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fuel Used:</span>
                <span className="font-medium">{(fuelData.data.reduce((a, b) => a + b, 0)).toFixed(0)} L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}