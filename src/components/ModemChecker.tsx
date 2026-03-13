import { useState } from "react";
import type { TechType, Modem } from "../types";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import { useModemSearch } from "../hooks/useModemSearch";
import { BaseScreen } from "./BaseScreen";
import { BottomSheet } from "./BottomSheet";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { ResultCard } from "./ResultCard";
import { NoMatch } from "./NoMatch";

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
  const { state, search, selectModem, reset } = useModemSearch();

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
      </BottomSheet>
    </>
  );
}
