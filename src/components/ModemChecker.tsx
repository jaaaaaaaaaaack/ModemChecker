import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TechType, Modem, NbnTechType } from "../types";
import { DEFAULT_PLAN_SPEED_MBPS, NBN_PLANS, NBN_TECH_TYPES } from "../constants";
import { contentVariants } from "../lib/animations";
import { getModemImageUrl } from "../lib/supabase";
import { preloadImages } from "../lib/preloadImages";
import { useModemSearch } from "../hooks/useModemSearch";
import { BaseScreen } from "./BaseScreen";
import { BottomSheet } from "./BottomSheet";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { ResultCard } from "./ResultCard";
import { NoMatch } from "./NoMatch";
import { SearchError } from "./SearchError";
import { DevMenu } from "./DevMenu";
import { ModemInfoSheet } from "./ModemInfoSheet";
import { Navbar } from "./Navbar";

export function ModemChecker() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<Modem | undefined>();
  const { state, direction, search, selectModem, reset, retry } = useModemSearch();
  const modemSummaryRef = useRef<HTMLDivElement>(null);

  // Dev menu state
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [modemInfoOpen, setModemInfoOpen] = useState(false);
  const [planId, setPlanId] = useState("nbn500");
  const [nbnTechType, setNbnTechType] = useState<NbnTechType>("fttp");

  // Derive the DB-level techType and plan speed from dev menu selections
  const techOption = NBN_TECH_TYPES.find((t) => t.id === nbnTechType) ?? NBN_TECH_TYPES[0];
  const techType: TechType = techOption.dbTechType;
  const currentPlan = NBN_PLANS.find((p) => p.id === planId) ?? NBN_PLANS[1];
  const planSpeedMbps = currentPlan.speedMbps;

  const handleClose = () => {
    // If the user completed the flow (reached results), preserve the result
    // even when closing via overlay tap / Escape key.
    if (state.step === "single_match") {
      handleDone();
      return;
    }
    setSheetOpen(false);
    reset();
  };

  const handleDone = () => {
    if (state.step === "single_match") {
      // Warm the browser cache so the BaseScreen CheckerCard image is instant
      preloadImages([getModemImageUrl(state.modem.id)]);
      setVerifiedModem(state.modem);
    }
    setSheetOpen(false);
    reset();
  };

  const handleCheckAnother = () => {
    reset();
  };

  const handleAddBelongModem = () => {
    setSheetOpen(false);
    setVerifiedModem(undefined);
    reset();
    // Scroll after sheet close animation settles
    setTimeout(() => {
      modemSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 350);
  };

  return (
    <>
      <Navbar />
      <BaseScreen
        modemSummaryRef={modemSummaryRef}
        onCheckModem={() => setSheetOpen(true)}
        onLearnMore={() => setModemInfoOpen(true)}
        verifiedModem={verifiedModem}
        techType={techType}
        planSpeedMbps={planSpeedMbps}
        nbnTechType={nbnTechType}
        planId={planId}
        onOpenDevMenu={() => setDevMenuOpen(true)}
      />
      <DevMenu
        open={devMenuOpen}
        onClose={() => setDevMenuOpen(false)}
        planId={planId}
        nbnTechType={nbnTechType}
        onPlanChange={setPlanId}
        onTechTypeChange={setNbnTechType}
      />
      <BottomSheet
        open={modemInfoOpen}
        onClose={() => setModemInfoOpen(false)}
        gradient="brand"
        title="Belong modem information"
        height="93vh"
      >
        <ModemInfoSheet onClose={() => setModemInfoOpen(false)} />
      </BottomSheet>
      <BottomSheet open={sheetOpen} onClose={handleClose} height="85vh">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={state.step}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex-1 md:flex-initial flex flex-col min-h-0 px-1 -mx-1"
          >
            {state.step === "idle" && <SearchInput onSearch={search} onClose={handleClose} />}
            {state.step === "searching" && <LoadingState />}
            {state.step === "multiple_matches" && (
              <MultipleMatches
                modems={state.modems}
                onSelect={selectModem}
                onBack={reset}
                onClose={handleClose}
              />
            )}
            {state.step === "single_match" && (
              <ResultCard
                modem={state.modem}
                techType={techType}
                planSpeedMbps={planSpeedMbps}
                onDone={handleDone}
                onReset={handleCheckAnother}
                onAddBelongModem={handleAddBelongModem}
              />
            )}
            {state.step === "no_match" && (
              <NoMatch
                onRetry={reset}
                query={state.query}
              />
            )}
            {state.step === "error" && (
              <SearchError
                query={state.query}
                onRetry={retry}
                onReset={reset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </BottomSheet>
    </>
  );
}
