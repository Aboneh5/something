'use client';

import { useState, useEffect } from 'react';
import SubcategorySection from './SubcategorySection';
import { Category, Subcategory, Question, AssessmentService } from '@/lib/assessment';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryAssessmentProps {
  category: Category;
  responses: Record<string, any>;
  onComplete: (responses: Record<string, any>) => void;
  onPrevious?: () => void;
  isSubmitting?: boolean;
}

export default function CategoryAssessment({
  category,
  responses: initialResponses,
  onComplete,
  onPrevious,
  isSubmitting
}: CategoryAssessmentProps) {
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [currentSubcategoryIndex, setCurrentSubcategoryIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const currentSubcategory = category.subcategories[currentSubcategoryIndex];
  const totalSubcategories = category.subcategories.length;

  useEffect(() => {
    setResponses(initialResponses);
  }, [initialResponses]);

  const handleResponseChange = async (questionId: string, value: any) => {
    // Update local state immediately for responsive UI
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error when user provides response
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }));
    }

    // Save response to database if value is not empty
    if (user && value && typeof value === 'string' && value.trim() !== '') {
      try {
        await AssessmentService.saveResponse(user.id, questionId, value.trim());
        console.log(`Saved response for question ${questionId}`);
      } catch (error) {
        console.error('Failed to save response:', error);
        // Could add a toast notification here for better UX
      }
    }
  };

  const validateCurrentSubcategory = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    (currentSubcategory.questions || []).forEach(question => {
      const response = responses[question.id];
      const isEmpty = !response || (typeof response === 'string' && response.trim() === '');
      if (question.required && isEmpty) {
        newErrors[question.id] = 'This question is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNextSubcategory = () => {
    if (!validateCurrentSubcategory()) {
      return;
    }

    if (currentSubcategoryIndex < totalSubcategories - 1) {
      setCurrentSubcategoryIndex(currentSubcategoryIndex + 1);
    } else {
      handleCompleteCategory();
    }
  };

  const handlePreviousSubcategory = () => {
    if (currentSubcategoryIndex > 0) {
      setCurrentSubcategoryIndex(currentSubcategoryIndex - 1);
    }
  };

  const handleCompleteCategory = () => {
    // Validate all subcategories
    let allValid = true;
    const allErrors: Record<string, string> = {};

    category.subcategories.forEach(subcategory => {
      (subcategory.questions || []).forEach(question => {
        const response = responses[question.id];
        const isEmpty = !response || (typeof response === 'string' && response.trim() === '');
        if (question.required && isEmpty) {
          allErrors[question.id] = 'This question is required';
          allValid = false;
        }
      });
    });

    if (!allValid) {
      setErrors(allErrors);
      // Find first subcategory with errors
      for (let i = 0; i < category.subcategories.length; i++) {
        const hasError = (category.subcategories[i].questions || []).some(q => allErrors[q.id]);
        if (hasError) {
          setCurrentSubcategoryIndex(i);
          break;
        }
      }
      return;
    }

    onComplete(responses);
  };

  const getCompletedSubcategoriesCount = () => {
    return category.subcategories.reduce((count, subcategory) => {
            const allAnswered = (subcategory.questions || []).every(q => {
        if (!q.required) return true;
        const response = responses[q.id];
        return response && !(typeof response === 'string' && response.trim() === '');
      });
      return count + (allAnswered ? 1 : 0);
    }, 0);
  };

  if (!currentSubcategory) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No subcategories available for this category.</p>
      </div>
    );
  }

  const completedCount = getCompletedSubcategoriesCount();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            <p className="text-gray-600 mt-1">{category.description}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Category Progress</div>
            <div className="font-medium">
              {completedCount}/{totalSubcategories} completed
            </div>
          </div>
        </div>

        {/* Subcategory Progress */}
        <div className="flex space-x-1">
          {category.subcategories.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index === currentSubcategoryIndex
                  ? 'bg-blue-500'
                  : index < currentSubcategoryIndex ||
                    (category.subcategories[index].questions || []).every(q => {
                      if (!q.required) return true;
                      const response = responses[q.id];
                      return response && !(typeof response === 'string' && response.trim() === '');
                    })
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Subcategory {currentSubcategoryIndex + 1} of {totalSubcategories}: {currentSubcategory.name}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <SubcategorySection
          subcategory={currentSubcategory}
          responses={responses}
          errors={errors}
          onResponseChange={handleResponseChange}
        />
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t bg-white flex justify-between items-center">
        <div className="flex space-x-3">
          {onPrevious && (
            <button
              onClick={onPrevious}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Category
            </button>
          )}

          {currentSubcategoryIndex > 0 && (
            <button
              onClick={handlePreviousSubcategory}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Section
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          {currentSubcategoryIndex < totalSubcategories - 1 ? (
            <button
              onClick={handleNextSubcategory}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Section
            </button>
          ) : (
            <button
              onClick={handleCompleteCategory}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Completing...
                </>
              ) : (
                'Complete Category'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}