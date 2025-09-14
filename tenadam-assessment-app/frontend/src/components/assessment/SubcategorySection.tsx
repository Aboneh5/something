'use client';

import QuestionComponent from './QuestionComponent';
import { Question, Subcategory } from '@/lib/assessment';

interface SubcategorySectionProps {
  subcategory: Subcategory;
  responses: Record<string, any>;
  errors: Record<string, string>;
  onResponseChange: (questionId: string, value: any) => void;
}

export default function SubcategorySection({
  subcategory,
  responses,
  errors,
  onResponseChange
}: SubcategorySectionProps) {
  return (
    <div className="p-6">
      {/* Subcategory Header */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {subcategory.name}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {subcategory.description}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {(subcategory.questions || []).map((question, index) => (
          <div key={question.id} className="relative">
            <div className="flex items-start space-x-4">
              {/* Question Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                {index + 1}
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <QuestionComponent
                  question={question}
                  value={responses[question.id]}
                  error={errors[question.id]}
                  onChange={(value) => onResponseChange(question.id, value)}
                />
              </div>
            </div>

            {/* Separator */}
            {index < (subcategory.questions || []).length - 1 && (
              <div className="mt-8 border-b border-gray-100" />
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {(subcategory.questions || []).filter(q => responses[q.id]).length} of {(subcategory.questions || []).length} answered
          </span>
          <span>
            {(subcategory.questions || []).filter(q => q.required && !responses[q.id]).length} required remaining
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(((subcategory.questions || []).filter(q => responses[q.id]).length / ((subcategory.questions || []).length || 1)) * 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}