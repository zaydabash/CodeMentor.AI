import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import IssueList from '../components/IssueList'

describe('IssueList', () => {
  const mockIssues = [
    {
      id: 1,
      file_path: 'app.py',
      severity: 'high',
      category: 'Bug',
      summary: 'Critical failure',
      rationale: 'It crashes',
      confidence: 0.9,
      line_span: '10-20',
    },
  ]

  it('renders issue summary, severity, and file location', () => {
    const onSelectionChange = vi.fn()
    render(
      <IssueList
        issues={mockIssues}
        selectedIssues={new Set()}
        onSelectionChange={onSelectionChange}
      />
    )

    expect(screen.getByText('Critical failure')).toBeDefined()
    // severity badge text ("high") is distinct from the filter option ("High")
    expect(screen.getByText('high')).toBeDefined()
    // "Bug" appears in both the filter dropdown and the issue badge
    expect(screen.getAllByText('Bug').length).toBeGreaterThan(0)
    // file path and line span render together as "app.py : 10-20"
    expect(screen.getByText(/app\.py\s*:\s*10-20/)).toBeDefined()
  })
})
