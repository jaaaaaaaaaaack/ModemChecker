import { Button } from "@/ui/components/Button";
import { SheetFooter } from "./SheetFooter";

interface SearchErrorProps {
  query: string;
  onRetry: () => void;
  onReset: () => void;
}

export function SearchError({ query: _query, onRetry, onReset }: SearchErrorProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-h2 font-h2 text-brand-900">
          Something went wrong
        </span>
        <span className="text-body font-body text-default-font">
          We couldn't complete your search. Check your internet connection and
          try again.
        </span>
      </div>
      <SheetFooter className="flex-col gap-3">
        <Button
          className="w-full"
          variant="brand-primary"
          onClick={onRetry}
        >
          Try again
        </Button>
        <Button
          className="w-full"
          variant="brand-secondary"
          onClick={onReset}
        >
          Start a new search
        </Button>
      </SheetFooter>
    </div>
  );
}
