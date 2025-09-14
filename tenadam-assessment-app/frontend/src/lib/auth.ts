const API_BASE_URL = 'http://localhost:5001/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  organization: string;
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    sessionToken?: string;
    expiresAt?: string;
    codeId?: string;
  };
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  data?: {
    codeId: string;
    expiresAt: string;
  };
}

export class AuthService {
  private static readonly TOKEN_KEY = 'tenadam_session_token';
  private static readonly USER_KEY = 'tenadam_user';

  static async validateAccessCode(code: string): Promise<ValidationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error validating access code:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  static async register(
    code: string,
    fullName: string,
    email: string,
    organization: string,
    phoneNumber: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          fullName,
          email,
          organization,
          phoneNumber,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.sessionToken && result.data?.user) {
        // Store token and user data
        localStorage.setItem(this.TOKEN_KEY, result.data.sessionToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(result.data.user));
      }

      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  static async validateSession(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) {
        return {
          success: false,
          message: 'No session found',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        // Clear invalid session
        this.clearSession();
      }

      return result;
    } catch (error) {
      console.error('Error validating session:', error);
      this.clearSession();
      return {
        success: false,
        message: 'Session validation failed',
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken: token }),
        });
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      this.clearSession();
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!(this.getStoredToken() && this.getStoredUser());
  }
}