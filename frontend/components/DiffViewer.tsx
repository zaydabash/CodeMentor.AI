'use client'

interface DiffViewerProps {
  diff: string
}

interface LineItem {
  line: string
  num: number | null
}

export default function DiffViewer({ diff }: DiffViewerProps) {
  const lines = diff.split('\n')
  const leftLines: LineItem[] = []
  const rightLines: LineItem[] = []
  let leftLineNum = 1
  let rightLineNum = 1

  for (const line of lines) {
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
      continue
    }
    if (line.startsWith('-')) {
      leftLines.push({ line, num: leftLineNum++ })
      if (!line.startsWith('--')) {
        rightLines.push({ line: '', num: null })
      }
    } else if (line.startsWith('+')) {
      rightLines.push({ line, num: rightLineNum++ })
      if (leftLines.length === rightLines.length - 1) {
        leftLines.push({ line: '', num: null })
      }
    } else {
      leftLines.push({ line, num: leftLineNum++ })
      rightLines.push({ line, num: rightLineNum++ })
    }
  }

  const column = (items: LineItem[], side: 'left' | 'right') => (
    <div className="flex-1 font-mono text-[12px] leading-[1.7]">
      {items.map((item, idx) => {
        const removed = side === 'left' && item.line.startsWith('-')
        const added = side === 'right' && item.line.startsWith('+')
        return (
          <div
            key={idx}
            className={`flex px-3 ${
              removed ? 'bg-sev-red/[0.1]' : added ? 'bg-sev-green/[0.1]' : ''
            }`}
          >
            <span className="w-7 flex-none select-none pr-3 text-right text-faint">{item.num || ''}</span>
            <span
              className={`whitespace-pre ${
                removed ? 'text-sev-red' : added ? 'text-sev-green' : 'text-ink-2'
              }`}
            >
              {item.line || ' '}
            </span>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="overflow-x-auto py-2">
      <div className="flex">
        <div className="flex-1 border-r border-line-2">{column(leftLines, 'left')}</div>
        {column(rightLines, 'right')}
      </div>
    </div>
  )
}
