import Link from 'next/link'

interface TopNavProps {
  actions?: React.ReactNode
}

export default function TopNav({ actions }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-line-2 bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center text-[16px] font-medium tracking-tight text-ink">
          CodeMentor.AI
        </Link>
        {actions}
      </div>
    </nav>
  )
}
