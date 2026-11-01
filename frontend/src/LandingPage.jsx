import {
  ArrowDown,
  ArrowRight,
  Check,
  FlaskConical,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Truck,
} from 'lucide-react';

const features = [
  {
    number: '01',
    icon: ShieldCheck,
    title: 'Know what is genuine',
    text: 'Check a medicine against its registered batch record before it moves further.',
    color: 'bg-[#e9e2ff] text-[#6242bd]',
  },
  {
    number: '02',
    icon: Truck,
    title: 'Follow its journey',
    text: 'Keep each supply-chain handoff visible, from the manufacturer to the next custodian.',
    color: 'bg-[#ffe2d7] text-[#ba5736]',
  },
  {
    number: '03',
    icon: ScanLine,
    title: 'Verify by scanning',
    text: 'Use a serialized code to check a medicine at the point where it matters.',
    color: 'bg-[#e4f3b5] text-[#4c6b18]',
  },
];

const steps = [
  {
    number: '01',
    title: 'Register',
    text: 'A manufacturer records the medicine batch and its details.',
  },
  {
    number: '02',
    title: 'Trace',
    text: 'Each handoff adds a visible custody record to the journey.',
  },
  {
    number: '03',
    title: 'Verify',
    text: 'A scan checks the medicine against its registered record.',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#faf8f2] text-[#201c32]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .medi-landing { font-family: 'DM Sans', sans-serif; }
        .medi-landing h1, .medi-landing h2, .medi-landing h3, .medi-display {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      <div className="medi-landing">
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6242bd] text-white shadow-lg shadow-violet-900/15">
              <FlaskConical size={22} />
            </span>
            <span className="text-xl font-bold tracking-tight">
              MEDI<span className="text-[#6242bd]">CHAIN</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#625d70] md:flex">
            <a href="#how-it-works" className="transition hover:text-[#6242bd]">
              How it works
            </a>
            <a href="#features" className="transition hover:text-[#6242bd]">
              Features
            </a>
          </nav>

          <a
            href="/app"
            className="rounded-full bg-[#201c32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#6242bd]"
          >
            Open dashboard <ArrowRight className="ml-2 inline" size={16} />
          </a>
        </header>

        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 md:grid-cols-[1.05fr_0.95fr] md:pb-28 md:pt-14">
          <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#e4f3b5]/70 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#e9e2ff]/80 blur-3xl" />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9d2ea] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6242bd]">
              <span className="h-2 w-2 rounded-full bg-[#a0c84d]" />
              A clearer medicine journey
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-0.055em] md:text-7xl">
              From maker
              <br />
              to medicine
              <br />
              <span className="text-[#6242bd]">cabinet.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#625d70]">
              Every handoff matters. MediChain helps make medicine batches
              traceable, verifiable, and easier to trust across the supply chain.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/app"
                className="rounded-full bg-[#6242bd] px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5 hover:bg-[#5032a5]"
              >
                Explore the dashboard <ArrowRight className="ml-2 inline" size={18} />
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-[#d9d2ea] bg-white px-6 py-4 font-bold text-[#201c32] transition hover:border-[#6242bd] hover:text-[#6242bd]"
              >
                See how it works <ArrowDown className="ml-2 inline" size={17} />
              </a>
            </div>

            <p className="mt-5 text-xs font-medium text-[#817b8e]">
              An Ethereum Sepolia project demonstration
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rotate-3 rounded-[2.5rem] bg-[#e4f3b5]" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[#6242bd] p-6 text-white shadow-2xl shadow-violet-950/20 md:p-8">
              <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full border-[30px] border-white/10" />
              <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#a0c84d]" />

              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    The journey, at a glance
                  </p>
                  <h2 className="medi-display mt-2 text-2xl font-bold md:text-3xl">
                    One connected trail.
                  </h2>
                </div>
                <span className="rounded-2xl bg-white/15 p-3">
                  <PackageCheck size={24} />
                </span>
              </div>

              <div className="relative mt-9 rounded-3xl bg-[#faf8f2] p-5 text-[#201c32] md:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#817b8e]">
                  Illustrative supply-chain flow
                </p>

                <div className="relative mt-7 grid grid-cols-3 gap-2">
                  <div className="absolute left-[16%] right-[16%] top-5 h-1 rounded-full bg-[#d9d2ea]" />
                  <div className="absolute left-[16%] top-5 h-1 w-[34%] rounded-full bg-[#a0c84d]" />

                  {[
                    { icon: FlaskConical, label: 'Maker' },
                    { icon: Truck, label: 'Distributor' },
                    { icon: Check, label: 'Pharmacy' },
                  ].map(({ icon: Icon, label }, index) => (
                    <div key={label} className="relative flex flex-col items-center text-center">
                      <span className={`z-10 flex h-11 w-11 items-center justify-center rounded-full ${index < 2 ? 'bg-[#a0c84d] text-[#31420f]' : 'border-2 border-[#d9d2ea] bg-white text-[#817b8e]'}`}>
                        <Icon size={19} />
                      </span>
                      <span className="mt-3 text-xs font-bold">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#eeeaf7] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#6242bd]">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-bold">A record at each step</p>
                    <p className="mt-1 text-xs leading-5 text-[#625d70]">
                      Traceability information is linked to the shared ledger.
                    </p>
                  </div>
                </div>
              </div>

              <p className="relative mt-5 text-center text-xs font-medium text-white/70">
                Concept preview · not live batch information
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-8 bg-white px-6 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6242bd]">
              Built for a more visible supply chain
            </p>
            <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                The details that help people trust the journey.
              </h2>
              <p className="max-w-md leading-7 text-[#625d70]">
                A shared view of registration, custody, and medicine verification.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {features.map(({ number, icon: Icon, title, text, color }) => (
                <article
                  key={number}
                  className="rounded-[1.75rem] border border-[#eeebf2] bg-[#faf8f2] p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                      <Icon size={22} />
                    </span>
                    <span className="medi-display text-sm font-bold text-[#a7a1b2]">{number}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-[#625d70]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-8 px-6 py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6242bd]">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                Three steps.
                <span className="block text-[#6242bd]">One clear trail.</span>
              </h2>
              <p className="mt-5 max-w-md leading-7 text-[#625d70]">
                MediChain connects medicine records with the organizations that
                handle them, so a batch can be checked along its journey.
              </p>
              <a
                href="/app"
                className="mt-7 inline-block rounded-full bg-[#201c32] px-6 py-4 font-bold text-white transition hover:bg-[#6242bd]"
              >
                Open dashboard <ArrowRight className="ml-2 inline" size={17} />
              </a>
            </div>

            <div className="space-y-3">
              {steps.map(({ number, title, text }) => (
                <article
                  key={number}
                  className="flex gap-5 rounded-3xl border border-[#e8e3ef] bg-white p-5 md:p-6"
                >
                  <span className="medi-display flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9e2ff] font-bold text-[#6242bd]">
                    {number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-1 leading-6 text-[#625d70]">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-[#e8e3ef] px-6 py-6 text-center text-sm text-[#817b8e]">
          MediChain · Medicine traceability project
        </footer>
      </div>
    </main>
  );
}