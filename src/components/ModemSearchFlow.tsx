import { AnimatePresence, motion } from "framer-motion";
import { contentVariants } from "../lib/animations";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { NoMatch } from "./NoMatch";
import { SearchError } from "./SearchError";
import type { SearchState, TransitionDirection, Modem } from "../types";

interface ModemSearchFlowProps {
  state: SearchState;
  direction: TransitionDirection;
  onSearch: (query: string) => void;
  onSelectModem: (modem: Modem) => void;
  onReset: () => void;
  onRetry: () => void;
  onClose?: () => void;
  renderResult: (modem: Modem) => React.ReactNode;
}

export function ModemSearchFlow({
  state,
  direction,
  onSearch,
  onSelectModem,
  onReset,
  onRetry,
  onClose,
  renderResult,
}: ModemSearchFlowProps) {
  return (
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
        {state.step === "idle" && (
          <SearchInput onSearch={onSearch} onClose={onClose} />
        )}
        {state.step === "searching" && <LoadingState />}
        {state.step === "multiple_matches" && (
          <MultipleMatches
            modems={state.modems}
            onSelect={onSelectModem}
            onBack={onReset}
            onClose={onClose}
          />
        )}
        {state.step === "single_match" && renderResult(state.modem)}
        {state.step === "no_match" && (
          <NoMatch onRetry={onReset} query={state.query} />
        )}
        {state.step === "error" && (
          <SearchError
            query={state.query}
            onRetry={onRetry}
            onReset={onReset}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
