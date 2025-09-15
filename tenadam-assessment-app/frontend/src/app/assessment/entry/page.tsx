'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AccessCodeForm from '@/components/auth/AccessCodeForm';
import RegistrationForm from '@/components/auth/RegistrationForm';

type Step = 'code' | 'register' | 'complete';

export default function AssessmentEntryPage() {
  const [currentStep, setCurrentStep] = useState<Step>('code');
  const [accessCode, setAccessCode] = useState('');
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to assessment if user is already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/assessment');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
        <div className="max-w-sm w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <div className="text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
        <div className="max-w-sm w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <div className="text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm text-gray-600">Redirecting to assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleValidCode = (code: string) => {
    setAccessCode(code);
    setCurrentStep('register');
  };

  const handleRegistrationComplete = () => {
    setCurrentStep('complete');
    // Redirect to assessment after a short delay
    setTimeout(() => {
      router.push('/assessment');
    }, 2000);
  };

  const handleBackToCode = () => {
    setCurrentStep('code');
    setAccessCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-sm w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Baldrige Excellence Framework Assessment
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {currentStep === 'code' && 'Enter your access code to begin'}
            {currentStep === 'register' && 'Complete your registration'}
            {currentStep === 'complete' && 'Registration successful!'}
          </p>
        </div>

        {currentStep === 'code' && (
          <AccessCodeForm onValidCode={handleValidCode} />
        )}

        {currentStep === 'register' && (
          <RegistrationForm
            accessCode={accessCode}
            onRegistrationComplete={handleRegistrationComplete}
            onBack={handleBackToCode}
          />
        )}

        {currentStep === 'complete' && (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Registration Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              Redirecting you to the assessment...
            </p>
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-md">
          <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">Sample Access Code:</p>
          <p className="text-xs sm:text-sm text-gray-500 font-mono break-all">TENADAM1301SRS</p>
        </div>
      </div>
    </div>
  );
}
