import { Button } from "@/ui/components/Button";

interface SearchErrorProps {
  query: string;
  onRetry: () => void;
  onReset: () => void;
}

export function SearchError({ query, onRetry, onReset }: SearchErrorProps) {
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
      <div className="flex w-full flex-col items-center gap-3 mt-auto pt-2">
        <Button
          className="rounded-full w-full"
          variant="brand-primary"
          onClick={onRetry}
        >
          Try again
        </Button>
        <Button
          className="rounded-full w-full"
          variant="brand-secondary"
          onClick={onReset}
        >
          Start a new search
        </Button>
      </div>
    </div>
  );
}
