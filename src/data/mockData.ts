import { Vessel, DashboardStats } from '../types/vessel';
import { HistoryRecord } from '../types/vessel';

// Fetch vessels from backend API
export const fetchVesselsFromBackend = async (): Promise<Vessel[]> => {
  try {
    const response = await fetch('/api/vessels?key=fb8b73a2c99cf526df1ad79865e796f365ae883c'); // Ganti endpoint sesuai backend kamu
    if (!response.ok) throw new Error('Failed to fetch vessels');
    const vessels = await response.json();
    // vessels berupa object dengan struktur { data: Vessel[], message, success }, ambil data-nya saja
    return Array.isArray(vessels.data) ? vessels.data : [];
  } catch (error) {
    console.error('Error fetching vessels from backend:', error);
    // Fallback ke mock data jika gagal
    return mockVessels;
  }
};

// Generate mock history data first - this will be our primary data source
const generateHistoryData = async (): Promise<HistoryRecord[]> => {
  const records: HistoryRecord[] = [];
  const now = new Date();

  // get record history from backend API '/history'
  // dengan format berikut: id:,vesselId,vesselName,timestamp,latitude,longitude,speed,heading,rpmPortside,rpmStarboard,rpmCenter
  try {
    const response = await fetch('/api/history?limit=2000'); // Ganti endpoint sesuai backend kamu
    if (!response.ok) throw new Error('Failed to fetch history');
    const history = await response.json();
    // history berupa object dengan struktur { data: HistoryRecord[], message, success }, ambil data-nya saja
    if (Array.isArray(history.data)) {
      history.data.forEach((record: any) => {
        records.push({
          id: record.id,
          vesselId: `${record.vessel_id}`,
          vesselName: record.vessel_name,
          vesselType: record.vessel_type || 'Unknown',
          timestamp: new Date(record.date),
          latitude: record.latitude,
          longitude: record.longitude,
          speed: record.speed,
          heading: record.heading,
          rpmPortside: record.rpm_1,
          rpmStarboard: record.rpm_2,
          rpmCenter: record.rpm_3,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching history from backend:', error);
    // Fallback ke data yang di-generate jika gagal
    console.warn('Falling back to generated history data');
  }
  
  return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate the history data once
const historyData = await generateHistoryData();

// Tidak disarankan, karena fetchVesselsFromBackend adalah async
export const mockVessels: Vessel[] = await fetchVesselsFromBackend(); // Ini tidak valid di level module

// Cara yang benar: gunakan fungsi async di komponen/service
export const getMockVessels = async (): Promise<Vessel[]> => {
  // Ambil data vessel dari backend saja, tanpa history
  return await fetchVesselsFromBackend();
};

export function getDashboardStats(vessels: Vessel[]) {
  return {
    totalVessels: vessels.length,
    // activeVessels: vessels.filter(v => v.status === 'Active').length,
    // warningCount: vessels.filter(v => v.status === 'Warning').length,
    // criticalCount: vessels.filter(v => v.status === 'Critical').length
    activeVessels: vessels.length,
    warningCount: 0,
    criticalCount: 0
  };
};

// Export the history data
export const getHistoryData = (): HistoryRecord[] => {
  return historyData;
};

// Generate hourly data for charts
export const generateHourlyData = async (vessel: Vessel, date: string) => {
  // Ambil data history dari backend untuk vessel dan tanggal
  let records: HistoryRecord[] = [];
  try {
    const response = await fetch(`/api/history?vessel_id=${vessel.id}&date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const history = await response.json();
    if (Array.isArray(history.data)) {
      records = history.data.map((record: any) => ({
        id: record.id,
        vesselId: `${record.vessel_id}`,
        vesselName: record.vessel_name,
        vesselType: record.vessel_type || 'Unknown',
        timestamp: new Date(record.date),
        latitude: record.latitude,
        longitude: record.longitude,
        speed: record.speed,
        heading: record.heading,
        rpmPortside: record.rpm_1,
        rpmStarboard: record.rpm_2,
        rpmCenter: record.rpm_3,
      }));
    }
  } catch (error) {
    console.error('Error fetching hourly data from backend:', error);
    return { hours: [], speedData: [], rpmData: [], fuelData: [], maxSpeed: "0.0" };
  }

  // Filter data sesuai tanggal
  const selectedDate = new Date(date);
  const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

  const vesselHistory = records
    .filter(record =>
      String(record.vesselId) === String(vessel.id) &&
      record.timestamp >= startOfDay &&
      record.timestamp <= endOfDay
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const hours: string[] = [];
  const speedData: number[] = [];
  const rpmData: number[] = [];
  const fuelData: number[] = [];

  // Group data by hour
  for (let i = 0; i < 24; i++) {
    const hourStart = new Date(startOfDay.getTime() + i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    hours.push(`${i.toString().padStart(2, '0')}:00`);

    // Find records in this hour
    const hourRecords = vesselHistory.filter(record =>
      record.timestamp >= hourStart && record.timestamp < hourEnd
    );

    if (hourRecords.length > 0) {
      // Average the values for this hour
      const avgSpeed = hourRecords.reduce((sum, r) => sum + r.speed, 0) / hourRecords.length;
      const avgRpm = hourRecords.reduce((sum, r) => sum + r.rpmPortside, 0) / hourRecords.length;
      // If fuelConsumption is not available, set avgFuel to 0
      const avgFuel = 0;

      speedData.push(avgSpeed);
      rpmData.push(avgRpm);
      fuelData.push(avgFuel);
    } else {
      // Tidak ada data, isi 0
      speedData.push(0);
      rpmData.push(0);
      fuelData.push(0);
    }
  }

  const avgSpeed = speedData.length > 0
    ? speedData.reduce((a, b) => a + b, 0) / speedData.length
    : 0;

  return {
    hours,
    speedData,
    rpmData,
    fuelData,
    maxSpeed: avgSpeed.toFixed(1)
  };
};