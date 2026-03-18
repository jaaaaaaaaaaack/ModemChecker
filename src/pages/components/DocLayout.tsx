import React, { useEffect } from "react";
import { DocNav } from "./DocNav";

interface DocLayoutProps {
  children: React.ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-doc-bg text-doc-text">
      <DocNav />
      <main className="pb-0 pt-14 leading-[1.7]">
        {children}
      </main>
    </div>
  );
}
