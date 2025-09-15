const API_BASE_URL = 'http://localhost:5001/api';

export interface Category {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  displayOrder: number;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  required: boolean;
  subcategoryId: string;
  displayOrder: number;
}

export interface UserProgress {
  userId: string;
  responses: Record<string, any>;
  completedCategories: string[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class AssessmentService {
  private static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get session token from localStorage or cookies
    const sessionToken = localStorage.getItem('sessionToken') || 
      document.cookie
        .split('; ')
        .find(row => row.startsWith('tenadam_session_token='))
        ?.split('=')[1];

    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    return headers;
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/categories`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<Category[]> = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/progress/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<UserProgress> = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else if (response.status === 404) {
        // No progress found, return null
        return null;
      } else {
        throw new Error(result.message || 'Failed to fetch user progress');
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  static async saveProgress(
    userId: string,
    responses: Record<string, any>,
    completedCategories: string[]
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/progress/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          responses,
          completedCategories,
        }),
      });

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  static async submitAssessment(
    userId: string,
    responses: Record<string, any>
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          responses,
          completedAt: new Date().toISOString(),
        }),
      });

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  }

  static async getQuestions(subcategoryId: string): Promise<Question[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/subcategories/${subcategoryId}/questions`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponse<Question[]> = await response.json();

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  static async saveResponse(
    userId: string,
    questionId: string,
    response: any
  ): Promise<void> {
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/assessment/response`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          questionId,
          responseText: response,
          timeSpent: 0
        }),
      });

      const result: ApiResponse = await apiResponse.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    }
  }
}
