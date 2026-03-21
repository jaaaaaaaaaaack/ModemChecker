import { Fragment, useState, useMemo } from "react";
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
import { getModemImageUrl } from "../lib/supabase";
import {
  FeatherCheck,
  FeatherWifi,
  FeatherHelpCircle,
  FeatherMessageCircle,
  FeatherX,
  FeatherAlertTriangle,
} from "@subframe/core";
import type { StepTemplateId, CredentialType } from "../types";

import tpLinkData from "../../data/setup-guides/tp-link-archer-vr1600v.json";
import asusData from "../../data/setup-guides/asus-rt-ax86u.json";
import eeroData from "../../data/setup-guides/amazon-eero-6-plus.json";
import nestData from "../../data/setup-guides/google-nest-wifi-pro.json";
import dlinkData from "../../data/setup-guides/d-link-dsl-2888a.json";
import linksysData from "../../data/setup-guides/linksys-velop-mx4200.json";
import netgearData from "../../data/setup-guides/netgear-nighthawk-rax50.json";
import telstraData from "../../data/setup-guides/telstra-smart-modem-gen-3.json";

const ALL_MODEMS = [
  tpLinkData,
  asusData,
  eeroData,
  nestData,
  dlinkData,
  linksysData,
  netgearData,
  telstraData,
] as const;

type TechType = "fttp" | "fttc" | "hfc" | "fttn" | "fttb";

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
  verify: "Restart and check your connection",
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
  login_app: "Download the app and follow the setup wizard.",
  navigate_and_configure:
    "Update your modem's internet settings so it works with Belong.",
  verify:
    "Wait 1-2 minutes for your modem to reconnect, then check that the Internet LED is solid green.",
};

export function SetupGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [techType, setTechType] = useState<TechType>("fttp");
  const [modemIndex, setModemIndex] = useState(0);

  const data = ALL_MODEMS[modemIndex];
  const modemImageUrl = getModemImageUrl(data.id);
  const adminPanel = data.setup.admin_panel;

  // Derive step sequence from modem characteristics
  const steps = useMemo(
    () => getStepSequence(adminPanel),
    [adminPanel.app_only, adminPanel.auto_detects_ipoe],
  );

  const lastStepIndex = steps.length - 1;

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
  const credentialType: CredentialType =
    (adminPanel as Record<string, unknown>).credential_type as CredentialType ??
    "standard";
  const credentialVariant = credentialTypeMap[credentialType] ?? "login-base";

  // Select WAN config based on tech type
  const isDslTech = techType === "fttn" || techType === "fttb";
  const wanConfig = isDslTech
    ? data.setup.wan_config.dsl
    : data.setup.wan_config.ethernet;

  // Whether this router lacks DSL but customer needs it
  const needsDslButMissing = isDslTech && !data.setup.wan_config.dsl;

  // Port label parsing (data contract §6.3)
  const rawPortLabel = data.setup.physical.wan_port_label;
  const rawPortColor = data.setup.physical.wan_port_color;
  const portIcon = (data.setup.physical as Record<string, unknown>)
    .wan_port_icon as string | null;

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
  const supportsHttps =
    (adminPanel as Record<string, unknown>).supports_https === true;
  const protocol = supportsHttps ? "https" : "http";

  // PPPoE clear note
  const pppoeClearNote = (wanConfig as Record<string, unknown> | undefined)
    ?.pppoe_clear_note as string | undefined;

  // Save button label
  const saveButtonLabel =
    ((wanConfig as Record<string, unknown> | undefined)
      ?.save_button_label as string) ?? "Save";

  // App name for login_app
  const appName = adminPanel.app_name ?? "the app";

  // --- Render helpers per step template ---

  function renderStepContent(templateId: StepTemplateId) {
    switch (templateId) {
      case "power_on":
        return null; // Static text only — description covers it

      case "physical_connection":
        return (
          <DeviceConnectionCard
            image={modemImageUrl}
            deviceName={`${data.brand} ${data.model}`}
            connectionLabel={connectionPrefix}
            variant="horizontal-stack"
            portType2={
              <>
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
                />
                <span className="text-body font-body text-default-font">
                  port
                </span>
              </>
            }
          />
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
                  <span className="text-body font-body text-subtext-color">
                    or{" "}
                    <a
                      href={`${protocol}://${adminPanel.alt_access}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 underline"
                    >
                      {protocol}://{adminPanel.alt_access}
                    </a>
                  </span>
                ) : undefined
              }
              username={adminPanel.default_username}
              password={adminPanel.default_password}
            />
            <Alert
              variant="inline-brand"
              title="Can't log in to the admin panel?"
              description="If the login details above don't work, the password may have been changed. If you've forgotten the login details, you might need to factory reset your modem."
              actions={
                <IconButton
                  variant="brand-tertiary"
                  size="small"
                  icon={<FeatherX />}
                  onClick={() => {}}
                />
              }
            />
          </>
        );

      case "login_app":
        return (
          <SubstepCardContainer
            variant="app-only"
            appName={
              <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                {appName}
              </span>
            }
            message={
              <span className="text-body font-body text-subtext-color">
                Set up your modem using the {appName} app
              </span>
            }
          />
        );

      case "navigate_and_configure":
        if (needsDslButMissing) {
          return (
            <Alert
              variant="inline-warning"
              title="DSL modem required"
              description="This modem doesn't have a built-in DSL modem. You'll need a separate VDSL2 modem or bridge device for FTTN/FTTB connections."
            />
          );
        }
        return (
          <div className="flex w-full flex-col items-start gap-3">
            {/* Navigate */}
            <div className="flex w-full flex-col items-start gap-3 rounded-md bg-white px-4 py-4 shadow-sm">
              <span className="text-caption-bold font-caption-bold text-brand-700">
                Navigate to
              </span>
              <NavBreadcrumb
                hasHome
                steps={
                  <>
                    {navSegments.map((segment, i) => (
                      <Fragment key={i}>
                        {i > 0 && <NavBreadcrumb.Divider />}
                        <NavBreadcrumb.Segment label={segment} />
                      </Fragment>
                    ))}
                  </>
                }
              />
            </div>
            {/* Change setting */}
            <div className="flex w-full flex-col items-start gap-3 rounded-md bg-white px-4 py-4 shadow-sm">
              <span className="text-caption-bold font-caption-bold text-brand-700">
                Change setting
              </span>
              <div className="flex w-full flex-col items-start gap-1">
                <span className="text-body font-body text-brand-800">
                  Set &quot;{wanConfig?.connection_type_field}&quot; to:
                </span>
                <NavBreadcrumb.Segment
                  variant="setting-value"
                  label={wanConfig?.ipoe_label}
                />
              </div>
              <span className="text-body font-body text-brand-700">
                Then click {saveButtonLabel}
              </span>
            </div>
            {/* PPPoE clear conditional (clear_pppoe — embedded, not a separate step) */}
            <StepCard.ConditionalBlock
              variant="info"
              title={
                <span className="text-body-bold font-body-bold text-brand-800">
                  Coming from TPG, iiNet, or Internode?
                </span>
              }
              body={
                <span className="text-body font-body text-brand-700">
                  {pppoeClearNote ??
                    "Before saving, clear the Username and Password fields if they contain your old ISP's credentials."}
                </span>
              }
            />
          </div>
        );

      case "verify":
        return null; // Verify step has custom primaryAction, no child content
    }
  }

  function renderPrimaryAction(templateId: StepTemplateId, stepIdx: number) {
    if (templateId === "verify") {
      return (
        <div className="flex items-start gap-3 mobile:w-full mobile:flex-col mobile:gap-3">
          <Button
            variant="brand-primary"
            size="medium"
            icon={<FeatherWifi />}
            hasLeftIcon={true}
            onClick={() => {}}
          >
            My internet is working
          </Button>
          <Button
            variant="brand-secondary"
            size="medium"
            icon={<FeatherHelpCircle />}
            hasLeftIcon={true}
            onClick={() => {}}
          >
            I still need help
          </Button>
        </div>
      );
    }
    return (
      <Button
        variant="brand-primary"
        size="medium"
        icon={<FeatherCheck />}
        hasLeftIcon={true}
        onClick={handleAdvance}
      >
        I've done this
      </Button>
    );
  }

  // Confidence-based disclaimer (data contract §8)
  const confidenceScore = data.setup.setup_confidence.score;
  const showDisclaimer = confidenceScore < 80;

  return (
    <div className="flex w-full flex-col items-center bg-default-background min-h-screen mobile:bg-neutral-100">
      <div className="flex w-full max-w-[576px] flex-col items-center bg-neutral-100 pt-8 pb-24 mobile:pt-4 mobile:pb-12">
        <div className="flex w-full flex-col items-start gap-6 px-6 mobile:gap-6 mobile:px-4">
          {/* Header */}
          <div className="flex w-full flex-col items-start gap-6">
            <h1 className="text-h1 font-h1 text-brand-800 mobile:text-h2 mobile:font-h2">
              Modem setup guide
            </h1>
            <ModemIdentityCard
              image={modemImageUrl}
              label="Your modem"
              title={`${data.brand} ${data.model}`}
              action={<LinkButton onClick={() => {}}>Change</LinkButton>}
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
                    onClick={() => {}}
                  />
                }
              />
            )}
          </div>

          {/* Steps — data-driven from sequence */}
          <div className="flex w-full flex-col items-start gap-3">
            <h2 className="text-h2 font-h2 text-brand-800">Setup steps</h2>

            {steps.map((templateId, idx) => {
              const variant = getStepVariant(idx, currentStep);
              return (
                <StepCard
                  key={templateId}
                  stepNumber={String(idx + 1)}
                  stepTitle={
                    templateId === "login_app"
                      ? `Set up with ${appName}`
                      : STEP_TITLES[templateId]
                  }
                  description={STEP_DESCRIPTIONS[templateId]}
                  infoMessage={
                    templateId === "physical_connection"
                      ? data.setup.physical.wan_port_notes
                      : undefined
                  }
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
              Talk to support
            </Button>
          </div>

          {/* Dev menu */}
          <div className="flex h-px w-full flex-none items-start bg-neutral-300" />
          <div className="flex w-full flex-col items-start gap-3">
            <span className="text-caption-bold font-caption-bold text-neutral-400">
              Dev menu
            </span>
            <div className="flex w-full flex-col items-start gap-2">
              <select
                value={modemIndex}
                onChange={(e) => {
                  setModemIndex(Number(e.target.value));
                  setCurrentStep(0);
                }}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-body font-body text-default-font"
              >
                {ALL_MODEMS.map((m, i) => (
                  <option key={m.id} value={i}>
                    {m.brand} {m.model}
                  </option>
                ))}
              </select>
              <select
                value={techType}
                onChange={(e) => setTechType(e.target.value as TechType)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-body font-body text-default-font"
              >
                <option value="fttp">FTTP (Ethernet)</option>
                <option value="fttc">FTTC (Ethernet)</option>
                <option value="hfc">HFC (Ethernet)</option>
                <option value="fttn">FTTN (DSL)</option>
                <option value="fttb">FTTB (DSL)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
