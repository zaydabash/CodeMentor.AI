'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getJob, getJobIssues, proposeFixes } from '@/lib/api'
import IssueList from '@/components/IssueList'
import TopNav from '@/components/TopNav'

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
    if (selectedIssues.size === 0) return
    try {
      const result = await proposeFixes(jobId, Array.from(selectedIssues))
      router.push(`/pr/${result.pr_id}`)
    } catch (error) {
      console.error('Failed to generate PR:', error)
    }
  }

  const showIssues = (job?.status === 'pr_ready' || job?.status === 'done') && issues.length > 0

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {loading ? (
          <p className="text-[13.5px] text-ink-2">Loading...</p>
        ) : !job ? (
          <p className="text-[13.5px] text-ink-2">Job not found.</p>
        ) : (
          <>
            <div className="kicker mb-2">Analysis</div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px]">Job #{jobId}</h1>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status={job.status} />
              {job.stats && (
                <span className="text-[13px] text-ink-2">{job.stats.issues_found} issues found</span>
              )}
            </div>

            {job.status === 'analyzing' && (
              <div className="mt-6 rounded-sm border border-line bg-panel p-8 text-center text-[13.5px] text-ink-2">
                Analysis in progress...
              </div>
            )}

            {job.error && (
              <div className="mt-6 rounded-sm border border-sev-red/40 bg-sev-red/[0.08] p-4 text-[13.5px] text-sev-red">
                {job.error}
              </div>
            )}

            {showIssues && (
              <div className="mt-7 rounded-sm border border-line bg-panel">
                <div className="flex items-center justify-between border-b border-line-2 px-5 py-4">
                  <h2 className="text-[14px] font-medium text-ink">Issues</h2>
                  <button
                    onClick={handleGeneratePR}
                    disabled={selectedIssues.size === 0}
                    className="btn-primary rounded-sm px-3.5 py-2 text-[13px] font-normal"
                  >
                    Generate PR draft ({selectedIssues.size})
                  </button>
                </div>
                <IssueList
                  issues={issues}
                  selectedIssues={selectedIssues}
                  onSelectionChange={setSelectedIssues}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    done: 'text-sev-green border-sev-green/30 bg-sev-green/[0.08]',
    pr_ready: 'text-sev-green border-sev-green/30 bg-sev-green/[0.08]',
    error: 'text-sev-red border-sev-red/30 bg-sev-red/[0.08]',
    analyzing: 'text-sev-amber border-sev-amber/30 bg-sev-amber/[0.08]',
    queued: 'text-ink-2 border-line bg-panel-2',
  }
  return (
    <span className={`rounded-sm border px-2.5 py-0.5 font-mono text-[11.5px] ${map[status] || map.queued}`}>
      {status}
    </span>
  )
}
