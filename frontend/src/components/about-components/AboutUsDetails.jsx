import React from "react";

const AboutUsDetails = () => {
  return (
    <section className="relative overflow-hidden px-6 py-14 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-8 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(54,217,255,0.32),transparent_70%)] blur-3xl" />
        <div className="absolute top-16 right-10 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(25,247,194,0.28),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,147,76,0.26),transparent_70%)] blur-3xl" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      </div>

      <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/40 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100/80">
            About BharatSecure
          </div>
          <h1 className="text-4xl font-semibold text-slate-100 sm:text-5xl lg:text-6xl font-['Space_Grotesk']">
            A safer city starts with a single report.
          </h1>
          <p className="text-base leading-relaxed text-slate-200/90 sm:text-lg font-['Outfit']">
            BharatSecure is built to move critical information from citizens to responders
            in minutes, not hours. We blend real time reporting, smart routing, and
            transparent tracking so every report has a clear path to action. The platform
            is designed for clarity under pressure, with multiple ways to report and a
            direct line of accountability from submission to resolution.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Signal",
                title: "Rapid reporting",
                description: "Text, voice, and media inputs with structured data extraction.",
              },
              {
                label: "Route",
                title: "Smart dispatch",
                description: "Automated categorization and station assignment in real time.",
              },
              {
                label: "Resolve",
                title: "Visible outcomes",
                description: "Status tracking and incident history for transparency.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-[0_18px_40px_rgba(5,10,20,0.55)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                  {item.label}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white font-['Space_Grotesk']">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300/90 font-['Outfit']">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(160deg,rgba(12,18,32,0.9),rgba(8,12,20,0.96))] p-6 shadow-[0_28px_60px_rgba(4,10,20,0.65)]">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">
              Mission Control
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white font-['Space_Grotesk']">
              Built for speed, grounded in trust.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/90 font-['Outfit']">
              We prioritize clear workflows for citizens, operators, and agencies. Every
              alert is structured, verified, and routed with context so responders can act
              decisively.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-[0_20px_50px_rgba(5,10,20,0.55)]">
            <h3 className="text-lg font-semibold text-white font-['Space_Grotesk']">
              What we stand for
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300/90 font-['Outfit']">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Evidence led reporting without friction.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Clear accountability for every incident.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                Human centered design for stressful moments.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Live response loop",
            description:
              "Automated updates keep reporters informed and stations aligned.",
          },
          {
            title: "Actionable insights",
            description:
              "Incident analytics highlight patterns and priority zones.",
          },
          {
            title: "Prepared communities",
            description:
              "Education modules and guidance help people respond with confidence.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/10 bg-slate-900/35 p-6 shadow-[0_18px_40px_rgba(5,10,20,0.5)]"
          >
            <h3 className="text-xl font-semibold text-white font-['Space_Grotesk']">
              {card.title}
            </h3>
            <p className="mt-3 text-sm text-slate-300/90 font-['Outfit']">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-slate-900/40 p-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-2xl font-semibold text-white font-['Space_Grotesk']">
            Ready to make your report count?
          </h3>
          <p className="mt-2 text-sm text-slate-300/90 font-['Outfit']">
            Start a report or explore the features built for faster resolution.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="glass-button rounded-full px-5 py-2 text-sm font-semibold text-cyan-100"
            href="/report-incident"
          >
            Start a report
          </a>
          <a
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/60"
            href="#features"
          >
            Explore features
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutUsDetails;
