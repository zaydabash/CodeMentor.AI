import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">CodeMentor.AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/upload" className="text-gray-600 hover:text-gray-900">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Autonomous Debug Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload a repo or paste a Git URL. Get automated bug detection, code smell analysis,
            and PR-ready fixes with plain-English explanations.
          </p>
          <Link
            href="/upload"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Upload & Analyze</h2>
            <p className="text-gray-600">
              Upload a zip file or provide a Git URL. The system parses your codebase and
              identifies potential issues.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">AI-Powered Detection</h2>
            <p className="text-gray-600">
              Combines static analysis tools with LLM reasoning to find bugs, security risks,
              and code smells with confidence scores.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">PR Drafts</h2>
            <p className="text-gray-600">
              Generate unified diffs with explanations, risk notes, and test plans.
              Export as patch files or markdown.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

