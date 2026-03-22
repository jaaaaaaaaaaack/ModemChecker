import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getSetupGuide } from "../lib/setupGuides";
import { SetupGuideContent } from "./SetupGuideContent";
import { SetupSearch } from "./SetupSearch";
import { SetupGuideNotAvailable } from "./SetupGuideNotAvailable";
import type { Modem, TechType } from "../types";

const VALID_TECH_TYPES = new Set(["fttp", "fttc", "hfc", "fttn", "fttb"]);

export function SetupGuide() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modemId = searchParams.get("modem");
  const techParam = searchParams.get("tech");
  const techType: TechType = VALID_TECH_TYPES.has(techParam ?? "")
    ? (techParam as TechType)
    : "fttp";

  // Cache the most recent modem from search so we can show brand/model on "not available"
  const [lastSelectedModem, setLastSelectedModem] = useState<Modem | null>(null);

  const handleModemSelected = useCallback(
    (modem: Modem) => {
      setLastSelectedModem(modem);
      setSearchParams({ modem: modem.id, tech: techType });
    },
    [setSearchParams, techType],
  );

  const handleSearchAgain = useCallback(() => {
    setLastSelectedModem(null);
    setSearchParams(techType !== "fttp" ? { tech: techType } : {});
  }, [setSearchParams, techType]);

  // Determine render path:
  // 1. modemId + guide exists → render guide
  // 2. modemId + no guide + we have cached modem info → "not available" with brand/model
  // 3. modemId + no guide + no cached info → search with message (direct URL to unknown modem)
  // 4. no modemId → search
  const guide = modemId ? getSetupGuide(modemId) : undefined;
  const hasModemInfo = lastSelectedModem?.id === modemId;

  let content: React.ReactNode;
  if (guide) {
    content = (
      <>
        <h1 className="text-h1 font-h1 text-brand-800 mobile:text-h2 mobile:font-h2">
          Modem setup guide
        </h1>
        <SetupGuideContent
          guide={guide}
          techType={techType}
          onChangeModem={handleSearchAgain}
        />
      </>
    );
  } else if (modemId && hasModemInfo) {
    content = (
      <SetupGuideNotAvailable
        modemId={modemId}
        brand={lastSelectedModem?.brand}
        model={lastSelectedModem?.model}
        onSearchAgain={handleSearchAgain}
      />
    );
  } else {
    content = (
      <SetupSearch
        onModemSelected={handleModemSelected}
        message={
          modemId
            ? "We couldn't find a setup guide for that modem."
            : undefined
        }
      />
    );
  }

  return (
    <div className="flex w-full flex-col items-center bg-default-background min-h-screen mobile:bg-neutral-100">
      <div className="flex w-full max-w-[576px] flex-col items-center bg-neutral-100 pt-8 pb-24 mobile:pt-4 mobile:pb-12">
        <div className="flex w-full flex-col items-start gap-6 px-6 mobile:gap-6 mobile:px-4">
          {content}
        </div>
      </div>
    </div>
  );
}
