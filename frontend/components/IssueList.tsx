'use client'

import { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { CodeSnippet } from "@/components/CodeSnippet"

interface Issue {
  id: number
  file_path: string
  severity: string
  category: string
  summary: string
  rationale: string
  confidence: number
  line_span?: string // AST analysis provides this
  code_snippet?: string // Optional if we fetch it separately, but ideally included or fetched
}

interface IssueListProps {
  issues: Issue[]
  selectedIssues: Set<number>
  onSelectionChange: (selected: Set<number>) => void
}

export default function IssueList({ issues, selectedIssues, onSelectionChange }: IssueListProps) {
  const [filter, setFilter] = useState<{ severity?: string; category?: string }>({})
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set())

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

  const toggleExpand = (issueId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'destructive'
      case 'med': return 'secondary' // Yellowish usually, but secondary is grey/blue in default theme. we might need custom.
      case 'low': return 'outline'
      default: return 'default'
    }
  }

  const parseLineSpan = (span?: string): { start: number, end: number } => {
    if (!span) return { start: 1, end: 1 };
    const [start, end] = span.split('-').map(Number);
    return { start: start || 1, end: end || start || 1 };
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
        {filteredIssues.map((issue) => {
          const { start, end } = parseLineSpan(issue.line_span);
          return (
            <div
              key={issue.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedIssues.has(issue.id) ? 'border-primary/50 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'
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
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-sm">{issue.summary}</span>
                    <Badge variant={getSeverityVariant(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <Badge variant="outline">
                      {issue.category}
                    </Badge>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-sm text-gray-600">{issue.rationale}</p>
                    <div className="flex items-center text-xs text-gray-500 font-mono">
                      <span>{issue.file_path}</span>
                      <span className="mx-2">:</span>
                      <span>Lines {start}-{end}</span>
                    </div>
                    {/* 
                           In a real app, we would fetch the code snippet here. 
                           For now, we can only display it if passed, or we show a placeholder.
                        */}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                    {(issue.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


