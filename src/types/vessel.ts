export interface Vessel {
  id: string | number;
  name: string;
  type: string;
  status: string;
  owner: string;
  vtsActive: boolean;
  emsActive: boolean;
  fmsActive: boolean;
  vesselKey: string;
  fuelConsumption: number;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  rpm_1?: number;
  rpm_2?: number;
  rpm_3?: number;
  // Tambahkan field lain jika perlu
}

export interface User {
  username: string;
  password: string;
  role: string;
}

export interface DashboardStats {
  totalVessels: number;
  activeVessels: number;
  warningCount: number;
  criticalCount: number;
}
export interface HistoryRecord {
  id: string;
  vesselId: string;
  vesselName: string;
  vesselType: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  rpmPortside: number;
  rpmStarboard: number;
  rpmCenter: number;
}