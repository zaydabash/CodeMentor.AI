'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPR } from '@/lib/api'
import DiffViewer from '@/components/DiffViewer'

export default function PRPage() {
  const params = useParams()
  const prId = parseInt(params.id as string)
  const [pr, setPR] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPR = async () => {
      try {
        const prData = await getPR(prId)
        setPR(prData)
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
    const blob = new Blob([patchContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pr.patch'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportMarkdown = () => {
    if (!pr) return

    const md = `# ${pr.title}\n\n${pr.description_md}\n\n## Risk Notes\n\n${pr.risk_notes_md}\n\n## Test Plan\n\n${pr.test_plan_md}`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'PR.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!pr) {
    return <div className="p-8">PR not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-semibold">CodeMentor.AI</a>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportPatch}
                className="text-blue-600 hover:text-blue-800"
              >
                Download .patch
              </button>
              <button
                onClick={handleExportMarkdown}
                className="text-blue-600 hover:text-blue-800"
              >
                Download PR.md
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-4">{pr.title}</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{pr.description_md}</div>
          </div>
        </div>

        {pr.risk_notes_md && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Risk Notes</h2>
            <div className="whitespace-pre-wrap">{pr.risk_notes_md}</div>
          </div>
        )}

        {pr.test_plan_md && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Test Plan</h2>
            <div className="whitespace-pre-wrap">{pr.test_plan_md}</div>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Files Changed</h2>
          {pr.files.map((file: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium">{file.file_path}</h3>
              </div>
              <DiffViewer diff={file.diff_unified} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

