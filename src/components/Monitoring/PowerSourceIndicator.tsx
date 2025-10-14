import React from 'react';

interface PowerSourceIndicatorProps {
  acPower: boolean;
  dcPower: boolean;
  backupBattery: boolean;
  alarm: boolean;
  blackout: boolean;
}

export default function PowerSourceIndicator({
  acPower = true,
  dcPower = true,
  backupBattery = true,
  alarm = true,
  blackout = true
}: PowerSourceIndicatorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      {/* Power Source Group */}
      {/* <div className="mb-6"> */}
      <div>
        {/* <h4 className="text-sm font-semibold text-gray-700 mb-1">System Status</h4> */}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {/* AC Power */}
          <div className={`flex-1 min-w-20 p-3 sm:p-4 rounded-lg text-center transition-all ${acPower ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-gray-100 text-gray-600 border-2 border-gray-300'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full ${acPower ? 'bg-green-500' : 'bg-gray-400'} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xs sm:text-sm font-bold">AC</span>
            </div>
            <div className="text-xs sm:text-sm font-medium">AC Power</div>
          </div>

          {/* DC Power */}
          <div className={`flex-1 min-w-20 p-3 sm:p-4 rounded-lg text-center transition-all ${dcPower ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-gray-100 text-gray-600 border-2 border-gray-300'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full ${dcPower ? 'bg-green-500' : 'bg-gray-400'} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xs sm:text-sm font-bold">DC</span>
            </div>
            <div className="text-xs sm:text-sm font-medium">DC Power</div>
          </div>

          {/* Backup Battery */}
          <div className={`flex-1 min-w-20 p-3 sm:p-4 rounded-lg text-center transition-all ${backupBattery ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-gray-100 text-gray-600 border-2 border-gray-300'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full ${backupBattery ? 'bg-green-500' : 'bg-gray-400'} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xs font-bold">BAT</span>
            </div>
            <div className="text-xs sm:text-sm font-medium">Backup</div>
          </div>
          
          {/* Alarm Status */}
          <div className={`flex-1 min-w-20 p-3 sm:p-4 rounded-lg text-center transition-all ${alarm ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' : 'bg-gray-100 text-gray-600 border-2 border-gray-300'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full ${alarm ? 'bg-yellow-500' : 'bg-gray-400'} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xs font-bold">⚠</span>
            </div>
            <div className="text-xs sm:text-sm font-medium">Alarm</div>
          </div>

          {/* Blackout Status */}
          <div className={`flex-1 min-w-20 p-3 sm:p-4 rounded-lg text-center transition-all ${blackout ? 'bg-red-100 text-red-800 border-2 border-red-300' : 'bg-gray-100 text-gray-600 border-2 border-gray-300'}`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full ${blackout ? 'bg-red-500' : 'bg-gray-400'} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <div className="text-xs sm:text-sm font-medium">Blackout</div>
          </div>
        </div>

        {/* Critical Alert */}
        {blackout && (
          <div className="mt-6 p-3 bg-red-100 border-2 border-red-300 text-red-800 text-sm rounded-lg font-semibold text-center">
            ⚠️ CRITICAL ALERT: BLACKOUT DETECTED - IMMEDIATE ACTION REQUIRED
          </div>
        )}
      </div>

    </div>
  );
}