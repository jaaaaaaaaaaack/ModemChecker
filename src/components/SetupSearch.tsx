import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FeatherChevronLeft, FeatherChevronRight, FeatherLoader } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { CardButton } from "../ui/components/CardButton";
import { Alert } from "@/ui/components/Alert";
import { getModemImageUrl } from "../lib/supabase";
import { useModemSearch } from "../hooks/useModemSearch";
import type { Modem, TransitionDirection } from "../types";

interface SetupSearchProps {
  onModemSelected: (modem: Modem) => void;
  message?: string;
}

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

export function SetupSearch({ onModemSelected, message }: SetupSearchProps) {
  const [query, setQuery] = useState("");
  const { state, direction, search, selectModem, reset, retry } = useModemSearch();
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

  // Keep loading visible for single_match (parent navigates away immediately)
  const animationKey = state.step === "single_match" ? "searching" : state.step;

  return (
    <div className="flex w-full flex-col items-start gap-6">
      {/* Static heading — anchors the page across all states */}
      <div className="flex w-full flex-col items-start gap-2">
        <h1 className="text-h1 font-h1 text-brand-800 mobile:text-h2 mobile:font-h2">
          Set up your modem
        </h1>
        <span className="text-body font-body text-default-font">
          Search for your modem to get a personalised setup guide.
        </span>
      </div>

      {message && (
        <Alert variant="inline-brand" title="" description={message} />
      )}

      {/* Animated content — transitions between flow states */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={animationKey}
          custom={direction}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="flex w-full flex-col items-start"
        >
          {state.step === "idle" && (
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
                  />
                </TextField>
              </div>
              <Button
                className="rounded-full"
                variant="brand-primary"
                iconRight={<FeatherChevronRight />}
                type="submit"
              >
                Find my modem
              </Button>
            </form>
          )}

          {(state.step === "searching" || state.step === "single_match") && (
            <div
              className="flex w-full flex-col items-center justify-center gap-3 min-h-[160px]"
              role="status"
            >
              <FeatherLoader className="text-[24px] text-brand-600 animate-spin" />
              <span className="text-h3-700 font-h3-700 text-brand-800 text-center">
                Finding your modem...
              </span>
            </div>
          )}

          {state.step === "multiple_matches" && (
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-h4-button-500 font-h4-button-500 text-brand-800">
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
              <Button
                variant="brand-secondary"
                icon={<FeatherChevronLeft />}
                onClick={handleRetry}
              >
                Back
              </Button>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
