import { useState } from "react";
import type { Modem, TechType } from "../types";
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

export function ModemChecker({ techType }: ModemCheckerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<
    Pick<Modem, "brand" | "model"> | undefined
  >();
  const { state, search, selectModem, reset } = useModemSearch();

  const handleClose = () => {
    setSheetOpen(false);
    reset();
  };

  const handleDone = () => {
    if (state.step === "single_match") {
      setVerifiedModem({ brand: state.modem.brand, model: state.modem.model });
    }
    setSheetOpen(false);
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
