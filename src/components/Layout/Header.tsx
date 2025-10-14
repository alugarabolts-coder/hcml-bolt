import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemConfig } from '../../contexts/SystemConfigContext';

interface HeaderProps {
  activeSection: string;
}

export default function Header({ activeSection }: HeaderProps) {
  const { user, logout } = useAuth();
  const { config } = useSystemConfig();

  const getHeaderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Real-time fleet monitoring and status'
        };
      case 'latest-data':
        return {
          title: 'Latest Sensor Data',
          subtitle: 'Real-time vessel monitoring'
        };
      case 'map':
        return {
          title: 'Vessel Location Map',
          subtitle: 'Real-time fleet positioning around Madura Island, Indonesia'
        };
      case 'tracking':
        return {
          title: 'Vessel Tracking',
          subtitle: 'Journey path and movement history with detailed tracking'
        };
      case 'data-history':
        return {
          title: 'Data History',
          subtitle: 'Historical vessel tracking data with advanced filtering'
        };
      case 'daily-report':
        return {
          title: 'Daily Report',
          subtitle: 'Performance analysis and trend visualization'
        };
      case 'fuel-monitoring':
        return {
          title: 'Fuel Monitoring',
          subtitle: 'Comprehensive fuel tank condition and consumption analysis'
        };
      case 'users':
        return {
          title: 'User Management',
          subtitle: 'Manage system users and access permissions'
        };
      case 'vessels':
        return {
          title: 'Vessel Management',
          subtitle: 'Manage fleet vessels and configurations'
        };
      case 'vessel-types':
        return {
          title: 'Vessel Type Management',
          subtitle: 'Configure vessel types and specifications'
        };
      default:
        return {
          title: 'Dashboard Overview',
          subtitle: 'Real-time fleet monitoring and status'
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 ml-12 lg:ml-0">
            {headerContent.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 ml-12 lg:ml-0 hidden sm:block">
            {headerContent.subtitle}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-sm font-medium text-gray-700 hidden sm:block">
            {config.companyName}
          </div>
          
          <button className="p-2 text-gray-600 hover:text-gray-800 relative hidden sm:block">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-1 sm:space-x-2 text-gray-700">
            <User size={16} className="sm:w-5 sm:h-5" />
            <div className="hidden sm:block">
              <span className="font-medium text-sm">{user?.username}</span>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={16} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}