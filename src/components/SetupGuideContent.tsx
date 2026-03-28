import { Fragment, useState, useMemo, useRef, useEffect, useCallback, createRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModemIdentityCard } from "@/ui/components/ModemIdentityCard";
import { StepCard } from "@/ui/components/StepCard";
import { DeviceConnectionCard } from "@/ui/components/DeviceConnectionCard";
import { PortTypeBadge } from "@/ui/components/PortTypeBadge";
import { NavBreadcrumb } from "@/ui/components/NavBreadcrumb";
import { SubstepCardContainer } from "@/ui/components/SubstepCardContainer";
import { Alert } from "@/ui/components/Alert";
import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { IconButton } from "@/ui/components/IconButton";
import { Spinner } from "./Spinner";
import { getModemImageUrl, getNbnHardwareImageUrl } from "../lib/supabase";
import { NBN_HARDWARE } from "../constants";
import {
  FeatherCheck,
  FeatherInfo,
  FeatherMessageCircle,
  FeatherWifiCog,
  FeatherX,
  FeatherArrowRight,
  FeatherZapOff,
} from "@subframe/core";
import type { StepTemplateId, CredentialType, TechType } from "../types";
import type { GuideEntry } from "../lib/setupGuides";

// --- Constants ---
const MIN_TEST_DURATION_MS = 3000;
const TEST_TIMEOUT_MS = 8000;
const SCROLL_DELAY_MS = 150;

// --- Step sequencing (data contract §4) ---

function getStepSequence(
  adminPanel: { app_only?: boolean; auto_detects_ipoe?: boolean },
): StepTemplateId[] {
  const appOnly = adminPanel.app_only ?? false;
  const autoDetects = adminPanel.auto_detects_ipoe ?? false;

  const steps: StepTemplateId[] = ["power_on", "physical_connection"];

  if (appOnly) {
    steps.push("login_app");
    if (!autoDetects) steps.push("navigate_and_configure");
  } else {
    steps.push("connect_wifi");
    steps.push("login_web");
    if (!autoDetects) steps.push("navigate_and_configure");
  }

  steps.push("verify");
  return steps;
}

function getStepVariant(
  stepIndex: number,
  currentStep: number,
): "current" | "completed" | "upcoming" {
  if (stepIndex < currentStep) return "completed";
  if (stepIndex === currentStep) return "current";
  return "upcoming";
}

const STEP_TITLES: Record<StepTemplateId, string> = {
  power_on: "Plug in and power on",
  physical_connection: "Connect your modem",
  connect_wifi: "Connect to your modem's WiFi",
  login_web: "Log in to your modem",
  login_app: "Set up with the app",
  navigate_and_configure: "Update connection settings",
  verify: "Test your connection",
};

const STEP_DESCRIPTIONS_DSL: Partial<Record<StepTemplateId, string>> = {
  physical_connection:
    "Connect a phone cable from your telephone wall socket to your modem's DSL port.",
};

const STEP_DESCRIPTIONS: Record<StepTemplateId, string> = {
  power_on:
    "Plug in the power cable and turn on your modem. Wait for the power light to come on.",
  physical_connection:
    "Connect an Ethernet cable from your nbn connection box to your modem.",
  connect_wifi:
    "Connect to your modem's WiFi network. Check the sticker on your modem for the WiFi name and password.",
  login_web:
    "Navigate to your modem's admin panel to log in. The default credentials are shown below.",
  login_app:
    "Your modem uses an app for setup and device management. Download the app to your mobile device, open it, and then follow the prompts to get connected.",
  navigate_and_configure:
    "Update your modem's internet settings to work with Belong.",
  verify: "", // Description rendered inline in the connection checker
};

/** Resolve step description, using per-modem data where available */
function getStepDescription(
  templateId: StepTemplateId,
  isDslTech: boolean,
  data: GuideEntry,
): string {
  // DSL override takes priority
  if (isDslTech && STEP_DESCRIPTIONS_DSL[templateId]) {
    return STEP_DESCRIPTIONS_DSL[templateId]!;
  }

  // Verify step: description rendered inline in the connection checker
  if (templateId === "verify") {
    return "";
  }

  return STEP_DESCRIPTIONS[templateId];
}

// --- Success Screen ---

function SetupSuccess({ onBack }: { onBack: () => void }) {
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Gradient background — fades in over the flat bg-brand-50 parent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgb(100 232 247) 0%, rgb(195 249 255) 50vh)",
        }}
      />

      {/* Content — positioned above gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative z-10 flex w-full flex-col items-center justify-center min-h-dvh pt-6 pb-10 px-6"
      >
        {/* Hero image — fades and scales in gently */}
        <motion.div
          initial={{ opacity: 0, scale: 0.2, y: 20 }}
          animate={imageReady ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{
            type: "spring",
            stiffness: 30,
            damping: 14,
            mass: 1.4,
            delay: 1,
          }}
          className="w-full max-w-[200px] mb-6"
        >
          <img
            src="/belongWifi.webp"
            alt="Belong Wi-Fi"
            className="w-full"
            onLoad={() => setImageReady(true)}
          />
        </motion.div>

        {/* Heading — 1.2s behind image */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={imageReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-h1 font-h1 text-brand-900 text-center"
        >
          Welcome to Belong
        </motion.h1>

        {/* Body — 1s behind heading */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={imageReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 3.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-body font-body text-brand-900 text-center max-w-sm mt-3"
        >
          You&apos;re all set up and connected. Enjoy your new internet
          — we&apos;re glad you&apos;re here.
          <span className="block mt-3">
            If you hit any snags, just head back to the setup page and
            we&apos;ll guide you through some extra tips to get things
            running smoothly.
          </span>
        </motion.p>

        {/* CTA — 1s behind body */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={imageReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 4.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-5 mt-6"
        >
          <Button
            variant="brand-primary"
            size="medium"
            iconRight={<FeatherArrowRight />}
            hasRightIcon={true}
            onClick={() => {
              // In production, this would navigate to the customer dashboard
            }}
          >
            Continue to your dashboard
          </Button>
          <LinkButton onClick={onBack}>
            Back to setup page
          </LinkButton>
        </motion.div>
      </motion.div>
    </>
  );
}

interface SetupGuideContentProps {
  guide: GuideEntry;
  techType: TechType;
  onChangeModem: () => void;
}

export function SetupGuideContent({
  guide: data,
  techType,
  onChangeModem,
}: SetupGuideContentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [connectionTest, setConnectionTest] = useState<"idle" | "testing" | "success" | "failure">("idle");
  const connectionTestRef = useRef(connectionTest);
  connectionTestRef.current = connectionTest;

  const runConnectionTest = useCallback(async () => {
    const shouldFail = connectionTestRef.current === "success";
    setConnectionTest("testing");
    if (shouldFail) {
      // Demo: re-test from success always shows failure after a delay
      await new Promise((r) => setTimeout(r, MIN_TEST_DURATION_MS));
      setConnectionTest("failure");
      return;
    }
    const minDelay = new Promise((r) => setTimeout(r, MIN_TEST_DURATION_MS));
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);
      await Promise.all([
        fetch("https://www.google.com/generate_204", {
          mode: "no-cors",
          signal: controller.signal,
        }),
        minDelay,
      ]);
      clearTimeout(timeout);
      setConnectionTest("success");
    } catch {
      await minDelay;
      setConnectionTest("failure");
    }
  }, []);

  // Preload success video once the setup page mounts

  const modemImageUrl = getModemImageUrl(data.id);
  const adminPanel = data.setup.admin_panel;

  // Derive step sequence from modem characteristics
  const steps = useMemo(
    () => getStepSequence(adminPanel),
    [adminPanel.app_only, adminPanel.auto_detects_ipoe],
  );

  const lastStepIndex = steps.length - 1;

  // Refs for smooth scroll on step change
  const stepRefs = useMemo(
    () => steps.map(() => createRef<HTMLDivElement>()),
    [steps],
  );
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const el = stepRefs[currentStep]?.current;
    if (!el) return;
    // Short delay to let the expand animation start
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const navHeight = 80; // sticky navbar + scroll-mt-20
      // Only scroll if the top of the card is above the navbar or below the fold
      if (rect.top < navHeight || rect.top > window.innerHeight * 0.7) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, SCROLL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [currentStep, stepRefs]);

  const handleAdvance = () => {
    setCurrentStep((prev) => Math.min(prev + 1, lastStepIndex));
  };

  // Map credential_type to SubstepCardContainer variant
  const credentialTypeMap: Record<
    string,
    "login-base" | "login-no-credentials" | "login-no-pass" | "app-only"
  > = {
    standard: "login-base",
    user_created: "login-no-credentials",
    isp_sticker: "login-no-pass",
    app_only: "app-only",
  };
  const credentialType = adminPanel.credential_type ?? "standard";
  const credentialVariant = credentialTypeMap[credentialType] ?? "login-base";

  // Select WAN config based on tech type
  const isDslTech = techType === "fttn";
  const wanConfig = isDslTech
    ? (data.setup.wan_config.dsl ?? data.setup.wan_config.ethernet)
    : data.setup.wan_config.ethernet;

  // Whether this router lacks DSL but customer needs it
  const needsDslButMissing = isDslTech && !data.setup.wan_config.dsl;

  // Port label parsing (data contract §6.3)
  const rawPortLabel = data.setup.physical.wan_port_label;
  const rawPortColor = data.setup.physical.wan_port_color;
  const portIcon = data.setup.physical.wan_port_icon;

  const portTypeName = rawPortLabel
    .replace(/^Either\s+/i, "")
    .replace(/\s+port$/i, "")
    .replace(/\s+icon$/i, "");

  const isIconPort = portIcon != null || /icon/i.test(rawPortLabel);
  const isAutoSensing = /^either/i.test(rawPortLabel);
  const colorName = ["blue", "yellow", "grey", "red", "green", "white", "black"].find(
    (c) => rawPortColor?.toLowerCase().startsWith(c),
  );
  const connectionPrefix = isAutoSensing
    ? "Connect to either"
    : colorName
      ? `Connect to the ${colorName}`
      : "Connect to the";
  const badgeLabel = isIconPort ? "Ethernet" : portTypeName;

  // Breadcrumb segments for navigate step
  const navSegments = wanConfig?.nav_path?.split(" > ") ?? [];

  // Protocol for admin URLs
  const protocol = adminPanel.supports_https ? "https" : "http";

  // PPPoE clear note
  const pppoeClearNote = wanConfig?.pppoe_clear_note;

  // Save button label
  const saveButtonLabel = wanConfig?.save_button_label ?? "Save";

  // App name for login_app
  const appName = adminPanel.app_name ?? "the app";

  // NBN hardware for the connection step
  const nbnHardware = NBN_HARDWARE[techType];
  const nbnImageUrl = getNbnHardwareImageUrl(nbnHardware.imageId);

  // --- Render helpers per step template ---

  function renderStepContent(templateId: StepTemplateId) {
    switch (templateId) {
      case "power_on":
        return null; // Static text only — description covers it

      case "physical_connection":
        return (
          <div className="flex w-full flex-col items-center gap-3">
            {/* NBN hardware card */}
            <DeviceConnectionCard
              image={nbnImageUrl}
              deviceName={nbnHardware.deviceName}
              connectionLabel={
                <>
                  Connect to the{" "}
                  <PortTypeBadge
                    variant={nbnHardware.portBadgeColor}
                    portName={nbnHardware.portBadgeLabel}
                    className="inline-flex"
                  />{" "}
                  {nbnHardware.portDescription}
                </>
              }
              note={nbnHardware.variantNote || undefined}
              variant="nbn-hardware"
            />
            {/* Modem card */}
            <DeviceConnectionCard
              image={modemImageUrl}
              deviceName="Your modem"
              connectionLabel={
                <>
                  {connectionPrefix}{" "}
                  <PortTypeBadge
                    variant={
                      colorName === "blue"
                        ? "blue"
                        : colorName === "yellow"
                          ? "yellow"
                          : "neutral"
                    }
                    portName={badgeLabel}
                    hasIcon={isIconPort}
                    className="inline-flex"
                  />{" "}
                  port
                </>
              }
              variant="horizontal-stack"
            />
          </div>
        );

      case "connect_wifi":
        return null; // Static text only — description covers it

      case "login_web":
        return (
          <>
            <SubstepCardContainer
              variant={credentialVariant}
              adminUrlPrimary={
                <a
                  href={`${protocol}://${adminPanel.default_ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-h4-button-500 font-h4-button-500 text-brand-700 underline"
                >
                  {protocol}://{adminPanel.default_ip}
                </a>
              }
              adminUrlSecondary={
                adminPanel.alt_access ? (
                  <a
                    href={`${protocol}://${adminPanel.alt_access}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 underline"
                  >
                    {protocol}://{adminPanel.alt_access}
                  </a>
                ) : undefined
              }
              username={adminPanel.default_username}
              password={adminPanel.default_password}
            />
            <div className="flex w-full min-w-[240px] flex-col items-start gap-2 rounded-md border border-solid border-brand-200 bg-brand-50 px-4 py-4">
              <div className="flex items-start gap-2">
                <FeatherInfo className="h-5 w-5 flex-none mt-0.5 text-brand-800" />
                <div className="flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-brand-800">
                    Can&apos;t log in?
                  </span>
                  <span className="text-body font-body text-brand-700">
                    A factory reset will{" "}
                    {data.setup.factory_reset.restores_default_credentials
                      ? "restore the default login details shown above"
                      : "let you create new login details"}
                    .{" "}
                    <button
                      type="button"
                      className="inline font-medium text-brand-800 underline underline-offset-2"
                    >
                      How to reset your modem
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </>
        );

      case "login_app":
        return (
          <>
            <SubstepCardContainer
              variant="app-only"
              appStoreUrl={adminPanel.app_store_links?.ios}
              playStoreUrl={adminPanel.app_store_links?.android}
            />
            <div className="flex w-full min-w-[240px] flex-col items-start gap-2 rounded-md border border-solid border-brand-200 bg-brand-50 px-4 py-4">
              <div className="flex items-start gap-2">
                <FeatherInfo className="h-5 w-5 flex-none mt-0.5 text-brand-800" />
                <div className="flex flex-col gap-1">
                  <span className="text-body-bold font-body-bold text-brand-800">
                    Having trouble with the app?
                  </span>
                  <span className="text-body font-body text-brand-700">
                    For any issues downloading or using the {appName} app, you&apos;ll need to reach out to {data.brand} for support.
                  </span>
                </div>
              </div>
            </div>
          </>
        );

      case "navigate_and_configure":
        if (needsDslButMissing) {
          return (
            <Alert
              variant="warning"
              title="DSL modem required"
              description="This modem doesn't have a built-in DSL modem. You'll need a separate VDSL2 modem or bridge device for FTTN/FTTB connections."
            />
          );
        }
        return (
          <div className="flex w-full flex-col items-start gap-3">
            {/* Navigate */}
            <div className="flex w-full flex-col items-start gap-3 rounded-md border border-solid border-neutral-300 bg-neutral-50 px-4 py-4">
              <span className="text-body font-body text-default-font">
                From the admin panel's homepage, navigate to the{" "}
                <span className="font-semibold">{navSegments[navSegments.length - 1]}</span>{" "}
                settings page:
              </span>
              <NavBreadcrumb
                hasHome
                steps={
                  <>
                    {navSegments.map((segment: string, i: number) => (
                      <Fragment key={i}>
                        {i > 0 && <NavBreadcrumb.Divider />}
                        <NavBreadcrumb.Segment label={segment} />
                      </Fragment>
                    ))}
                  </>
                }
              />
              {wanConfig?.nav_path_notes && (
                <div className="flex items-center gap-1.5 text-brand-700">
                  <FeatherInfo className="h-3.5 w-3.5 flex-none" />
                  <span className="text-caption font-caption">{wanConfig.nav_path_notes}</span>
                </div>
              )}
            </div>
            {/* PPPoE clear conditional — only shown when modem has distinct PPPoE fields to clear */}
            {pppoeClearNote && (
              <StepCard.ConditionalBlock
                variant="optional"
                body={
                  <span className="text-body font-body text-color-accent2-800">
                    {pppoeClearNote}
                  </span>
                }
              />
            )}
            {/* Change setting */}
            <div className="flex w-full flex-col items-start gap-3 rounded-md border border-solid border-neutral-300 bg-neutral-50 px-4 py-4">
              <div className="flex w-full flex-col items-start gap-1.5">
                <span className="text-body font-body text-default-font leading-[1.5]">
                  Set the &quot;<span className="font-semibold">{wanConfig?.connection_type_field}</span>&quot; setting to{" "}
                  <PortTypeBadge
                    variant="blue"
                    portName={wanConfig?.ipoe_label}
                    className="inline-flex align-baseline"
                  />
                </span>
                {wanConfig?.ipoe_notes && (
                  <div className="flex items-center gap-1.5 text-brand-700">
                    <FeatherInfo className="h-3.5 w-3.5 flex-none" />
                    <span className="text-caption font-caption">{wanConfig.ipoe_notes}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Save and restart */}
            <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-300 bg-neutral-50 px-4 py-4">
              <span className="text-body font-body text-default-font">
                Tap &quot;<span className="font-semibold">{saveButtonLabel}</span>&quot;, then wait 2-3 minutes for your modem to restart and reconnect.
              </span>
            </div>
          </div>
        );

      case "verify":
        return (
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body font-body text-default-font">
              Before you run the test,{" "}
              <span className="font-semibold">make sure this device is connected to your modem&apos;s Wi-Fi network.</span>
            </span>
            <Button
              variant="brand-secondary"
              icon={<FeatherWifiCog />}
              hasLeftIcon={true}
              onClick={runConnectionTest}
              disabled={connectionTest === "testing"}
            >
              {connectionTest === "idle" ? "Test connection" : "Test again"}
            </Button>
            {connectionTest === "testing" && (
              <motion.div
                key="testing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex w-full min-w-[240px] flex-col items-start gap-2 rounded-md bg-brand-100 px-4 py-4"
              >
                <div className="flex items-center gap-2">
                  <Spinner size="small" />
                  <span className="text-h4-button-500 font-h4-button-500 text-brand-800">
                    Running connection test...
                  </span>
                </div>
                <span className="text-body font-body text-brand-800">
                  This should only take a moment
                </span>
              </motion.div>
            )}
            {connectionTest === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex w-full min-w-[240px] flex-col items-start gap-2 rounded-md border border-solid border-color-secondary-300 bg-color-secondary-50 px-4 py-4"
              >
                <div className="flex items-center gap-2">
                  <FeatherCheck className="text-h3-500 font-h3-500 text-success-700" />
                  <span className="text-h4-button-500 font-h4-button-500 text-color-secondary-600">
                    You&apos;re online
                  </span>
                </div>
                <span className="text-body font-body text-color-secondary-600">
                  Great news! You&apos;re connected to the internet. Try out your connection, and if you have any trouble, come back here and check out the troubleshooting steps.
                </span>
              </motion.div>
            )}
            {connectionTest === "failure" && (
              <motion.div
                key="failure"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex w-full min-w-[240px] flex-col items-start gap-4 rounded-md border border-solid border-neutral-300 bg-neutral-100 px-4 py-4"
              >
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <FeatherZapOff className="text-h3-500 font-h3-500 text-neutral-700" />
                    <span className="text-h4-button-500 font-h4-button-500 text-neutral-600">
                      No connection yet
                    </span>
                  </div>
                  <span className="text-body font-body text-neutral-600">
                    Don&apos;t worry, there are a few easy steps we can try to get your modem connected.
                  </span>
                  <Button
                    variant="cyan-tertiary"
                    onClick={() => {}}
                  >
                    Help me troubleshoot
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        );
    }
  }

  function renderPrimaryAction(templateId: StepTemplateId, _stepIdx: number) {
    if (templateId === "verify") {
      return null; // Connection checker handles all actions inline
    }
    return (
      <Button
        variant="cyan-tertiary"
        onClick={handleAdvance}
      >
        Continue to next step
      </Button>
    );
  }

  // Confidence-based rendering gates (data contract §8)
  const confidenceScore = data.setup.setup_confidence.score;
  const showDisclaimer = confidenceScore >= 65 && confidenceScore < 80 && !disclaimerDismissed;

  // Score < 65: don't render guide at all (contract §8)
  if (confidenceScore < 65) {
    return (
      <>
        <ModemIdentityCard
          image={modemImageUrl}
          label="Your modem"
          title={`${data.brand} ${data.model}`}
          action={<LinkButton onClick={onChangeModem}>Edit</LinkButton>}
        />
        <Alert
          variant="warning"
          title="Setup guide unavailable"
          description="We don't have a reliable setup guide for this modem yet. Please contact Belong support for help getting connected."
        />
        <Button
          variant="brand-primary"
          size="medium"
          icon={<FeatherMessageCircle />}
          hasLeftIcon={true}
          onClick={() => {}}
        >
          Get support
        </Button>
      </>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {completed ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="w-full"
        >
          <SetupSuccess onBack={() => {
            setCurrentStep(lastStepIndex);
            setCompleted(false);
          }} />
        </motion.div>
      ) : (
        <motion.div
          key="guide"
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="flex w-full flex-col items-start gap-6"
        >
          {/* Header */}
          <motion.div
            className="flex w-full flex-col items-start gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.06, ease: "easeOut" }}
          >
            <ModemIdentityCard
              image={modemImageUrl}
              label="Your modem"
              title={`${data.brand} ${data.model}`}
              action={<LinkButton onClick={onChangeModem}>Edit</LinkButton>}
            />
            {showDisclaimer && (
              <Alert
                variant="inline-brand"
                title=""
                description="Please note: This guide is based on information sourced from your modem's setup documents and other online sources. It may not always be 100% accurate."
                actions={
                  <IconButton
                    variant="brand-tertiary"
                    size="small"
                    icon={<FeatherX />}
                    onClick={() => setDisclaimerDismissed(true)}
                  />
                }
              />
            )}
          </motion.div>

          {/* Steps — data-driven from sequence */}
          <div className="flex w-full flex-col items-start gap-3">
            <motion.h2
              className="text-h2 font-h2 text-brand-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
            >
              Your setup guide
            </motion.h2>

            {steps.map((templateId, idx) => {
              const variant = getStepVariant(idx, currentStep);
              return (
                <motion.div
                  key={templateId}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.7 + idx * 0.12,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <StepCard
                    ref={stepRefs[idx]}
                    stepNumber={String(idx + 1)}
                    stepTitle={
                      templateId === "login_app"
                        ? <span>Set up with the <span className="text-h4-button-700 font-h4-button-700">{appName}</span> app</span>
                        : STEP_TITLES[templateId]
                    }
                    description={getStepDescription(templateId, isDslTech, data)}
                    infoMessage={undefined}
                    variant={variant}
                    onClick={
                      variant === "completed"
                        ? () => setCurrentStep(idx)
                        : undefined
                    }
                    className={
                      variant === "completed" ? "cursor-pointer" : undefined
                    }
                    primaryAction={renderPrimaryAction(templateId, idx)}
                  >
                    {renderStepContent(templateId)}
                  </StepCard>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex h-px w-full flex-none items-start bg-neutral-300" />
          <div className="flex w-full flex-col items-start justify-center gap-4">
            <span className="text-h4-button-500 font-h4-button-500 text-subtext-color">
              Having trouble getting connected?
            </span>
            <Button
              variant="neutral-secondary"
              icon={<FeatherMessageCircle />}
              hasLeftIcon={true}
              onClick={() => {}}
            >
              Get support
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
