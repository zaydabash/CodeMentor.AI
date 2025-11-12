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

  return (
    <div className="overflow-x-auto">
      <div className="flex">
        <div className="flex-1 border-r border-gray-200">
          <div className="bg-gray-50 p-2 font-mono text-xs">
            {leftLines.map((item, idx) => (
              <div
                key={idx}
                className={`p-1 ${
                  item.line.startsWith('-') ? 'bg-red-100' : ''
                }`}
              >
                <span className="text-gray-500 w-8 inline-block">{item.num || ''}</span>
                <span className={item.line.startsWith('-') ? 'text-red-800' : ''}>
                  {item.line || ' '}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 p-2 font-mono text-xs">
            {rightLines.map((item, idx) => (
              <div
                key={idx}
                className={`p-1 ${
                  item.line.startsWith('+') ? 'bg-green-100' : ''
                }`}
              >
                <span className="text-gray-500 w-8 inline-block">{item.num || ''}</span>
                <span className={item.line.startsWith('+') ? 'text-green-800' : ''}>
                  {item.line || ' '}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

