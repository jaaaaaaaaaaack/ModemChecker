import { useState, useLayoutEffect, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomSheet } from "./BottomSheet";
import { Ripple } from "./Ripple";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherArrowRight, FeatherCheck, FeatherX } from "@subframe/core";

const MIN_TEST_DURATION_MS = 5000;
const TEST_TIMEOUT_MS = 8000;

type TestState = "testing" | "success" | "failure" | "error";

interface ConnectionTestSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called when user taps "Back to setup" after a successful test */
  onSuccess: () => void;
  /** Called when user taps "Continue modem setup" after a failed test */
  onContinueSetup: () => void;
  /** URL of the modem image to display during the loading state */
  modemImageUrl: string;
  /** Demo mode: force the test to fail (e.g. re-test from success) */
  demoForceFailure?: boolean;
}

const SHEET_HEIGHT = "auto";

const contentTransition = { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const };

export function ConnectionTestSheet({
  open,
  onClose,
  onSuccess,
  onContinueSetup,
  modemImageUrl,
  demoForceFailure = false,
}: ConnectionTestSheetProps) {
  const [state, setState] = useState<TestState>("testing");
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const demoRef = useRef(demoForceFailure);
  demoRef.current = demoForceFailure;

  // Reset state synchronously before paint when sheet opens
  useLayoutEffect(() => {
    if (open) {
      setState("testing");
    }
  }, [open]);

  // Run the connection test
  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      return;
    }

    let cancelled = false;

    const run = async () => {
      // Demo: re-test from success always shows failure
      if (demoRef.current) {
        await new Promise((r) => setTimeout(r, MIN_TEST_DURATION_MS));
        if (!cancelled) setState("failure");
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const minDelay = new Promise((r) => setTimeout(r, MIN_TEST_DURATION_MS));

      try {
        const timeout = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);
        await Promise.all([
          fetch("https://www.google.com/generate_204", {
            mode: "no-cors",
            signal: controller.signal,
          }),
          minDelay,
        ]);
        clearTimeout(timeout);
        if (!cancelled) setState("success");
      } catch (err) {
        await minDelay;
        if (cancelled) return;
        // Network failures and timeouts → failure
        // Anything truly unexpected → error
        if (
          (err instanceof DOMException && err.name === "AbortError") ||
          err instanceof TypeError
        ) {
          setState("failure");
        } else {
          setState("error");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [open, runId]);

  const handleRetry = useCallback(() => {
    setState("testing");
    setRunId((c) => c + 1);
  }, []);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    onClose();
  }, [onClose]);

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      gradient="brand"
      height={SHEET_HEIGHT}
      overlayOpacity={0.6}
      title="Connection test"
    >
      <div className="relative flex flex-col items-center h-full">
        {/* Close button — top-right, all states */}
        <div className="absolute top-0 right-0 z-20">
          <IconButton
            variant="brand-secondary"
            icon={<FeatherX />}
            onClick={handleClose}
          />
        </div>

        {/* State content */}
        <AnimatePresence mode="wait">
          {state === "testing" && (
            <motion.div
              key="testing"
              className="relative flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              {/* Ripple centered on the modem image */}
              <div className="relative flex items-center justify-center w-[140px] h-[120px]">
                <div className="absolute inset-0 overflow-visible">
                  <Ripple
                    mainCircleSize={140}
                    mainCircleOpacity={0.74}
                    numCircles={8}
                    circleIncrement={90}
                    opacityStep={0.2}
                    duration={2}
                    staggerDelay={0.2}
                    pulseScale={1.3}
                  />
                </div>
                <img
                  src={modemImageUrl}
                  alt=""
                  className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
              <p className="relative z-10 text-h3-500 font-h3-500 text-brand-800 text-center">
                Testing your connection...
              </p>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              className="flex w-full max-w-[448px] flex-col items-center justify-center grow px-6 py-12 mobile:px-4 mobile:py-8 overflow-y-auto scrollbar-brand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex w-full flex-col items-center gap-6 pt-6">
                {/* Wifi hero image */}
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img
                    src="/wifi.webp"
                    alt=""
                    className="w-52"
                  />
                </motion.div>

                <div className="flex w-full flex-col items-center gap-6">
                  {/* Status: green check + heading */}
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <IconWithBackground
                      variant="success-strong"
                      size="medium"
                      icon={<FeatherCheck />}
                    />
                    <span className="text-h2 font-h2 text-brand-900">
                      Connected to nbn&reg;
                    </span>
                  </motion.div>

                  {/* Body copy */}
                  <motion.div
                    className="flex w-full flex-col items-center gap-6 px-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="text-h3-500 font-h3-500 text-brand-900 text-center whitespace-pre-wrap">
                      Great news! Your modem is online, and your new nbn&reg; plan
                      is active.{" "}
                    </span>
                    <span className="text-body font-body text-brand-800 text-center">
                      Over the next few days, we&apos;ll run some health checks to
                      make sure your connection is working correctly. If we notice
                      any speed or stability issues, we&apos;ll get in touch.
                    </span>
                    <span className="text-body-bold font-body-bold text-brand-800 text-center">
                      Enjoy your new Belong nbn&reg; plan!
                    </span>
                  </motion.div>
                </div>

                {/* Actions */}
                <motion.div
                  className="flex w-full flex-col items-center gap-8 pt-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Button
                    className="h-14 w-auto max-w-[320px] rounded-full"
                    variant="brand-primary"
                    iconRight={<FeatherArrowRight />}
                    hasRightIcon={true}
                    onClick={() => {
                      // In production, navigates to customer dashboard
                    }}
                  >
                    Go to your dashboard
                  </Button>
                  <LinkButton variant="brand" onClick={onSuccess}>
                    Return to setup guide
                  </LinkButton>
                </motion.div>
              </div>
            </motion.div>
          )}

          {state === "failure" && (
            <motion.div
              key="failure"
              className="relative z-10 flex flex-col items-center justify-center min-h-[40vh] gap-3 px-6 pt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <h2 className="text-h2 font-h2 text-default-font text-center">
                Not connected yet
              </h2>
              <p className="text-body font-body text-subtext-color text-center max-w-sm">
                All good — there&apos;s a few additional steps we can try that
                resolve many common issues.
              </p>
              <Button
                variant="brand-primary"
                size="medium"
                className="w-full mt-2"
                onClick={onContinueSetup}
              >
                Continue modem setup
              </Button>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              className="relative z-10 flex flex-col items-center justify-center min-h-[40vh] gap-3 px-6 pt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <h2 className="text-h2 font-h2 text-default-font text-center">
                Something went wrong
              </h2>
              <p className="text-body font-body text-subtext-color text-center max-w-sm">
                Sorry, the connection test returned an error. Please try the
                test again.
              </p>
              <Button
                variant="brand-primary"
                size="medium"
                className="w-full mt-2"
                onClick={handleRetry}
              >
                Retry connection test
              </Button>
              <LinkButton onClick={() => {}}>Get support</LinkButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
}
