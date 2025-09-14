'use client';

interface ProgressBarProps {
  completed: number;
  total: number;
  currentIndex: number;
}

export default function ProgressBar({ completed, total, currentIndex }: ProgressBarProps) {
  const progressPercentage = (completed / total) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assessment Progress</h3>
          <p className="text-sm text-gray-600">
            Category {currentIndex + 1} of {total} • {completed} completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Steps */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full ${
              index < completed
                ? 'bg-green-500'
                : index === currentIndex
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}