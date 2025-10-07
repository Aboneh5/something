export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Tenadam Assessment System
          </h1>
          <p className="text-gray-600">
            Choose an assessment type or login as admin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* OCAI Assessment */}
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              OCAI Assessment
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Organizational Culture Assessment Instrument
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• 6 cultural dimensions</li>
              <li>• 24 questions total</li>
              <li>• 20-30 minutes</li>
            </ul>
            <a
              href="/assessment"
              className="block w-full bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors text-center font-medium"
            >
              Start OCAI
            </a>
          </div>

          {/* Baldrige Assessment */}
          <div className="border-2 border-blue-400 rounded-lg p-6 bg-blue-50">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                Baldrige Assessment
              </h2>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                NEW
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Excellence Framework Assessment
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• 7 performance areas</li>
              <li>• 1,000 total points</li>
              <li>• 45-60 minutes</li>
            </ul>
            <a
              href="/baldrige"
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors text-center font-medium"
            >
              Start Baldrige
            </a>
          </div>
        </div>

        <div className="pt-6 border-t">
          <a
            href="/auth"
            className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors text-center font-medium"
          >
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
