"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { baldrigeData } from '@/lib/baldrige-data';

// This is a placeholder for a real Stepper component
const Stepper = ({ completionPercentage }: { completionPercentage: number }) => (
  <div className="sticky top-0 bg-white p-4 shadow-md z-10">
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
    </div>
    <div className="text-center mt-2">{completionPercentage.toFixed(0)}% Complete</div>
  </div>
);

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const assessmentId = "clx9y22g6000008l3g6j2h3k1"; // Hardcoded for now

  useEffect(() => {
    const fetchResponses = async () => {
      const res = await fetch(`/api/assessment/responses?assessmentId=${assessmentId}`);
      if (res.ok) {
        const responses = await res.json();
        const allItemCodes = baldrigeData['organizational-profile']
          .flatMap(p => p.questions.map(q => q.itemCode))
          .concat(
            baldrigeData.categories.flatMap(c =>
              c.items.flatMap(i => i.questions.map(q => q.itemCode))
            )
          );
        const respondedItemCodes = new Set(responses.map((r: any) => r.itemCode));
        const percentage = (respondedItemCodes.size / allItemCodes.length) * 100;
        setCompletionPercentage(percentage);
      }
    };

    fetchResponses();

    // Also listen for custom events that could be dispatched when a response is saved
    const handleResponseSaved = () => fetchResponses();
    window.addEventListener('response-saved', handleResponseSaved);

    return () => {
      window.removeEventListener('response-saved', handleResponseSaved);
    };

  }, [assessmentId, pathname]);

  return (
    <div>
      <Stepper completionPercentage={completionPercentage} />
      <main>{children}</main>
    </div>
  );
}