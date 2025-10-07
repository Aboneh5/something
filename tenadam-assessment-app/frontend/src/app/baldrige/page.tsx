'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { baldrigeData } from '@/lib/baldrige-data';

interface BaldrigeResponse {
  itemCode: string;
  text: string;
  response: string;
}

export default function BaldrigePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [showOrgProfile, setShowOrgProfile] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/baldrige/entry');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Assessment</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const categories = baldrigeData.categories;
  const orgProfile = baldrigeData["organizational-profile"];

  const currentCategory = categories[currentCategoryIndex];
  const currentItem = currentCategory?.items[currentItemIndex];

  const handleResponseChange = (itemCode: string, value: string) => {
    setResponses(prev => ({ ...prev, [itemCode]: value }));
  };

  const handleItemComplete = () => {
    if (!currentItem) return;

    const allQuestionsAnswered = currentItem.questions.every(
      q => responses[q.itemCode]?.trim()
    );

    if (!allQuestionsAnswered) {
      alert('Please answer all questions before proceeding.');
      return;
    }

    setCompletedItems(prev => new Set([...prev, currentItem.item]));

    // Move to next item or category
    if (currentItemIndex < currentCategory.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentItemIndex(0);
    } else {
      // Assessment complete
      alert('Congratulations! You have completed the Baldrige Assessment.');
      router.push('/assessment/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      setCurrentItemIndex(categories[currentCategoryIndex - 1].items.length - 1);
    }
  };

  const getTotalPoints = () => {
    return categories.reduce((total, cat) =>
      total + cat.items.reduce((catTotal, item) => catTotal + item.points, 0), 0
    );
  };

  const getCompletedPoints = () => {
    let points = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (completedItems.has(item.item)) {
          points += item.points;
        }
      });
    });
    return points;
  };

  if (showOrgProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Baldrige Excellence Framework Assessment
              </h1>
              <p className="text-gray-600">
                Total Points: 1,000 | Duration: 45-60 minutes
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Organizational Profile
              </h2>
              <p className="text-gray-600 mb-6">
                Before beginning the assessment, please provide information about your organization.
                This helps contextualize your responses.
              </p>

              {orgProfile.map((section) => (
                <div key={section.item} className="mb-8 border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {section.item}: {section.title}
                  </h3>

                  {section.questions.map((question) => (
                    <div key={question.itemCode} className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {question.itemCode}
                      </label>
                      <p className="text-gray-600 mb-3 text-sm">{question.text}</p>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                        value={responses[question.itemCode] || ''}
                        onChange={(e) => handleResponseChange(question.itemCode, e.target.value)}
                        placeholder="Enter your response..."
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowOrgProfile(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Continue to Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Baldrige Excellence Framework Assessment
            </h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-lg font-semibold text-blue-600">
                {getCompletedPoints()} / {getTotalPoints()} points
              </p>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat, idx) => (
              <button
                key={cat.category}
                onClick={() => {
                  setCurrentCategoryIndex(idx);
                  setCurrentItemIndex(0);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  idx === currentCategoryIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.category}. {cat.title}
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getCompletedPoints() / getTotalPoints()) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Item Assessment */}
        {currentItem && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentItem.item}: {currentItem.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Category {currentCategory.category}: {currentCategory.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-xl font-bold text-blue-600">{currentItem.points}</p>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6 mb-8">
              {currentItem.questions.map((question) => (
                <div key={question.itemCode} className="border-l-4 border-blue-500 pl-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {question.itemCode}
                  </label>
                  <p className="text-gray-700 mb-4">{question.text}</p>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    value={responses[question.itemCode] || ''}
                    onChange={(e) => handleResponseChange(question.itemCode, e.target.value)}
                    placeholder="Describe your organization's approach, deployment, and results for this criterion..."
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentCategoryIndex === 0 && currentItemIndex === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Item {currentItemIndex + 1} of {currentCategory.items.length} in Category {currentCategory.category}
                </p>
              </div>

              <button
                onClick={handleItemComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {currentItemIndex < currentCategory.items.length - 1
                  ? 'Next Item'
                  : currentCategoryIndex < categories.length - 1
                  ? 'Next Category'
                  : 'Complete Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* Assessment Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Assessment Guidelines:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Answer all questions thoroughly, providing specific examples from your organization</li>
            <li>• Focus on describing your approach, deployment, and results for each criterion</li>
            <li>• You can navigate between categories and items at any time</li>
            <li>• Your progress is saved automatically</li>
            <li>• Total assessment time: 45-60 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
