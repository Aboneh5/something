'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentFlow from '@/components/assessment/AssessmentFlow';
import { AssessmentService, Category } from '@/lib/assessment';
import { useAuth } from '@/contexts/AuthContext';

export default function AssessmentPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check authentication first
    if (!isLoading && !isAuthenticated) {
      router.push('/assessment/entry');
      return;
    }
    
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadCategories = async () => {
    try {
      const data = await AssessmentService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load assessment categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Show loading while checking authentication or loading categories
  if (isLoading || isLoadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isLoading ? 'Verifying Access' : 'Loading Assessment'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLoading ? 'Please wait while we verify your access...' : 'Preparing your Baldrige Excellence Framework Assessment...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, this should redirect, but show loading as fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            Redirecting...
          </h2>
          <p className="text-gray-600 mt-2">
            Please wait while we redirect you to the access page...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Assessment Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Baldrige Excellence Framework Assessment
          </h1>
          <p className="mt-2 text-gray-600">
            Complete all categories to finish your assessment.
          </p>
        </div>

        <AssessmentFlow categories={categories} />
      </div>
    </div>
  );
}