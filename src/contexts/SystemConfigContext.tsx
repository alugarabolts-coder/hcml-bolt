import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SystemConfig {
  companyName: string;
  companyLogo: string;
  themeColor: string;
  fuelMonitoringEnabled: boolean;
}

interface SystemConfigContextType {
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: SystemConfig = {
  companyName: 'E-Merti Fleet Management',
  companyLogo: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
  themeColor: '#1e40af',
  fuelMonitoringEnabled: true, // default aktif
};

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export function SystemConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsedConfig });
      } catch (error) {
        console.error('Error loading system config:', error);
      }
    }
  }, []);

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('systemConfig', JSON.stringify(updatedConfig));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.setItem('systemConfig', JSON.stringify(defaultConfig));
  };

  return (
    <SystemConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  const context = useContext(SystemConfigContext);
  if (context === undefined) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
}