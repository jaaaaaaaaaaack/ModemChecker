"use client";

import { useState, type FormEvent } from "react";
import { FeatherChevronRight, FeatherX } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
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
        <div className="flex w-full items-start gap-2">
          <span className="flex-1 text-h2 font-h2 text-color-primary-701">
            Find your modem's model name/number
          </span>
          {onClose && (
            <IconButton
              variant="brand-secondary"
              icon={<FeatherX />}
              onClick={onClose}
              aria-label="Close"
            />
          )}
        </div>
        <span className="text-body font-body text-default-font">
          Model details are usually found on the back or bottom of the device.
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-3">
        <span className="text-body-bold font-body-bold text-color-primary-701">
          Type your modem name / model
        </span>
        <TextField className="h-auto w-full flex-none" variant="outline" label="" helpText="">
          <TextField.Input
            placeholder={'"Eero 6", "TP Link R400"'}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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
