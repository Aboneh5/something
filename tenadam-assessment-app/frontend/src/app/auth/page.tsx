'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AccessCodeForm from '@/components/auth/AccessCodeForm';
import RegistrationForm from '@/components/auth/RegistrationForm';

type AuthStep = 'code' | 'registration' | 'complete';

export default function AuthPage() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('code');
  const [validatedCode, setValidatedCode] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/assessment');
    return null;
  }

  const handleValidCode = (code: string) => {
    setValidatedCode(code);
    setCurrentStep('registration');
  };

  const handleRegistrationComplete = () => {
    setCurrentStep('complete');
    // Redirect to assessment after a brief success message
    setTimeout(() => {
      router.push('/assessment');
    }, 2000);
  };

  const handleBack = () => {
    setCurrentStep('code');
    setValidatedCode('');
  };

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
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
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Registration Complete!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome to the Baldrige Excellence Framework Assessment.
              <br />
              Redirecting to your assessment...
            </p>
          </div>

          <div className="mt-8">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentStep === 'code' && (
        <AccessCodeForm onValidCode={handleValidCode} />
      )}

      {currentStep === 'registration' && (
        <RegistrationForm
          accessCode={validatedCode}
          onRegistrationComplete={handleRegistrationComplete}
          onBack={handleBack}
        />
      )}
    </>
  );
}