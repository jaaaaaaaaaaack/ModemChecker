import { StatsGrid } from "./components/StatsGrid";
import { ComparisonColumns } from "./components/ComparisonColumns";
import { CompatibilitySimulator } from "./components/CompatibilitySimulator";
import { ArchitectureLayers } from "./components/ArchitectureLayers";
import { LiveWidgetDemo } from "./components/LiveWidgetDemo";
import { FrictionCards } from "./components/FrictionCards";
import { SolutionSteps } from "./components/SolutionSteps";
import { AgentPipeline } from "./components/AgentPipeline";
import { ApplicationCards } from "./components/ApplicationCards";
import { ProductionCards } from "./components/ProductionCards";
import { PullQuote } from "./components/PullQuote";
import { DocLayout } from "./components/DocLayout";
import { navigateTo } from "../hooks/useHashRoute";
import { Alert } from "@/ui/components/Alert";

/** Content-width wrapper */
function Content({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[780px] px-6 ${className}`}>{children}</div>;
}

export default function OverviewPage() {
  return (
    <DocLayout>
      {/* ===== HERO — full-bleed gradient ===== */}
      <section className="relative overflow-hidden bg-neutral-950 px-6 pb-16 pt-20 sm:pb-20 sm:pt-28">
        {/* Subtle gradient accent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(6,182,212,0.3), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-[780px]">
          <p className="mb-4 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-brand-400">
            BYO Modem Compatibility Checker
          </p>
          <h1 className="font-serif text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-[3.2rem]">
            POC &amp; Proposal
          </h1>
          <p className="mt-5 max-w-[540px] text-[1.15rem] leading-relaxed text-neutral-400">
            A working tool that gives customers a clear, instant answer to{" "}
            <em className="text-neutral-300">&ldquo;will my modem work with Belong nbn?&rdquo;</em>
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigateTo("widget")}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 active:scale-[0.97]"
            >
              Try the live demo &rarr;
            </button>
            <button
              onClick={() => navigateTo("technical")}
              className="rounded-full border border-neutral-600 px-6 py-2.5 text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-400 hover:text-white"
            >
              Technical deep-dive
            </button>
          </div>

          <div className="mt-12 border-t border-neutral-800 pt-8">
            <StatsGrid dark />
          </div>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section className="py-16 sm:py-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            The Problem
          </p>
          <h2 className="mb-3 max-w-[600px] font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            A static FAQ page can&rsquo;t answer a dynamic question
          </h2>
          <p className="mb-8 max-w-[600px] text-neutral-500 leading-relaxed">
            Customers who want to bring their own modem land on a page that lists some compatible models
            &mdash; but can&rsquo;t tell them whether <em>their</em> modem will work with <em>their</em> connection type and plan speed. This creates friction at two points:
          </p>
          <FrictionCards />
        </Content>
      </section>

      {/* ===== WHAT THE CHECKER DOES — with live widget on dark bg ===== */}
      <section className="bg-neutral-50 py-16 sm:py-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            The Solution
          </p>
          <h2 className="mb-4 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            What the checker does
          </h2>

          {/* Two-column: steps on left, widget on right */}
          <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr,420px]">
            <SolutionSteps />
            <LiveWidgetDemo />
          </div>
        </Content>
      </section>

      {/* ===== WHAT CHANGED ===== */}
      <section className="pt-16 sm:pt-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            Evolution
          </p>
          <h2 className="mb-8 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            What changed from the LLM version
          </h2>
          <ComparisonColumns />
        </Content>
      </section>

      {/* ===== PULL QUOTE — visual break ===== */}
      <PullQuote>
        The LLM has been moved to where it belongs: powering the{" "}
        <em className="text-brand-700">research pipeline</em>, not the customer-facing assessment.
      </PullQuote>

      {/* ===== DATA QUALITY — tinted band ===== */}
      <section className="border-y border-brand-100 bg-brand-50/50 py-16 sm:py-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-brand-700">
            Data Quality
          </p>
          <h2 className="mb-3 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            Every record has been adversarially challenged
          </h2>
          <p className="mb-8 max-w-[600px] text-neutral-600 leading-relaxed">
            The pipeline uses <strong>three AI agents with opposing incentives</strong>. Each record
            passes through all three before it enters the database.
          </p>

          {/* Agent pipeline visualization */}
          <AgentPipeline />

          {/* Stats + callout row below */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-[1fr,280px]">
            <div>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Every record carries a <strong>confidence score</strong> (minimum 70/100) with
                documented deductions, and every data point traces back to{" "}
                <strong>285 sourced references</strong>.
              </p>
              <p className="text-sm text-doc-muted">
                <button
                  onClick={() => {
                    navigateTo("technical");
                    setTimeout(() => {
                      document.getElementById("research-pipeline")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
                >
                  Full pipeline architecture &rarr;
                </button>
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <Alert
                variant="brand"
                title="Review before production"
                description="Research was conducted by a designer with AI-assisted tooling. The dataset should go through a domain-expert review before production use. The structured format makes this a review task with defined scope, not a rebuild."
              />
            </div>
          </div>
        </Content>
      </section>

      {/* ===== TRY IT ===== */}
      <section className="py-16 sm:py-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            Try It
          </p>
          <h2 className="mb-4 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            The compatibility logic, live
          </h2>
          <p className="mb-8 max-w-[600px] text-neutral-600 leading-relaxed">
            Every verdict comes from a deterministic function. Select a modem, nbn tech type, and
            plan speed to see exactly what the function evaluates. The execution trace shows every step.
          </p>
          <CompatibilitySimulator />
        </Content>
      </section>

      {/* ===== ARCHITECTURE ===== */}
      <section className="border-t border-doc-border bg-neutral-50 py-16 sm:py-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            Architecture
          </p>
          <h2 className="mb-4 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            What&rsquo;s built
          </h2>
          <p className="mb-8 max-w-[600px] text-neutral-600 leading-relaxed">
            The data and logic are directly portable. The presentation is a reference implementation.
          </p>
          <ArchitectureLayers />
        </Content>
      </section>

      {/* ===== BEYOND CHECKOUT — card grid ===== */}
      <section className="py-16 sm:py-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            Future Applications
          </p>
          <h2 className="mb-4 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            Beyond the checkout flow
          </h2>
          <p className="mb-8 max-w-[600px] text-neutral-600 leading-relaxed">
            This POC targets a specific friction point in the conversion journey &mdash; modem
            compatibility uncertainty at checkout. That&rsquo;s the sharpest pain point and
            the most relevant to the current P2O enterprise workstream. But the same data
            and infrastructure opens up several adjacent use cases:
          </p>
          <ApplicationCards />

          <div className="mt-8 rounded-lg border border-brand-100 bg-brand-50/40 px-5 py-4">
            <p className="text-sm leading-relaxed text-brand-900">
              <strong>Pipeline reuse:</strong> The adversarial research pipeline that built the
              compatibility database could be retargeted to build a verified database of{" "}
              <em>BYO modem setup instructions</em> &mdash; specific to each nbn connection type.
              Same three-agent structure, different output schema. The result would be
              tech-type-specific setup guides that replace generic FAQ content with
              step-by-step instructions tailored to the customer&rsquo;s actual modem and connection.
            </p>
          </div>
        </Content>
      </section>

      {/* ===== WHAT'S LEFT — numbered cards ===== */}
      <section className="border-t border-doc-border bg-neutral-50 py-16 sm:py-20">
        <Content>
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            Can we ship it?
          </p>
          <h2 className="mb-8 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em]">
            What&rsquo;s left to build
          </h2>
          <ProductionCards />
        </Content>
      </section>

      {/* ===== RECOMMENDATION — full-bleed closing ===== */}
      <section className="bg-neutral-950 px-6 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-[560px]">
          <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-brand-400">
            Recommendation
          </p>
          <p className="font-serif text-[1.4rem] font-semibold leading-snug text-white sm:text-[1.6rem]">
            The hardest parts &mdash; data research, compatibility logic, UX design &mdash; are done.
            What remains is integration work: the kind of work the team already knows how to do.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => navigateTo("widget")}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 active:scale-[0.97]"
            >
              Try it &rarr;
            </button>
            <button
              onClick={() => navigateTo("technical")}
              className="rounded-full border border-neutral-600 px-6 py-2.5 text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-400 hover:text-white"
            >
              Read the technical deep-dive
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 px-6 py-6 text-center text-xs text-neutral-500">
        BYO Modem Compatibility Checker &mdash; Proof of Concept &bull; March 2026
      </footer>
    </DocLayout>
  );
}
