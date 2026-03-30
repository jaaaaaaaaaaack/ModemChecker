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
  // `state` = actual test result, `displayState` = what's rendered on screen
  const [state, setState] = useState<TestState>("testing");
  const [displayState, setDisplayState] = useState<TestState>("testing");
  const [fadingOut, setFadingOut] = useState(false);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const demoRef = useRef(demoForceFailure);
  demoRef.current = demoForceFailure;

  // Reset state synchronously before paint when sheet opens
  useLayoutEffect(() => {
    if (open) {
      setState("testing");
      setDisplayState("testing");
      setFadingOut(false);
    }
  }, [open]);

  // When test completes (state changes from testing), start the fade-out
  useEffect(() => {
    if (state !== "testing" && displayState === "testing" && !fadingOut) {
      setFadingOut(true);
    }
  }, [state, displayState, fadingOut]);

  // After fade-out animation completes, swap to the result content
  const handleFadeOutComplete = useCallback(() => {
    if (fadingOut) {
      setDisplayState(state);
      setFadingOut(false);
    }
  }, [fadingOut, state]);

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
    setDisplayState("testing");
    setFadingOut(false);
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
      <motion.div
        layout
        transition={{ layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
        className="relative flex flex-col items-center overflow-hidden"
      >
        {/* Close button — top-right, all states */}
        <div className="absolute top-0 right-0 z-20">
          <IconButton
            variant="brand-secondary"
            icon={<FeatherX />}
            onClick={handleClose}
          />
        </div>

        {/* Testing / loading state */}
        {displayState === "testing" && (
          <motion.div
            key="testing"
            className="relative flex flex-col items-center justify-center min-h-[40vh] gap-14 px-4"
            initial={{ opacity: 0 }}
            animate={fadingOut
              ? { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
              : { opacity: 1, transition: contentTransition }
            }
            onAnimationComplete={handleFadeOutComplete}
          >
            {/* Ripple centered on the modem image */}
            <div className="relative flex items-center justify-center w-[140px] h-[120px]">
              <div className="absolute inset-0 overflow-visible">
                <Ripple
                  mainCircleSize={80}
                  mainCircleOpacity={0.6}
                  numCircles={4}
                  expandScale={5}
                  duration={4}
                  staggerDelay={1}
                />
              </div>
              <img
                src={modemImageUrl}
                alt=""
                className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>
            {/* Preload success image during test */}
            <link rel="preload" as="image" href="/wifi.webp" />
            <p className="relative z-10 text-h3-500 font-h3-500 text-brand-800 text-center">
              Testing your connection...
            </p>
          </motion.div>
        )}

        {/* Result states — only mounted after testing fade-out completes */}
        <AnimatePresence mode="popLayout">
          {displayState === "success" && (
            <motion.div
              key="success"
              className="flex w-full max-w-[448px] flex-col items-center justify-center grow py-12 mobile:py-8 overflow-y-auto scrollbar-brand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex w-full flex-col items-center gap-8 pt-4">
                {/* Wifi hero image */}
                <motion.div
                  className="flex max-w-[240px] items-center justify-center"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img
                    src="/wifi.webp"
                    alt=""
                    className="w-64"
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
                    <motion.div
                      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0, delay: 0.3 }}
                    >
                      <IconWithBackground
                        variant="success-strong"
                        size="medium"
                        icon={<FeatherCheck />}
                      />
                    </motion.div>
                    <span className="text-h2 font-h2 text-brand-900">
                      Connected to nbn&reg;
                    </span>
                  </motion.div>

                  {/* Body copy */}
                  <motion.div
                    className="flex w-full flex-col items-center gap-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="text-h4-button-700 font-h4-button-700 text-brand-900 text-center text-balance whitespace-pre-wrap">
                      Great news — Your modem is online and your plan is now active.
                    </span>
                    <span className="text-h4-button-500 font-h4-button-500 text-brand-900 text-center text-balance whitespace-pre-wrap">
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

          {displayState === "failure" && (
            <motion.div
              key="failure"
              className="relative z-10 flex flex-col items-center justify-center min-h-[40vh] gap-3 px-6 pt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <h2 className="text-h2 font-h2 text-default-font text-center text-balance">
                Not connected yet
              </h2>
              <p className="text-body font-body text-subtext-color text-center text-pretty max-w-sm">
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

          {displayState === "error" && (
            <motion.div
              key="error"
              className="relative z-10 flex flex-col items-center justify-center min-h-[40vh] gap-3 px-6 pt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={contentTransition}
            >
              <h2 className="text-h2 font-h2 text-default-font text-center text-balance">
                Something went wrong
              </h2>
              <p className="text-body font-body text-subtext-color text-center text-pretty max-w-sm">
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
      </motion.div>
    </BottomSheet>
  );
}
