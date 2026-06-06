import Link from 'next/link'

function Brand() {
  return (
    <span className="flex items-center text-[16px] font-medium tracking-tight text-ink">
      CodeMentor.AI
    </span>
  )
}

const features = [
  {
    title: 'Upload and analyze',
    body: 'Upload a zip file or provide a Git URL. The system parses your codebase and identifies potential issues.',
  },
  {
    title: 'Static analysis plus reasoning',
    body: 'Combines ruff, bandit, and eslint with LLM reasoning to find bugs, security risks, and code smells with confidence scores.',
  },
  {
    title: 'PR drafts',
    body: 'Generate unified diffs with explanations, risk notes, and test plans. Export as patch files or markdown.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-line-2 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Brand />
          <Link href="/upload" className="btn-ghost rounded-sm px-4 py-2 text-[13.5px]">
            Try demo
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-28">
          <div className="kicker mb-6 flex items-center gap-2.5">
            <span className="h-[5px] w-[5px] rounded-full bg-faint" />
            Autonomous debug assistant
          </div>
          <h1 className="max-w-3xl text-[clamp(34px,5vw,50px)] leading-[1.08]">
            Find the bugs, ship the <span className="text-accent">fix</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-2">
            Upload a repository or paste a Git URL. CodeMentor.AI runs static analysis and LLM
            reasoning to surface bugs, security risks, and code smells, then drafts PR-ready fixes
            with plain-English explanations.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/upload" className="btn-primary rounded-sm px-5 py-2.5 text-[14px] font-normal">
              Get started
            </Link>
            <Link href="/upload" className="btn-ghost rounded-sm px-5 py-2.5 text-[14px]">
              Upload a repo
            </Link>
          </div>
        </section>

        <section className="border-t border-line-2 py-20">
          <div className="kicker mb-3">How it works</div>
          <h2 className="mb-12 max-w-xl text-[clamp(22px,3vw,30px)] leading-tight">
            From repository to PR draft in one pass.
          </h2>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {features.map((f, i) => (
              <div key={f.title} className="lift rounded-sm border border-line bg-panel p-7">
                <div className="kicker mb-4 flex items-center gap-2.5">
                  <span className="grid h-[22px] w-[22px] place-items-center rounded-sm border border-line bg-accent/[0.07] text-[11px] font-normal text-accent">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-[15.5px] font-normal text-ink">{f.title}</h3>
                <p className="text-[14px] leading-relaxed text-ink-2">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line-2 py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[12.5px] text-faint">
          <Brand />
          <span>Automated code review and PR drafting.</span>
        </div>
      </footer>
    </div>
  )
}
