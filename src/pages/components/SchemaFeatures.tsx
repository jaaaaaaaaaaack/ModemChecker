interface FeatureRowProps {
  lead: string;
  children: React.ReactNode;
}

function FeatureRow({ lead, children }: FeatureRowProps) {
  return (
    <div className="flex gap-3 text-sm text-neutral-600">
      <span className="mt-[7px] block h-2 w-2 flex-shrink-0 rounded-full bg-brand-300" />
      <span className="leading-relaxed">
        <strong className="text-doc-text">{lead}</strong> {children}
      </span>
    </div>
  );
}

export function SchemaFeatures() {
  return (
    <div className="mt-8 space-y-3">
      <h3 className="text-sm font-bold text-doc-text">Key schema features</h3>
      <div className="space-y-2.5">
        <FeatureRow lead="Compatibility is per-tech-type.">
          A modem can be &ldquo;yes&rdquo; on FTTP but &ldquo;no&rdquo; on
          FTTN.
        </FeatureRow>
        <FeatureRow lead="Conditions are specific and actionable.">
          10 condition codes cover real-world &ldquo;yes, but&hellip;&rdquo;
          scenarios.
        </FeatureRow>
        <FeatureRow lead="WAN and WiFi specs are granular.">
          Per-band speeds allow runtime bottleneck detection based on the
          customer&rsquo;s actual plan.
        </FeatureRow>
        <FeatureRow lead="VDSL2 details are captured.">
          Profiles, vectoring, SRA, SOS, and ROC &mdash; all relevant for
          FTTN/FTTB.
        </FeatureRow>
      </div>
    </div>
  );
}
