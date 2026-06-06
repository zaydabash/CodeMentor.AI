'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPR } from '@/lib/api'
import DiffViewer from '@/components/DiffViewer'
import TopNav from '@/components/TopNav'

export default function PRPage() {
  const params = useParams()
  const prId = parseInt(params.id as string)
  const [pr, setPR] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPR = async () => {
      try {
        setPR(await getPR(prId))
      } catch (error) {
        console.error('Failed to fetch PR:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPR()
  }, [prId])

  const handleExportPatch = () => {
    if (!pr) return
    const patchContent = pr.files.map((f: any) => f.diff_unified).join('\n\n')
    download(patchContent, 'pr.patch', 'text/plain')
  }

  const handleExportMarkdown = () => {
    if (!pr) return
    const md = `# ${pr.title}\n\n${pr.description_md}\n\n## Risk Notes\n\n${pr.risk_notes_md}\n\n## Test Plan\n\n${pr.test_plan_md}`
    download(md, 'PR.md', 'text/markdown')
  }

  const download = (content: string, name: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen">
      <TopNav
        actions={
          pr && (
            <div className="flex items-center gap-2">
              <button onClick={handleExportPatch} className="btn-ghost rounded-sm px-3 py-1.5 text-[13px]">
                Download .patch
              </button>
              <button onClick={handleExportMarkdown} className="btn-ghost rounded-sm px-3 py-1.5 text-[13px]">
                Download PR.md
              </button>
            </div>
          )
        }
      />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {loading ? (
          <p className="text-[13.5px] text-ink-2">Loading...</p>
        ) : !pr ? (
          <p className="text-[13.5px] text-ink-2">PR not found.</p>
        ) : (
          <>
            <div className="kicker mb-2">Pull request draft</div>
            <h1 className="text-[24px]">{pr.title}</h1>

            <div className="mt-6 rounded-sm border border-line bg-panel p-6">
              <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-2">{pr.description_md}</div>
            </div>

            {pr.risk_notes_md && (
              <div className="mt-3.5 rounded-sm border border-sev-amber/25 bg-sev-amber/[0.06] p-6">
                <div className="kicker mb-2.5 text-sev-amber">Risk notes</div>
                <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-2">{pr.risk_notes_md}</div>
              </div>
            )}

            {pr.test_plan_md && (
              <div className="mt-3.5 rounded-sm border border-line bg-panel p-6">
                <div className="kicker mb-2.5">Test plan</div>
                <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-2">{pr.test_plan_md}</div>
              </div>
            )}

            <div className="mt-8">
              <div className="kicker mb-3">Files changed ({pr.files.length})</div>
              <div className="space-y-3.5">
                {pr.files.map((file: any, idx: number) => (
                  <div key={idx} className="overflow-hidden rounded-sm border border-line bg-panel">
                    <div className="border-b border-line-2 px-4 py-2.5 font-mono text-[12.5px] text-ink">
                      {file.file_path}
                    </div>
                    <DiffViewer diff={file.diff_unified} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
