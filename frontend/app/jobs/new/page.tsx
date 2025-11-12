'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createJob } from '@/lib/api'

export default function NewJobPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const repoId = searchParams.get('repo_id')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (repoId) {
      handleCreateJob()
    }
  }, [repoId])

  const handleCreateJob = async () => {
    if (!repoId) return

    setLoading(true)
    try {
      const result = await createJob(parseInt(repoId))
      router.push(`/jobs/${result.job_id}`)
    } catch (error) {
      console.error('Failed to create job:', error)
      alert('Failed to create job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {loading ? (
          <p className="text-gray-600">Creating analysis job...</p>
        ) : (
          <p className="text-gray-600">Redirecting...</p>
        )}
      </div>
    </div>
  )
}

