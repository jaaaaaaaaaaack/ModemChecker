import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useModemSearch } from "../hooks/useModemSearch";
import { getSetupGuide, type GuideEntry } from "../lib/setupGuides";
import { getModemImageUrl } from "../lib/supabase";
import { preloadImages } from "../lib/preloadImages";
import { Navbar } from "./Navbar";
import { ModemSearchFlow } from "./ModemSearchFlow";
import { SetupResultCard } from "./SetupResultCard";
import { SetupGuideContent } from "./SetupGuideContent";
import { SetupGuideNotAvailable } from "./SetupGuideNotAvailable";
import { SupportArticlePage } from "./SupportArticlePage";
import type { Modem, TechType } from "../types";

type Phase = "article" | "search" | "guide" | "not-available";

function BreadcrumbChevron() {
  return (
    <svg className="w-3 h-3 mx-1.5 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function Breadcrumbs({ phase, onNavigate }: { phase: "article" | "search" | "guide" | "not-available"; onNavigate: () => void }) {
  return (
    <nav className="flex items-center flex-wrap text-caption font-caption text-neutral-500 py-3 border-b border-neutral-200">
      <span className="hover:text-neutral-700 cursor-default">Home</span>
      <BreadcrumbChevron />
      <button onClick={onNavigate} className="hover:text-neutral-700 transition-colors hover:underline">
        Support &amp; contact
      </button>
      <BreadcrumbChevron />
      <button onClick={onNavigate} className="hover:text-neutral-700 transition-colors hover:underline">
        Internet FAQs
      </button>
      <BreadcrumbChevron />
      {phase === "article" ? (
        <span className="text-neutral-700">Getting started</span>
      ) : (
        <>
          <button onClick={onNavigate} className="hover:text-neutral-700 transition-colors hover:underline">
            Getting started
          </button>
          <BreadcrumbChevron />
          <span className="text-neutral-700">BYO modem setup</span>
        </>
      )}
    </nav>
  );
}

export function SetupGuideInline() {
  const [phase, setPhase] = useState<Phase>("article");
  const [selectedModem, setSelectedModem] = useState<Modem | null>(null);
  const [guide, setGuide] = useState<GuideEntry | undefined>(undefined);
  const techType: TechType = "fttp";
  const { state, direction, search, selectModem, reset, retry } =
    useModemSearch();

  const handleGetStarted = useCallback(() => {
    setPhase("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSetupModem = useCallback(async () => {
    if (state.step !== "single_match") return;
    const modem = state.modem;
    preloadImages([getModemImageUrl(modem.id)]);
    setSelectedModem(modem);

    const guideData = await getSetupGuide(modem.id);
    reset();

    if (guideData) {
      setGuide(guideData);
      setPhase("guide");
    } else {
      setPhase("not-available");
    }
    window.scrollTo({ top: 0 });
  }, [state, reset]);

  const handleSearchAgain = useCallback(() => {
    setSelectedModem(null);
    setGuide(undefined);
    reset();
    setPhase("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [reset]);

  const handleBackToArticle = useCallback(() => {
    reset();
    setPhase("article");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [reset]);

  let pageKey = phase;
  let pageContent: React.ReactNode;

  switch (phase) {
    case "article":
      pageContent = (
        <div className="w-full bg-white">
          <div className="w-full max-w-[720px] mx-auto px-6 mobile:px-4">
            <Breadcrumbs phase="article" onNavigate={handleBackToArticle} />
            <SupportArticlePage onGetStarted={handleGetStarted} />
          </div>
        </div>
      );
      break;
    case "search":
      pageContent = (
        <div className="w-full max-w-[576px] mx-auto px-4 py-8 mobile:py-4">
          <div className="flex flex-col gap-4 mb-6">
            <Breadcrumbs phase="search" onNavigate={handleBackToArticle} />
            <h1 className="text-h1 font-h1 text-default-font">BYO modem setup</h1>
          </div>
          <motion.div
            layout
            transition={{ layout: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
            className="bg-gradient-brand rounded-lg border border-solid border-brand-300 p-5 md:p-6 min-h-[420px] flex flex-col overflow-hidden"
          >
            <ModemSearchFlow
              state={state}
              direction={direction}
              onSearch={search}
              onSelectModem={selectModem}
              onReset={reset}
              onRetry={retry}
              renderResult={(modem) => (
                <SetupResultCard
                  modem={modem}
                  techType={techType}
                  compact
                  onSetupModem={handleSetupModem}
                  onCheckAnother={reset}
                  onClose={handleBackToArticle}
                />
              )}
            />
          </motion.div>
        </div>
      );
      break;
    case "guide":
      pageContent = guide ? (
        <div className="flex w-full max-w-[576px] mx-auto flex-col items-start gap-6 px-6 pt-8 pb-24 mobile:gap-6 mobile:px-4 mobile:pt-4 mobile:pb-12">
          <Breadcrumbs phase="guide" onNavigate={handleBackToArticle} />
          <h1 className="text-h1 font-h1 text-default-font -mt-2">BYO modem setup</h1>
          <SetupGuideContent
            guide={guide}
            techType={techType}
            onChangeModem={handleSearchAgain}
          />
        </div>
      ) : null;
      break;
    case "not-available":
      pageContent = selectedModem ? (
        <div className="flex w-full max-w-[576px] mx-auto flex-col items-start gap-6 px-6 pt-8 pb-24 mobile:gap-6 mobile:px-4 mobile:pt-4 mobile:pb-12">
          <Breadcrumbs phase="not-available" onNavigate={handleBackToArticle} />
          <h1 className="text-h1 font-h1 text-default-font -mt-2">BYO modem setup</h1>
          <SetupGuideNotAvailable
            modemId={selectedModem.id}
            brand={selectedModem.brand}
            model={selectedModem.model}
            omitHeading
            onSearchAgain={handleSearchAgain}
          />
        </div>
      ) : null;
      break;
  }

  return (
    <div className="flex w-full flex-col items-center min-h-screen bg-neutral-100">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          className="flex w-full flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {pageContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
