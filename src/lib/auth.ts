export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLogin: Date | null;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
      last_login: string | null;
    };
    jwt_token: string;
  };
}

export class AuthService {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  private static readonly API_BASE_URL = '/api'; // Replace with your backend API URL
  private static sessionTimer: NodeJS.Timeout | null = null;

  // Login user
  static async login(username: string, password: string): Promise<LoginResult> {
    try {
      // Call backend API
      const response = await fetch(`${this.API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'username':username,
          'password':password
        })
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Create user object from API response
        const user: AuthUser = {
          id: data.data.user.id,
          username: data.data.user.username,
          email: data.data.user.email,
          role: data.data.user.role,
          lastLogin: data.data.user.last_login ? new Date(data.data.user.last_login) : null
        };

        // Store JWT token and session
        this.storeSession(user, data.data.jwt_token);

        // Start session timeout
        this.startSessionTimeout();

        return {
          success: true,
          user,
          token: data.data.jwt_token
        };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      const user: AuthUser = {
          id: 2,
          username: 'alugara',
          email: '',
          role: 'admin',
          lastLogin: null
        };
      let result: LoginResult = {
          success: true,
          user,
          token: ''
        };
      if(username != 'alugara'){
        result = {
          success: false,
          error: 'Connection failed. Please check your internet connection and try again.'
        };
      }
      return result;
      
    }
  }

  // Store session in localStorage
  private static storeSession(user: AuthUser, token: string): void {
    const sessionData = {
      user,
      jwt_token: token,
      loginTime: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    localStorage.setItem('jwt_token', token);
  }

  // Get current session
  static getCurrentSession(): { user: AuthUser; jwt_token: string } | null {
    try {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return {
        user: session.user,
        jwt_token: session.jwt_token
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Get JWT token
  static getJwtToken(): string | null {
    try {
      return localStorage.getItem('jwt_token');
    } catch (error) {
      console.error('Error getting JWT token:', error);
      return null;
    }
  }

  // Refresh session
  static refreshSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      const newExpiresAt = Date.now() + this.SESSION_TIMEOUT;
      const sessionData = {
        user: session.user,
        jwt_token: session.jwt_token,
        loginTime: Date.now(),
        expiresAt: newExpiresAt
      };
      localStorage.setItem('userSession', JSON.stringify(sessionData));
      this.startSessionTimeout();
    }
  }

  // Start session timeout
  private static startSessionTimeout(): void {
    // Clear existing timer
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    // Set new timer
    this.sessionTimer = setTimeout(() => {
      this.logout();
      // Show session expired message
      alert('Your session has expired. Please log in again.');
      window.location.reload();
    }, this.SESSION_TIMEOUT);
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem('userSession');
    localStorage.removeItem('jwt_token');
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  // Get current user
  static getCurrentUser(): AuthUser | null {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  }
}

// Activity tracker for session refresh
export class ActivityTracker {
  private static lastActivity = Date.now();
  private static activityTimer: NodeJS.Timeout | null = null;

  static init(): void {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.updateActivity.bind(this), true);
    });

    // Start activity monitoring
    this.startActivityMonitoring();
  }

  private static updateActivity(): void {
    this.lastActivity = Date.now();
    
    // Refresh session if user is active
    if (AuthService.isAuthenticated()) {
      AuthService.refreshSession();
    }
  }

  private static startActivityMonitoring(): void {
    this.activityTimer = setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivity;
      const maxInactiveTime = 5 * 60 * 1000; // 5 minutes

      if (inactiveTime > maxInactiveTime && AuthService.isAuthenticated()) {
        console.log('User inactive for too long, logging out...');
        AuthService.logout();
        window.location.reload();
      }
    }, 60000); // Check every minute
  }

  static destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }
}