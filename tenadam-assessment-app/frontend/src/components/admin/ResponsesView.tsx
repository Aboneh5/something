import { baldrigeData } from "@/lib/baldrige-data";

export default function ResponsesView({ assessment }: { assessment: any }) {
  if (!assessment || !assessment.responses) {
    return <div className="p-4 text-gray-500">No responses available</div>;
  }

  // Group responses by category
  const responsesByCategory: { [key: string]: any[] } = {};
  
  assessment.responses.forEach((response: any) => {
    if (response.question && response.question.subcategory && response.question.subcategory.category) {
      const categoryName = response.question.subcategory.category.name;
      if (!responsesByCategory[categoryName]) {
        responsesByCategory[categoryName] = [];
      }
      responsesByCategory[categoryName].push(response);
    }
  });

  return (
    <div className="space-y-6">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold text-blue-900 mb-2">Assessment Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">Total Responses:</span>
            <p className="text-gray-700">{assessment.totalResponses || 0}</p>
          </div>
          <div>
            <span className="font-semibold">Completion Status:</span>
            <p className="text-gray-700">{assessment.isCompleted ? 'Completed' : 'In Progress'}</p>
          </div>
          <div>
            <span className="font-semibold">Started:</span>
            <p className="text-gray-700">{new Date(assessment.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-semibold">Last Updated:</span>
            <p className="text-gray-700">{new Date(assessment.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {Object.entries(responsesByCategory).map(([categoryName, responses]) => (
        <div key={categoryName} className="border rounded-lg p-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800">{categoryName}</h3>
          <div className="space-y-4">
            {responses.map((response: any) => (
              <div key={response.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {response.question.subcategory.name}
                  </span>
                </div>
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-800">
                    Question: {response.question.questionText}
                  </h4>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {response.responseText || "No response provided"}
                  </p>
                  {response.points !== null && response.points !== undefined && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Points:</span> {response.points}
                    </div>
                  )}
                  {response.responseValue && (
                    <div className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">Response Value:</span> {response.responseValue}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(responsesByCategory).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No responses found for this assessment.</p>
        </div>
      )}
    </div>
  );
}
