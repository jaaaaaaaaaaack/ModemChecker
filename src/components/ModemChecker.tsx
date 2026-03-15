import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TechType, Modem, TransitionDirection, NbnTechType } from "../types";
import { DEFAULT_PLAN_SPEED_MBPS, NBN_PLANS, NBN_TECH_TYPES } from "../constants";
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

const contentVariants = {
  enter: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? 6 : -6,
    scale: 1,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut" as const },
  },
  exit: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? -6 : 6,
    scale: 0.98,
    transition: { duration: 0.25, ease: "easeIn" as const },
  }),
};

export function ModemChecker() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<Modem | undefined>();
  const { state, direction, search, selectModem, reset, retry } = useModemSearch();

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
    setSheetOpen(false);
    reset();
  };

  const handleDone = () => {
    if (state.step === "single_match") {
      setVerifiedModem(state.modem);
    }
    setSheetOpen(false);
    reset();
  };

  const handleCheckAnother = () => {
    reset();
  };

  return (
    <>
      <BaseScreen
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
        gradient="accent2"
        title="Belong modem information"
      >
        <ModemInfoSheet onClose={() => setModemInfoOpen(false)} />
      </BottomSheet>
      <BottomSheet open={sheetOpen} onClose={handleClose}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={state.step}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex-1 flex flex-col min-h-0 px-1 -mx-1"
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
