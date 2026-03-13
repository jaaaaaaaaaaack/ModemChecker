import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TechType, Modem, TransitionDirection } from "../types";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import { useModemSearch } from "../hooks/useModemSearch";
import { BaseScreen } from "./BaseScreen";
import { BottomSheet } from "./BottomSheet";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { ResultCard } from "./ResultCard";
import { NoMatch } from "./NoMatch";
import { SearchError } from "./SearchError";

const contentVariants = {
  enter: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? 6 : -6,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? -6 : 6,
  }),
};

const contentTransition = { duration: 0.15, ease: "easeOut" as const };

interface ModemCheckerProps {
  techType: TechType;
  planSpeedMbps?: number;
}

export function ModemChecker({
  techType,
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
}: ModemCheckerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<Modem | undefined>();
  const { state, direction, search, selectModem, reset, retry } = useModemSearch();

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
        verifiedModem={verifiedModem}
        techType={techType}
        planSpeedMbps={planSpeedMbps}
      />
      <BottomSheet open={sheetOpen} onClose={handleClose}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={state.step}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={contentTransition}
            className="flex-1 flex flex-col min-h-0 px-1 -mx-1"
          >
            {state.step === "idle" && <SearchInput onSearch={search} />}
            {state.step === "searching" && <LoadingState />}
            {state.step === "multiple_matches" && (
              <MultipleMatches
                modems={state.modems}
                onSelect={selectModem}
                onBack={reset}
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
