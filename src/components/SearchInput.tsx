import { useState, type FormEvent } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-brand-700">
          Find your modem's model name/number
        </h2>
        <p className="text-sm text-gray-500">
          Check the sticker on the back or bottom of your device.
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. TP-Link Archer VR1600v"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />

      <button
        type="submit"
        className="w-full rounded-full bg-brand-500 py-3 text-base font-semibold text-white hover:bg-brand-600 active:bg-brand-700"
      >
        Continue
      </button>
    </form>
  );
}
