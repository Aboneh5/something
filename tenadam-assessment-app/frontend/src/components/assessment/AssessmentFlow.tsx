'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CategoryCard from './CategoryCard';
import CategoryAssessment from './CategoryAssessment';
import ProgressBar from './ProgressBar';
import AssessmentCompletion from './AssessmentCompletion';
import { AssessmentService, UserProgress } from '@/lib/assessment';

import { Category, Subcategory, Question } from '@/lib/assessment';

interface AssessmentFlowProps {
  categories: Category[];
}

export default function AssessmentFlow({ categories }: AssessmentFlowProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [completedCategories, setCompletedCategories] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();

  const currentCategory = categories[currentCategoryIndex];
  const totalCategories = categories.length;
  const completedCount = completedCategories.size;

  useEffect(() => {
    loadUserProgress();
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      const progress = await AssessmentService.getUserProgress(user.id);
      if (progress) {
        if (progress.responses) {
          setResponses(progress.responses);
        }
        if (progress.completedCategories) {
          setCompletedCategories(new Set(progress.completedCategories));
        }
        if (progress.isCompleted) {
          setIsCompleted(true);
        }
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const saveProgress = async (categoryId: string, categoryResponses: Record<string, any>) => {
    if (!user) return;

    const updatedResponses = { ...responses, [categoryId]: categoryResponses };
    setResponses(updatedResponses);

    try {
      await AssessmentService.saveProgress(
        user.id,
        updatedResponses,
        Array.from(completedCategories)
      );
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleCategoryComplete = (categoryId: string, categoryResponses: Record<string, any>) => {
    const newCompletedCategories = new Set([...completedCategories, categoryId]);
    setCompletedCategories(newCompletedCategories);
    saveProgress(categoryId, categoryResponses);

    // Move to next category or complete assessment
    if (currentCategoryIndex < totalCategories - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    } else if (newCompletedCategories.size === totalCategories) {
      handleAssessmentComplete();
    }
  };

  const handleAssessmentComplete = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await AssessmentService.submitAssessment(user.id, responses);
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (index: number) => {
    setCurrentCategoryIndex(index);
  };

  const handlePreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  if (isCompleted) {
    return <AssessmentCompletion user={user} />;
  }

  if (!categories.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No assessment categories available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <ProgressBar
        completed={completedCount}
        total={totalCategories}
        currentIndex={currentCategoryIndex}
      />

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            isCompleted={completedCategories.has(category.id)}
            isCurrent={index === currentCategoryIndex}
            onClick={() => handleCategorySelect(index)}
          />
        ))}
      </div>

      {/* Current Category Assessment */}
      {currentCategory && (
        <div className="bg-white rounded-lg shadow-sm border">
          <CategoryAssessment
            category={currentCategory}
            responses={responses[currentCategory.id] || {}}
            onComplete={(categoryResponses) => handleCategoryComplete(currentCategory.id, categoryResponses)}
            onPrevious={currentCategoryIndex > 0 ? handlePreviousCategory : undefined}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Navigation Help */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-medium mb-2">Assessment Guidelines:</h4>
        <ul className="space-y-1">
          <li>• Complete all questions in each category before proceeding</li>
          <li>• You can navigate between categories using the cards above</li>
          <li>• Your progress is automatically saved as you go</li>
          <li>• All {totalCategories} categories must be completed to finish the assessment</li>
        </ul>
      </div>
    </div>
  );
}