import React from 'react';

interface AnalogGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  color?: 'blue' | 'green' | 'orange' | 'red';
  warningThreshold?: number;
  criticalThreshold?: number;
}

export default function AnalogGauge({
  value,
  min,
  max,
  unit,
  label,
  color = 'blue',
  warningThreshold,
  criticalThreshold
}: AnalogGaugeProps) {
  // Determine if this is an RPM gauge or heading gauge
  const isRPMGauge = label.toLowerCase().includes('rpm') || label.toLowerCase().includes('engine');
  const isHeadingGauge = label.toLowerCase().includes('heading');
  
  // Calculate needle rotation angle
  let needleAngle = 0;
  
  if (isRPMGauge) {
    // RPM: nilai/1000, range 0-5, gauge shows 225 degrees (from -112.5 to +112.5)
    const displayValue = value / 1000;
    const percentage = Math.max(0, Math.min(100, (displayValue / 5) * 100));
    needleAngle = -112.5 + (percentage / 100) * 225;
  } else if (isHeadingGauge) {
    // Heading: 0-360 degrees, full circle
    needleAngle = value;
  } else {
    // Other gauges: use percentage of range
    const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    needleAngle = -112.5 + (percentage / 100) * 225;
  }

  const getBackgroundImage = () => {
    if (isRPMGauge) {
      return '/background_RPM .png';
    } else if (isHeadingGauge) {
      return '/background_heading copy.png';
    }
    // Default to RPM background for other gauges
    return '/background_RPM .png';
  };

  const getNeedleImage = () => {
    if (isRPMGauge) {
      return '/needle_RPM.png';
    } else if (isHeadingGauge) {
      return '/needle_heading.png';
    }
    // Default to RPM needle for other gauges
    return '/needle_RPM.png';
  };

  const getStatusColor = () => {
    if (criticalThreshold && (value < criticalThreshold || value > max * 0.9)) {
      return 'text-red-600 bg-red-100';
    }
    if (warningThreshold && (value < warningThreshold || value > max * 0.8)) {
      return 'text-yellow-600 bg-yellow-100';
    }
    return 'text-green-600 bg-green-100';
  };

  const getDisplayValue = () => {
    if (isRPMGauge) {
      return Math.round(value).toString();
    } else if (isHeadingGauge) {
      return Math.round(value).toString();
    }
    return value.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col items-center">
        <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4 text-center">{label}</h3>
        
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 mb-3 sm:mb-4">
          {/* Background gauge image */}
          <img 
            src={getBackgroundImage()} 
            alt={`${label} background`}
            className="w-full h-full object-contain"
          />
          
          {/* Needle overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={getNeedleImage()}
              alt={`${label} needle`}
              className="absolute w-full h-full object-contain transition-transform duration-500 ease-out"
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: 'center center'
              }}
            />
          </div>
          
          {/* Digital value display */}
          <div className="absolute bottom-8 sm:bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="bg-black bg-opacity-90 text-green-400 px-3 py-1 rounded text-sm sm:text-base font-mono border border-gray-600 min-w-20 text-center shadow-lg">
              {isRPMGauge ? (
                getDisplayValue().padStart(4, '0')
              ) : isHeadingGauge ? (
                `${getDisplayValue().padStart(3, '0')}°`
              ) : (
                `${getDisplayValue()} ${unit}`
              )}
            </div>
          </div>
        </div>
        
        {/* Scale labels */}
        {isRPMGauge ? (
          <div className="flex justify-between w-full text-xs text-gray-500 mb-1 sm:mb-2">
            <span>0</span>
            <span>5</span>
          </div>
        ) : isHeadingGauge ? (
          <div className="flex justify-between w-full text-xs text-gray-500 mb-1 sm:mb-2">
            <span>0°</span>
            <span>360°</span>
          </div>
        ) : (
          <div className="flex justify-between w-full text-xs text-gray-500 mb-1 sm:mb-2">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        )}
        
        {/* Status indicator */}
        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {isRPMGauge ? (
            value > 4500 ? 'High RPM' : 
            value > 2000 ? 'Normal' : 
            value < 500 ? 'Low RPM' : 'Normal'
          ) : isHeadingGauge ? (
            'Normal'
          ) : (
            ((value - min) / (max - min)) * 100 > 95 ? 'Critical' : 
            ((value - min) / (max - min)) * 100 > 80 ? 'High' : 
            ((value - min) / (max - min)) * 100 < 20 ? 'Low' : 'Normal'
          )}
        </div>
        
        {/* Unit display for RPM */}
        {isRPMGauge && (
          <div className="text-xs text-gray-500 mt-1 text-center">
            RPM
          </div>
        )}
      </div>
    </div>
  );
}