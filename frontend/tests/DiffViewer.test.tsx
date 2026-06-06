import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DiffViewer from '@/components/DiffViewer'

describe('DiffViewer', () => {
  it('renders diff content', () => {
    const diff = `--- a/test.py
+++ b/test.py
@@ -1,2 +1,2 @@
-old line
+new line
 unchanged`

    render(<DiffViewer diff={diff} />)

    expect(screen.getByText(/old line/)).toBeDefined()
    expect(screen.getByText(/new line/)).toBeDefined()
  })
})

