import { useCallback, useRef, useState } from "react";
import { searchModems } from "../lib/search";
import type { Modem, SearchState, TransitionDirection } from "../types";

const STEP_ORDINAL: Record<SearchState["step"], number> = {
  idle: 0,
  searching: 1,
  multiple_matches: 2,
  no_match: 2,
  single_match: 3,
};

export function useModemSearch() {
  const [state, setStateRaw] = useState<SearchState>({ step: "idle" });
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const prevStepRef = useRef<SearchState["step"]>("idle");

  const setState = useCallback((next: SearchState) => {
    const prevOrd = STEP_ORDINAL[prevStepRef.current];
    const nextOrd = STEP_ORDINAL[next.step];
    setDirection(nextOrd >= prevOrd ? "forward" : "backward");
    prevStepRef.current = next.step;
    setStateRaw(next);
  }, []);

  const search = useCallback(async (query: string) => {
    setState({ step: "searching", query });
    try {
      const results = await searchModems(query);
      if (results.length === 0) {
        setState({ step: "no_match", query });
      } else if (results.length === 1) {
        setState({ step: "single_match", modem: results[0] });
      } else {
        setState({ step: "multiple_matches", modems: results });
      }
    } catch (error) {
      console.error("[ModemChecker] Search failed:", error);
      setState({ step: "no_match", query });
    }
  }, [setState]);

  const selectModem = useCallback((modem: Modem) => {
    setState({ step: "single_match", modem });
  }, [setState]);

  const reset = useCallback(() => {
    setState({ step: "idle" });
  }, [setState]);

  return { state, direction, search, selectModem, reset };
}
