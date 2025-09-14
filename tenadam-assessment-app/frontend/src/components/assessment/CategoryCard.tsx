'use client';

import { Category } from '@/lib/assessment';

interface CategoryCardProps {
  category: Category;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

export default function CategoryCard({
  category,
  index,
  isCompleted,
  isCurrent,
  onClick
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md
        ${isCurrent
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : isCompleted
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className={`
              inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-2
              ${isCurrent
                ? 'bg-blue-500 text-white'
                : isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700'
              }
            `}>
              {index + 1}
            </span>
            <h3 className={`font-medium text-sm leading-tight
              ${isCurrent
                ? 'text-blue-900'
                : isCompleted
                ? 'text-green-900'
                : 'text-gray-900'
              }
            `}>
              {category.name}
            </h3>
          </div>
          <p className={`text-xs leading-relaxed
            ${isCurrent
              ? 'text-blue-700'
              : isCompleted
              ? 'text-green-700'
              : 'text-gray-600'
            }
          `}>
            {category.description}
          </p>
        </div>

        {/* Status Icon */}
        <div className="ml-2 flex-shrink-0">
          {isCompleted ? (
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : isCurrent ? (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          ) : (
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Subcategories count */}
      <div className="mt-3 pt-2 border-t border-gray-200/50">
        <span className={`text-xs
          ${isCurrent
            ? 'text-blue-600'
            : isCompleted
            ? 'text-green-600'
            : 'text-gray-500'
          }
        `}>
          {category.subcategories.length} subcategories
        </span>
      </div>
    </button>
  );
}