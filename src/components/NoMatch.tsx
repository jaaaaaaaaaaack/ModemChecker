import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";

interface NoMatchProps {
  onRetry: () => void;
  query?: string;
}

export function NoMatch({ onRetry, query }: NoMatchProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-6 min-h-0">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-h2 font-h2 text-brand-900">No modem found</span>
        {query && (
          <span className="text-body font-body text-default-font">
            We couldn't find any information for "{query}"
          </span>
        )}
        <span className="text-body font-body text-default-font">
          Double-check your modem's name / model number and try again.
          Alternatively, you can contact the manufacturer to check compatibility
          directly.
        </span>
        <LinkButton variant="brand" size="medium">
          Read the modem compatibility FAQs.
        </LinkButton>
      </div>
      <div className="flex w-full items-center mt-auto md:mt-10 pt-2">
        <Button
          variant="brand-secondary"
          onClick={onRetry}
        >
          Try a new search
        </Button>
      </div>
    </div>
  );
}
