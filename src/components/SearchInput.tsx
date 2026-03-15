"use client";

import { useState, type FormEvent } from "react";
import { FeatherChevronRight } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";
import { LinkButton } from "@/ui/components/LinkButton";

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
          title="Search for your modem"
          variant="2-slot-blue"
          onClose={onClose}
        />
        <span className="text-body font-body text-default-font">
          Search by brand, model name, or model number. You can usually find these on the back or bottom of your device.
        </span>
      </div>
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
        <LinkButton variant="brand" type="button" onClick={() => {}}>
          Help me find the model name
        </LinkButton>
      </div>
      <div className="flex w-full items-center justify-end mt-auto pt-2">
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
