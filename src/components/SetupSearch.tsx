import { useEffect, useRef, useState, type FormEvent } from "react";
import { FeatherChevronRight, FeatherLoader } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { CardButton } from "../ui/components/CardButton";
import { Alert } from "@/ui/components/Alert";
import { getModemImageUrl } from "../lib/supabase";
import { useModemSearch } from "../hooks/useModemSearch";
import type { Modem } from "../types";

interface SetupSearchProps {
  onModemSelected: (modem: Modem) => void;
  message?: string;
}

export function SetupSearch({ onModemSelected, message }: SetupSearchProps) {
  const [query, setQuery] = useState("");
  const { state, search, selectModem, reset, retry } = useModemSearch();
  const onModemSelectedRef = useRef(onModemSelected);
  onModemSelectedRef.current = onModemSelected;

  // Auto-advance on single match
  useEffect(() => {
    if (state.step === "single_match") {
      onModemSelectedRef.current(state.modem);
    }
  }, [state]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) search(trimmed);
  };

  const handleSelect = (modem: Modem) => {
    selectModem(modem);
    onModemSelected(modem);
  };

  const handleRetry = () => {
    if (state.step === "error") {
      retry();
    } else {
      reset();
      setQuery("");
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex w-full flex-col items-start gap-2">
        <h1 className="text-h1 font-h1 text-brand-800 mobile:text-h2 mobile:font-h2">
          Set up your modem
        </h1>
        <span className="text-body font-body text-default-font">
          Search for your modem to get a personalised setup guide.
        </span>
      </div>

      {message && (
        <Alert
          variant="inline-brand"
          title=""
          description={message}
        />
      )}

      {(state.step === "idle" || state.step === "searching") && (
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-body-bold font-body-bold text-color-primary-701">
              Brand, model name, or model number
            </span>
            <TextField className="h-auto w-full flex-none" variant="outline" label="" helpText="">
              <TextField.Input
                placeholder={'"Eero", "TP-Link Archer", "R400"'}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                autoComplete="off"
                disabled={state.step === "searching"}
              />
            </TextField>
          </div>
          <Button
            className="rounded-full"
            variant="brand-primary"
            iconRight={<FeatherChevronRight />}
            type="submit"
            disabled={state.step === "searching"}
          >
            {state.step === "searching" ? "Searching..." : "Find my modem"}
          </Button>
          {state.step === "searching" && (
            <div className="flex w-full items-center justify-center gap-2 py-4" role="status">
              <FeatherLoader className="text-brand-600 animate-spin" />
              <span className="text-body font-body text-brand-800">Finding your modem...</span>
            </div>
          )}
        </form>
      )}

      {state.step === "multiple_matches" && (
        <div className="flex w-full flex-col items-start gap-4">
          <span className="text-body font-body text-brand-800">
            We found multiple matches. Select your modem:
          </span>
          <div className="flex w-full flex-col items-start gap-2">
            {state.modems.map((modem) => (
              <CardButton
                key={modem.id}
                role="button"
                tabIndex={0}
                image={getModemImageUrl(modem.id)}
                modelName={modem.model}
                brand={modem.brand}
                onClick={() => handleSelect(modem)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(modem);
                  }
                }}
                aria-label={`${modem.brand} ${modem.model}`}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              />
            ))}
          </div>
          <LinkButton variant="brand" onClick={handleRetry}>
            Search again
          </LinkButton>
        </div>
      )}

      {state.step === "no_match" && (
        <div className="flex w-full flex-col items-start gap-4">
          <Alert
            variant="warning"
            title="No modem found"
            description={`We couldn't find a modem matching "${state.query}". Check the spelling or try a different search.`}
          />
          <Button variant="brand-secondary" onClick={handleRetry}>
            Try again
          </Button>
        </div>
      )}

      {state.step === "error" && (
        <div className="flex w-full flex-col items-start gap-4">
          <Alert
            variant="warning"
            title="Something went wrong"
            description="We couldn't search for your modem right now. Please check your connection and try again."
          />
          <Button variant="brand-secondary" onClick={handleRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
