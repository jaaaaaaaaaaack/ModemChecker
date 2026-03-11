import { useCallback, useState } from "react";
import { searchModems } from "../lib/search";
import type { Modem, SearchState } from "../types";

export function useModemSearch() {
  const [state, setState] = useState<SearchState>({ step: "idle" });

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
    } catch {
      setState({ step: "no_match", query });
    }
  }, []);

  const selectModem = useCallback((modem: Modem) => {
    setState({ step: "single_match", modem });
  }, []);

  const reset = useCallback(() => {
    setState({ step: "idle" });
  }, []);

  return { state, search, selectModem, reset };
}
