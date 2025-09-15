'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  fullName: string;
  email: string;
  organization: string;
}

interface AssessmentCompletionProps {
  user: User | null;
}

export default function AssessmentCompletion({ user }: AssessmentCompletionProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-16 w-16 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Completion Message */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Assessment Complete!
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Congratulations, {user?.fullName}!
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            You have successfully completed the Baldrige Excellence Framework Assessment.
            Your responses have been recorded and will be reviewed by our team.
          </p>
        </div>

        {/* User Details Summary */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-left">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Assessment Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-blue-800">Participant:</dt>
              <dd className="text-sm text-blue-700">{user?.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-blue-800">Organization:</dt>
              <dd className="text-sm text-blue-700">{user?.organization}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-blue-800">Email:</dt>
              <dd className="text-sm text-blue-700">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-blue-800">Completed:</dt>
              <dd className="text-sm text-blue-700">
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Thank You Message */}
        <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-green-500">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            Thank you for participating in the Baldrige Excellence Framework Assessment.
            Your comprehensive responses will help identify opportunities for organizational
            excellence and performance improvement.
          </p>
        </div>


        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Return to Home
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Baldrige Excellence Framework Assessment by<br />
            <span className="font-medium">Tenadam Training, Consultancy and Research PLC</span>
          </p>
        </div>
      </div>
    </div>
  );
}