export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Tenadam Assessment System
        </h1>
        <p className="text-gray-600 mb-8">
          Choose your role to continue
        </p>

        <div className="space-y-4">
          <a
            href="/auth"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </a>

          <a
            href="/assessment"
            className="block w-full bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors"
          >
            Take Assessment
          </a>
        </div>
      </div>
    </div>
  );
}
