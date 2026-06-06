'use client'

import { useState } from 'react'

interface Issue {
  id: number
  file_path: string
  severity: string
  category: string
  summary: string
  rationale: string
  confidence: number
  line_span?: string
}

interface IssueListProps {
  issues: Issue[]
  selectedIssues: Set<number>
  onSelectionChange: (selected: Set<number>) => void
}

const severityClass: Record<string, string> = {
  high: 'text-sev-red border-sev-red/30 bg-sev-red/[0.08]',
  med: 'text-sev-amber border-sev-amber/30 bg-sev-amber/[0.08]',
  low: 'text-ink-2 border-line bg-panel-2',
}

export default function IssueList({ issues, selectedIssues, onSelectionChange }: IssueListProps) {
  const [filter, setFilter] = useState<{ severity?: string; category?: string }>({})

  const filteredIssues = issues.filter((issue) => {
    if (filter.severity && issue.severity !== filter.severity) return false
    if (filter.category && issue.category !== filter.category) return false
    return true
  })

  const toggleIssue = (issueId: number) => {
    const newSelected = new Set(selectedIssues)
    if (newSelected.has(issueId)) newSelected.delete(issueId)
    else newSelected.add(issueId)
    onSelectionChange(newSelected)
  }

  const parseLineSpan = (span?: string) => {
    if (!span) return { start: 1, end: 1 }
    const [start, end] = span.split('-').map(Number)
    return { start: start || 1, end: end || start || 1 }
  }

  const selectClasses =
    'rounded-sm border border-line bg-panel-2 px-2.5 py-1.5 text-[12.5px] text-ink-2 focus:border-[#28394C] focus:outline-none'

  return (
    <div>
      <div className="flex gap-2 border-b border-line-2 px-5 py-3.5">
        <select
          value={filter.severity || ''}
          onChange={(e) => setFilter({ ...filter, severity: e.target.value || undefined })}
          className={selectClasses}
        >
          <option value="">All severities</option>
          <option value="high">High</option>
          <option value="med">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filter.category || ''}
          onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
          className={selectClasses}
        >
          <option value="">All categories</option>
          <option value="Bug">Bug</option>
          <option value="Security">Security</option>
          <option value="Code Smell">Code Smell</option>
          <option value="Performance">Performance</option>
          <option value="Maintainability">Maintainability</option>
          <option value="Test Gap">Test Gap</option>
        </select>
      </div>

      <div>
        {filteredIssues.map((issue) => {
          const { start, end } = parseLineSpan(issue.line_span)
          const selected = selectedIssues.has(issue.id)
          return (
            <button
              key={issue.id}
              onClick={() => toggleIssue(issue.id)}
              className={`flex w-full gap-3.5 border-b border-line-2 px-5 py-3.5 text-left transition-colors last:border-b-0 ${
                selected ? 'bg-accent/[0.05]' : 'hover:bg-panel-2/60'
              }`}
            >
              <span
                className={`mt-0.5 grid h-[15px] w-[15px] flex-none place-items-center rounded-sm border ${
                  selected ? 'border-accent bg-accent' : 'border-faint'
                }`}
              >
                {selected && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5.5" stroke="#0C1018" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12.5px] font-medium text-accent">{issue.summary}</span>
                  <span
                    className={`rounded-sm border px-1.5 py-px text-[11px] font-medium ${
                      severityClass[issue.severity] || severityClass.low
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="rounded-sm border border-line px-1.5 py-px text-[11px] text-ink-2">
                    {issue.category}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] text-ink-2">{issue.rationale}</p>
                <p className="mt-1.5 font-mono text-[11.5px] text-faint">
                  {issue.file_path} : {start === end ? start : `${start}-${end}`}
                </p>
              </div>

              <span className="flex-none self-start font-mono text-[11px] text-faint">
                {(issue.confidence * 100).toFixed(0)}%
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
