import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IssueList from '../components/IssueList'

// Mock the shadcn badge since it might use complex tailwind utils
vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, variant }: any) => <span data-testid="badge" data-variant={variant}>{children}</span>
}))

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
            line_span: '10-20'
        }
    ]

    it('renders issue with line span', () => {
        const onSelectionChange = vi.fn()
        render(
            <IssueList
                issues={mockIssues}
                selectedIssues={new Set()}
                onSelectionChange={onSelectionChange}
            />
        )

        // Check for summary
        expect(screen.getByText('Critical failure')).toBeDefined()

        // Check for line span visualization
        // The component renders "Lines 10-20"
        expect(screen.getByText('Lines 10-20')).toBeDefined()

        // Check for file path
        expect(screen.getByText('app.py')).toBeDefined()

        // Check severity badge
        const badge = screen.getByText('high')
        expect(badge).toBeDefined()
    })
})
