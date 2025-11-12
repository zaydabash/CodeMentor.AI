'use client'

interface FileTreeProps {
  files: Array<{ path: string; size: number }>
}

export default function FileTree({ files }: FileTreeProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Files</h3>
      <div className="space-y-1">
        {files.map((file, idx) => (
          <div key={idx} className="text-sm text-gray-600">
            {file.path}
          </div>
        ))}
      </div>
    </div>
  )
}

