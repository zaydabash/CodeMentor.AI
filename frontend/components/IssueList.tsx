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
}

interface IssueListProps {
  issues: Issue[]
  selectedIssues: Set<number>
  onSelectionChange: (selected: Set<number>) => void
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
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId)
    } else {
      newSelected.add(issueId)
    }
    onSelectionChange(newSelected)
  }

  const severityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    med: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  }

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <select
          value={filter.severity || ''}
          onChange={(e) => setFilter({ ...filter, severity: e.target.value || undefined })}
          className="px-3 py-1 border border-gray-300 rounded"
        >
          <option value="">All Severities</option>
          <option value="high">High</option>
          <option value="med">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filter.category || ''}
          onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
          className="px-3 py-1 border border-gray-300 rounded"
        >
          <option value="">All Categories</option>
          <option value="Bug">Bug</option>
          <option value="Security">Security</option>
          <option value="Code Smell">Code Smell</option>
          <option value="Performance">Performance</option>
          <option value="Maintainability">Maintainability</option>
          <option value="Test Gap">Test Gap</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedIssues.has(issue.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => toggleIssue(issue.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    checked={selectedIssues.has(issue.id)}
                    onChange={() => toggleIssue(issue.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="font-medium">{issue.summary}</span>
                  <span className={`px-2 py-1 rounded text-xs ${severityColors[issue.severity] || ''}`}>
                    {issue.severity}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                    {issue.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{issue.rationale}</p>
                <p className="text-xs text-gray-500 ml-6 mt-1">{issue.file_path}</p>
              </div>
              <span className="text-xs text-gray-500">
                {(issue.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

