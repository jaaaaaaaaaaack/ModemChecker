"use client";

import { useState, type FormEvent } from "react";
import { FeatherChevronRight, FeatherInfo } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";

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
      <div className="flex w-full flex-col items-start gap-2">
        <HeaderWithNavigation
          title="Identify your modem"
          variant="2-slot-blue"
          onClose={onClose}
        />
        <span className="text-body font-body text-default-font">
          Enter the model name/number if you know it, but you can also search by brand, or even just the name of the ISP who supplied the modem to you.
        </span>
        <div className="flex items-start gap-2 mt-1">
          <FeatherInfo className="text-brand-700 flex-none w-4 h-4 mt-0.5" />
          <span className="text-body font-body text-brand-700">
            Model details are usually printed on the back or bottom of the device.
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-3">
        <span className="text-body-bold font-body-bold text-color-primary-701">
          Enter model name, number, or the brand
        </span>
        <TextField className="h-auto w-full flex-none" variant="outline" label="" helpText="">
          <TextField.Input
            placeholder="eg: 'Eero', 'Netgear', 'Google Nest', 'Netgear Nighthawk'"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            autoComplete="off"
          />
        </TextField>
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
