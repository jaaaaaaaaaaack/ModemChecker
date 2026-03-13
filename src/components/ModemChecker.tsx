import { useState } from "react";
import type { Modem, TechType, CompatibilityStatus } from "../types";
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
}

interface VerifiedModem {
  brand: string;
  model: string;
  status: CompatibilityStatus;
}

export function ModemChecker({ techType }: ModemCheckerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<VerifiedModem | undefined>();
  const { state, search, selectModem, reset } = useModemSearch();

  const handleClose = () => {
    setSheetOpen(false);
    reset();
  };

  const handleDone = () => {
    if (state.step === "single_match") {
      const compat = state.modem.compatibility[techType];
      setVerifiedModem({
        brand: state.modem.brand,
        model: state.modem.model,
        status: compat.status,
      });
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
