'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getJob, getJobIssues, proposeFixes } from '@/lib/api'
import IssueList from '@/components/IssueList'
import FileTree from '@/components/FileTree'

export default function JobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = parseInt(params.id as string)
  const [job, setJob] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobData = await getJob(jobId)
        setJob(jobData)

        if (jobData.status === 'pr_ready' || jobData.status === 'done') {
          const issuesData = await getJobIssues(jobId)
          setIssues(issuesData)
        }
      } catch (error) {
        console.error('Failed to fetch job:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [jobId])

  const handleGeneratePR = async () => {
    if (selectedIssues.size === 0) {
      alert('Please select at least one issue')
      return
    }

    try {
      const result = await proposeFixes(jobId, Array.from(selectedIssues))
      router.push(`/pr/${result.pr_id}`)
    } catch (error) {
      console.error('Failed to generate PR:', error)
      alert('Failed to generate PR. Please try again.')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!job) {
    return <div className="p-8">Job not found</div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Job #{jobId}</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded text-sm ${
              job.status === 'done' ? 'bg-green-100 text-green-800' :
              job.status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {job.status}
            </span>
            {job.stats && (
              <span className="text-gray-600">
                {job.stats.issues_found} issues found
              </span>
            )}
          </div>
        </div>

        {job.status === 'pr_ready' && issues.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Issues</h2>
              <button
                onClick={handleGeneratePR}
                disabled={selectedIssues.size === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Generate PR Draft ({selectedIssues.size})
              </button>
            </div>
            <IssueList
              issues={issues}
              selectedIssues={selectedIssues}
              onSelectionChange={setSelectedIssues}
            />
          </div>
        )}

        {job.status === 'analyzing' && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">Analysis in progress...</p>
          </div>
        )}

        {job.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {job.error}</p>
          </div>
        )}
      </main>
    </div>
  )
}

