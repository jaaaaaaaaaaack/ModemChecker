import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getSetupGuide, type GuideEntry } from "../lib/setupGuides";
import { getModemImageUrl } from "../lib/supabase";
import { preloadImages } from "../lib/preloadImages";
import { useModemSearch } from "../hooks/useModemSearch";
import { Navbar } from "./Navbar";
import { BottomSheet } from "./BottomSheet";
import { ModemSearchFlow } from "./ModemSearchFlow";
import { SetupResultCard } from "./SetupResultCard";
import { SetupLanding } from "./SetupLanding";
import { SetupGuideContent } from "./SetupGuideContent";
import { SetupGuideNotAvailable } from "./SetupGuideNotAvailable";
import { SetupDevMenu } from "./SetupDevMenu";
import type { Modem, TechType, NbnTechType } from "../types";

const VALID_TECH_TYPES = new Set(["fttp", "fttc", "hfc", "fttn", "fttb"]);

export function SetupGuide() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modemId = searchParams.get("modem");
  const techParam = searchParams.get("tech");
  const techType: TechType = VALID_TECH_TYPES.has(techParam ?? "")
    ? (techParam as TechType)
    : "fttp";

  const [sheetOpen, setSheetOpen] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [selectedModem, setSelectedModem] = useState<Modem | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [guide, setGuide] = useState<GuideEntry | undefined>(undefined);
  const [guideLoading, setGuideLoading] = useState(!!modemId);
  const { state, direction, search, selectModem, reset, retry } = useModemSearch();

  // Lazy-load the setup guide when modemId changes
  useEffect(() => {
    if (!modemId) {
      setGuide(undefined);
      setGuideLoading(false);
      return;
    }
    setGuideLoading(true);
    let cancelled = false;
    getSetupGuide(modemId)
      .then((g) => {
        if (!cancelled) {
          setGuide(g);
          setGuideLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGuide(undefined);
          setGuideLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [modemId]);

  const hasModemInfo = selectedModem?.id === modemId;

  // Edge case: direct URL to modem without guide and no cached info → clear params
  const showLanding = !modemId || (!!modemId && !guide && !guideLoading && !hasModemInfo);

  const handleSetupModem = useCallback(() => {
    if (state.step === "single_match") {
      const modem = state.modem;
      preloadImages([getModemImageUrl(modem.id)]);
      setSelectedModem(modem);
      reset();

      // Phase 1: Close the sheet (spring ~300ms + overlay fade 200ms)
      setSheetOpen(false);

      // Phase 2: After sheet is visually gone, fade out the dashboard
      setTimeout(() => {
        setTransitioning(true);
      }, 300);

      // Phase 3: After dashboard fades out, swap to guide page
      setTimeout(() => {
        window.scrollTo({ top: 0 });
        setGuideLoading(true);
        setSearchParams({ modem: modem.id, tech: techType });
        // Keep transitioning=true through the swap so the old page
        // doesn't flash back. Clear it on next frame after the new
        // page has mounted, letting its enter animation handle fade-in.
        requestAnimationFrame(() => setTransitioning(false));
      }, 650);
    }
  }, [state, setSearchParams, techType, reset]);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
    reset();
  }, [reset]);

  const handleSearchAgain = useCallback(() => {
    setSelectedModem(null);
    setSearchParams(techType !== "fttp" ? { tech: techType } : {});
  }, [setSearchParams, techType]);

  const handleDevModemChange = useCallback(
    (newModemId: string) => {
      setSearchParams({ modem: newModemId, tech: techType });
    },
    [setSearchParams, techType],
  );

  const handleDevTechChange = useCallback(
    (nbnTech: NbnTechType) => {
      const dbTechType = nbnTech === "fttb" ? "fttn" : nbnTech;
      if (modemId) {
        setSearchParams({ modem: modemId, tech: dbTechType });
      } else {
        setSearchParams(dbTechType !== "fttp" ? { tech: dbTechType } : {});
      }
    },
    [setSearchParams, modemId],
  );

  // Determine page content key for AnimatePresence
  let pageKey: string;
  let pageContent: React.ReactNode;

  if (guideLoading) {
    pageKey = "loading";
    pageContent = (
      <div className="flex w-full flex-col items-start gap-6">
        <h1 className="text-h1 font-h1 text-default-font">BYO modem setup</h1>
        <div className="flex w-full justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-600" />
        </div>
      </div>
    );
  } else if (guide) {
    pageKey = "guide";
    pageContent = (
      <>
        <h1 className="text-h1 font-h1 text-default-font">BYO modem setup</h1>
        <SetupGuideContent
          guide={guide}
          techType={techType}
          onChangeModem={() => setDevMenuOpen(true)}
        />
      </>
    );
  } else if (modemId && hasModemInfo) {
    pageKey = "not-available";
    pageContent = (
      <SetupGuideNotAvailable
        modemId={modemId}
        brand={selectedModem?.brand}
        model={selectedModem?.model}
        onSearchAgain={handleSearchAgain}
      />
    );
  } else {
    pageKey = "landing";
    pageContent = <SetupLanding onGetStarted={() => setSheetOpen(true)} />;
  }

  return (
    <div className="flex w-full flex-col items-center min-h-screen bg-neutral-100">
      <Navbar />
      {showLanding && (
        <motion.div
          className="flex w-full flex-col items-center justify-center bg-black px-4 pt-4 pb-6"
          animate={{ opacity: transitioning ? 0 : 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <span className="text-h1 font-h1 text-white">Welcome, Jack</span>
        </motion.div>
      )}
      <div className={`flex w-full max-w-[576px] flex-col items-center ${showLanding ? "pb-12" : "pt-8 pb-24 mobile:pt-4 mobile:pb-12"}`}>
        <div className={`flex w-full flex-col items-start ${showLanding ? "" : "gap-6 px-6 mobile:gap-6 mobile:px-4"}`}>
          <AnimatePresence mode={transitioning ? "popLayout" : "wait"}>
            <motion.div
              key={pageKey}
              className="flex w-full flex-col items-start gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: transitioning ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: transitioning ? 0.35 : 0.15,
                ease: "easeOut",
              }}
            >
              {pageContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={handleClose} height={state.step === "single_match" ? "90vh" : "85vh"} overlayOpacity={0.6}>
        <ModemSearchFlow
          state={state}
          direction={direction}
          onSearch={search}
          onSelectModem={selectModem}
          onReset={reset}
          onRetry={retry}
          onClose={handleClose}
          renderResult={(modem) => (
            <SetupResultCard
              modem={modem}
              techType={techType}
              onSetupModem={handleSetupModem}
              onCheckAnother={reset}
              onClose={handleClose}
            />
          )}
        />
      </BottomSheet>

      <SetupDevMenu
        open={devMenuOpen}
        onClose={() => setDevMenuOpen(false)}
        currentModemId={modemId}
        nbnTechType={techType === "fttn" ? "fttn" : techType as NbnTechType}
        onModemChange={handleDevModemChange}
        onTechTypeChange={handleDevTechChange}
      />
    </div>
  );
}
