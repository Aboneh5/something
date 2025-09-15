'use client';

import { Question } from '@/lib/assessment';

interface QuestionComponentProps {
  question: Question;
  value: any;
  error?: string;
  onChange: (value: any) => void;
}

export default function QuestionComponent({
  question,
  value,
  error,
  onChange
}: QuestionComponentProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        const scaleOptions = question.options || ['1', '2', '3', '4', '5'];
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Poor</span>
              <span className="text-sm text-gray-600">Excellent</span>
            </div>
            <div className="flex justify-between items-center">
              {scaleOptions.map((option, index) => (
                <label key={index} className="flex flex-col items-center cursor-pointer group">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(e.target.value)}
                    className={`h-5 w-5 text-blue-600 focus:ring-blue-500 mb-2 ${
                      value === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  />
                  <span className={`text-sm font-medium ${
                    value === option
                      ? 'text-black font-bold'
                      : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your answer..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Please provide a detailed response explaining your organization's approach, processes, and practices for this area..."
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical text-gray-900 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder="Enter a number..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your answer..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Question Text */}
      <div className="flex items-start justify-between">
        <h4 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.text}
        </h4>
      </div>

      {/* Input Component */}
      <div className="mt-4">
        {renderInput()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center mt-2">
          <svg
            className="h-4 w-4 text-red-500 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
}