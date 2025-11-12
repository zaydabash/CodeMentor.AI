'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadZip, importGitUrl } from '@/lib/api'

export default function UploadPage() {
  const [mode, setMode] = useState<'zip' | 'git'>('zip')
  const [file, setFile] = useState<File | null>(null)
  const [gitUrl, setGitUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let repoId: number
      if (mode === 'zip' && file) {
        repoId = await uploadZip(file)
      } else if (mode === 'git' && gitUrl) {
        repoId = await importGitUrl(gitUrl)
      } else {
        return
      }

      router.push(`/jobs/new?repo_id=${repoId}`)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-semibold">CodeMentor.AI</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Upload Repository</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setMode('zip')}
              className={`px-4 py-2 rounded ${
                mode === 'zip' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Upload ZIP
            </button>
            <button
              onClick={() => setMode('git')}
              className={`px-4 py-2 rounded ${
                mode === 'git' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Git URL
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'zip' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select ZIP file
                </label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Git Repository URL
                </label>
                <input
                  type="url"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/user/repo.git"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

