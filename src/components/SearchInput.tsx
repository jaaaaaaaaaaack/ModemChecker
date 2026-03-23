"use client";

import { useState, type FormEvent } from "react";
import { FeatherChevronRight } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";
import { InfoCallout } from "./InfoCallout";

interface SearchInputProps {
  onSearch: (query: string) => void;
  onClose?: () => void;
}

export function SearchInput({ onSearch, onClose }: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-1 flex-col items-start gap-6 min-h-0"
    >
      <div className="flex w-full flex-col items-start gap-3">
        <HeaderWithNavigation
          title="Find your modem"
          variant="2-slot-blue"
          onClose={onClose}
        />
        <span className="text-body font-body text-default-font">
          Enter your modem's name or model number. You can also search by just its brand name, or even the name of the ISP who supplied it to you.
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-3">
        <span className="text-body-bold font-body-bold text-color-primary-701">
          Enter modem name, number, or brand:
        </span>
        <TextField className="h-auto w-full flex-none" variant="outline" label="" helpText="">
          <TextField.Input
            placeholder="eg 'Eero', 'TP-Link', 'Google Nest'..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            autoComplete="off"
          />
        </TextField>
        <InfoCallout variant="in-line">
          You can usually find the model name and number printed on the back or underside of the modem.
        </InfoCallout>
      </div>
      <div className="flex w-full items-center justify-end mt-auto md:mt-10 pt-2">
        <Button
          className="rounded-full"
          variant="brand-primary"
          iconRight={<FeatherChevronRight />}
          type="submit"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
