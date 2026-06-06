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
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2.5 text-[13.5px] text-ink-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        {loading ? 'Creating analysis job...' : 'Redirecting...'}
      </div>
    </div>
  )
}

