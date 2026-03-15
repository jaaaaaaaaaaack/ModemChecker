import { useCallback, useRef, useState } from "react";
import { searchModems } from "../lib/search";
import { getModemImageUrl } from "../lib/supabase";
import { preloadImages } from "../lib/preloadImages";
import type { Modem, SearchState, TransitionDirection } from "../types";

const STEP_ORDINAL: Record<SearchState["step"], number> = {
  idle: 0,
  searching: 1,
  multiple_matches: 2,
  no_match: 2,
  error: 2,
  single_match: 3,
};

export function useModemSearch() {
  const [state, setStateRaw] = useState<SearchState>({ step: "idle" });
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const prevStepRef = useRef<SearchState["step"]>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const setState = useCallback((next: SearchState) => {
    const prevOrd = STEP_ORDINAL[prevStepRef.current];
    const nextOrd = STEP_ORDINAL[next.step];
    setDirection(nextOrd >= prevOrd ? "forward" : "backward");
    prevStepRef.current = next.step;
    setStateRaw(next);
  }, []);

  const search = useCallback(
    async (query: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ step: "searching", query });
      try {
        const results = await searchModems(query, controller.signal);
        if (controller.signal.aborted) return;
        if (results.length === 0) {
          setState({ step: "no_match", query });
        } else {
          // Preload modem images while the loading screen is still visible.
          // Wait at most 2 s — after that the skeleton placeholders take over.
          const urls = results.map((m) => getModemImageUrl(m.id));
          await preloadImages(urls, 2000, controller.signal);
          if (controller.signal.aborted) return;

          if (results.length === 1) {
            setState({ step: "single_match", modem: results[0] });
          } else {
            setState({ step: "multiple_matches", modems: results });
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("[ModemChecker] Search failed:", error);
        setState({ step: "error", query });
      }
    },
    [setState]
  );

  const selectModem = useCallback(
    (modem: Modem) => {
      setState({ step: "single_match", modem });
    },
    [setState]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ step: "idle" });
  }, [setState]);

  const retry = useCallback(() => {
    if (state.step === "error") {
      search(state.query);
    }
  }, [state, search]);

  return { state, direction, search, selectModem, reset, retry };
}
