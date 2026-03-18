interface IntegrationItemProps {
  title: string;
  children: React.ReactNode;
}

function IntegrationItem({ title, children }: IntegrationItemProps) {
  return (
    <div className="border-l-[3px] border-l-brand-200 py-1 pl-4">
      <div className="text-sm font-semibold text-doc-text">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-neutral-600">
        {children}
      </div>
    </div>
  );
}

export function IntegrationItems() {
  return (
    <div className="space-y-4">
      <IntegrationItem title="Data migration">
        70 rows of structured data. The schema uses JSONB columns. The existing
        migration file and seed script handle Postgres&rarr;Postgres directly.
        The search tier strategy needs Postgres FTS + pg_trgm &mdash; standard
        extensions.
      </IntegrationItem>

      <IntegrationItem title="Component rebuild">
        13 behavioural components, each with defined props, a corresponding test
        file, and a working visual reference. The rebuild is mapping these to
        our component library equivalents. The state machine (~80 lines) and
        assessment logic transfer unchanged.
      </IntegrationItem>

      <IntegrationItem title="Embedding">
        The assessment logic is presentation-agnostic.{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">
          techType
        </code>{" "}
        and{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">
          planSpeedMbps
        </code>{" "}
        are passed as props &mdash; the checker doesn&rsquo;t need to know about
        the checkout flow&rsquo;s internal state.
      </IntegrationItem>

      <IntegrationItem title="Post-purchase comms">
        When conditions like SWITCH_TO_IPOE are flagged, the production
        implementation should ensure post-activation communications deliver
        specific setup instructions. This is a content/comms task, not a
        technical one.
      </IntegrationItem>
    </div>
  );
}
