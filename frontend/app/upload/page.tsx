'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadZip, importGitUrl } from '@/lib/api'
import TopNav from '@/components/TopNav'

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
    } finally {
      setLoading(false)
    }
  }

  const tab = (value: 'zip' | 'git', label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`rounded-sm border px-3.5 py-1.5 text-[13px] transition-colors ${
        mode === value
          ? 'border-line bg-panel-2 text-ink'
          : 'border-transparent text-ink-2 hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="kicker mb-2">New analysis</div>
        <h1 className="mb-8 text-[24px]">Upload a repository</h1>

        <div className="rounded-sm border border-line bg-panel p-6">
          <div className="mb-6 flex gap-2">
            {tab('zip', 'Upload ZIP')}
            {tab('git', 'Git URL')}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'zip' ? (
              <div>
                <label className="mb-2 block text-[12.5px] text-ink-2">Select ZIP file</label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="block w-full text-[13px] text-ink-2 file:mr-4 file:rounded-sm file:border file:border-line file:bg-panel-2 file:px-3.5 file:py-2 file:text-[13px] file:text-ink hover:file:border-[#28394C]"
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-[12.5px] text-ink-2">Git repository URL</label>
                <input
                  type="url"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/user/repo.git"
                  required
                  className="w-full rounded-sm border border-line bg-panel-2 px-3 py-2 font-mono text-[13px] text-ink placeholder:text-faint focus:border-[#28394C] focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 w-full rounded-sm px-4 py-2.5 text-[13.5px] font-normal"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-faint">
          Git URL imports require a public repository. If an import fails, upload a ZIP instead.
        </p>
      </main>
    </div>
  )
}
