interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language }: CodeBlockProps) {
  return (
    <div className="overflow-x-auto rounded-md bg-neutral-900 p-4">
      {language && (
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          {language}
        </div>
      )}
      <pre className="font-mono text-xs leading-relaxed text-neutral-200 whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}
