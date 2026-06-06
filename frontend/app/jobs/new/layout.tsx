import { Suspense } from 'react'

export default function NewJobLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The page reads useSearchParams(), which must sit inside a Suspense
  // boundary so the route can be statically prerendered.
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <span className="text-[13.5px] text-ink-2">Loading...</span>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
