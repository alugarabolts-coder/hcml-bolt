// Browser mock for pg library
import bcrypt from 'bcryptjs';

export class Pool {
  constructor(config?: any) {
    console.warn('PostgreSQL Pool is mocked in browser environment');
  }

  async query(text: string, params?: any[]): Promise<any> {
    console.warn('PostgreSQL query is mocked in browser environment', { text, params });
    
    // Mock user data for authentication
    if (text.includes('SELECT * FROM users WHERE username = $1')) {
      const username = params?.[0];
      if (username === 'alugara') {
        // Pre-hashed password for 'alugara' (bcrypt hash of 'alugara')
        const hashedPassword = await bcrypt.hash('alugara', 10);
        return {
          rows: [{
            id: 1,
            username: 'alugara',
            email: 'admin@alugara.com',
            password_hash: hashedPassword,
            role: 'admin',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            last_login: null
          }]
        };
      }
    }
    
    // Mock table creation queries
    if (text.includes('CREATE TABLE') || text.includes('INSERT INTO')) {
      return { rows: [] };
    }

    // Mock vessel data queries
    if (text.includes('FROM vessel_vessel')) {
      return {
        rows: [
          {
            id: 1,
            name: 'Sinar Bahari',
            vessel_type: 'Cargo',
            status: 'Active',
            owner: 'PT Sinar Bahari Shipping',
            vessel_key: 'SB001-2024-CARGO',
            image_url: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
            vts_active: true,
            ems_active: true,
            fms_active: true,
            latitude: -7.38542,
            longitude: 113.839851,
            speed: 12.5,
            heading: 135,
            rpm_portside: 1850,
            rpm_starboard: 1820,
            rpm_center: 1835,
            fuel_consumption: 45.2,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 2,
            name: 'Maritim Jaya',
            vessel_type: 'Tanker',
            status: 'Warning',
            owner: 'CV Maritim Jaya',
            vessel_key: 'MJ002-2024-TANKER',
            image_url: 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=400',
            vts_active: true,
            ems_active: false,
            fms_active: true,
            latitude: -7.0,
            longitude: 114.3,
            speed: 8.3,
            heading: 270,
            rpm_portside: 1200,
            rpm_starboard: 1180,
            rpm_center: 1190,
            fuel_consumption: 38.7,
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
      };
    }
    
    return { rows: [] };
  }

  on(event: string, callback: Function) {
    console.warn('PostgreSQL Pool events are mocked in browser environment');
  }

  async end() {
    console.warn('PostgreSQL Pool end is mocked in browser environment');
  }
}

export class Client {
  constructor(config?: any) {
    console.warn('PostgreSQL Client is mocked in browser environment');
  }

  async connect() {
    console.warn('PostgreSQL Client connect is mocked in browser environment');
  }

  async query(text: string, params?: any[]): Promise<any> {
    console.warn('PostgreSQL query is mocked in browser environment');
    return { rows: [] };
  }

  async end() {
    console.warn('PostgreSQL Client end is mocked in browser environment');
  }
}

export default { Pool, Client };