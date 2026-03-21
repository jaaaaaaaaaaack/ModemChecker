import { Fragment, useState } from "react";
import { motion } from "framer-motion";
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
} from "@subframe/core";

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

function getStepVariant(
  stepIndex: number,
  currentStep: number
): "current" | "completed" | "upcoming" {
  if (stepIndex < currentStep) return "completed";
  if (stepIndex === currentStep) return "current";
  return "upcoming";
}

export function SetupGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [techType, setTechType] = useState<TechType>("fttp");
  const [modemIndex, setModemIndex] = useState(0);

  const data = ALL_MODEMS[modemIndex];
  const modemImageUrl = getModemImageUrl(data.id);

  // Map credential_type to SubstepCardContainer variant
  const credentialTypeMap: Record<string, "login-base" | "login-no-credentials" | "login-no-pass" | "app-only"> = {
    standard: "login-base",
    user_created: "login-no-credentials",
    isp_sticker: "login-no-pass",
    app_only: "app-only",
  };
  const credentialVariant = credentialTypeMap[data.setup.admin_panel.credential_type ?? "standard"] ?? "login-base";

  // Select WAN config based on tech type
  const isEthernetTech = ["fttp", "fttc", "hfc"].includes(techType);
  const wanConfig = isEthernetTech
    ? data.setup.wan_config.ethernet
    : data.setup.wan_config.dsl;

  const handleAdvance = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  // Derive port type badge label and connection prefix from data
  const rawPortLabel = data.setup.physical.wan_port_label;
  const rawPortColor = data.setup.physical.wan_port_color;

  // Extract just the port type for the badge (WAN, Ethernet, LAN4/WAN, Internet, etc.)
  const portTypeName = rawPortLabel
    .replace(/^Either\s+/i, "")
    .replace(/\s+port$/i, "")
    .replace(/\s+icon$/i, ""); // "Globe icon" → "Globe" (but we'll override to "Ethernet" for icon ports)

  // Determine if this port uses an icon instead of a text label
  const isIconPort = /icon/i.test(rawPortLabel);

  // Build connection prefix with color for accessibility
  const isAutoSensing = /^either/i.test(rawPortLabel);
  const colorName = ["blue", "yellow", "grey", "red", "green"].find((c) =>
    rawPortColor?.toLowerCase().startsWith(c)
  );
  const connectionPrefix = isAutoSensing
    ? "Connect to either"
    : colorName
    ? `Connect to the ${colorName}`
    : "Connect to the";

  // Badge label: use "Ethernet" for icon-only ports, otherwise the parsed port type
  const badgeLabel = isIconPort ? "Ethernet" : portTypeName;

  // Parse nav_path into breadcrumb segments
  const navSegments = wanConfig?.nav_path?.split(" > ") ?? [];

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
          </div>

          {/* Steps */}
          <div className="flex w-full flex-col items-start gap-3">
            <h2 className="text-h2 font-h2 text-brand-800">Setup steps</h2>

            {/* Step 1: Connect your modem */}
            <StepCard
              stepNumber="1"
              stepTitle="Connect your modem"
              description={`Connect an Ethernet cable from your nbn connection box to your modem.`}
              infoMessage={data.setup.physical.wan_port_notes}
              variant={getStepVariant(0, currentStep)}
              onClick={
                getStepVariant(0, currentStep) === "completed"
                  ? () => setCurrentStep(0)
                  : undefined
              }
              className={
                getStepVariant(0, currentStep) === "completed"
                  ? "cursor-pointer"
                  : undefined
              }
              primaryAction={
                <Button
                  variant="brand-primary"
                  size="medium"
                  icon={<FeatherCheck />}
                  hasLeftIcon={true}
                  onClick={handleAdvance}
                >
                  I've done this
                </Button>
              }
            >
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
            </StepCard>

            {/* Step 2: Log in to your modem */}
            <StepCard
              stepNumber="2"
              stepTitle="Log in to your modem"
              description="Connect to your wifi network, then navigate to your modem's admin panel to login. The username and password below are your modem's defaults."
              variant={getStepVariant(1, currentStep)}
              onClick={
                getStepVariant(1, currentStep) === "completed"
                  ? () => setCurrentStep(1)
                  : undefined
              }
              className={
                getStepVariant(1, currentStep) === "completed"
                  ? "cursor-pointer"
                  : undefined
              }
              primaryAction={
                <Button
                  variant="brand-primary"
                  size="medium"
                  icon={<FeatherCheck />}
                  hasLeftIcon={true}
                  onClick={handleAdvance}
                >
                  I've completed this
                </Button>
              }
            >
              {/* Credential card */}
              <SubstepCardContainer
                variant={credentialVariant}
                adminUrlPrimary={
                  <a
                    href={`http://${data.setup.admin_panel.default_ip}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-h4-button-500 font-h4-button-500 text-brand-700 underline"
                  >
                    http://{data.setup.admin_panel.default_ip}
                  </a>
                }
                adminUrlSecondary={
                  data.setup.admin_panel.alt_access ? (
                    <span className="text-body font-body text-subtext-color">
                      or{" "}
                      <a
                        href={`http://${data.setup.admin_panel.alt_access}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 underline"
                      >
                        http://{data.setup.admin_panel.alt_access}
                      </a>
                    </span>
                  ) : undefined
                }
                username={data.setup.admin_panel.default_username}
                password={data.setup.admin_panel.default_password}
                appName={
                  data.setup.admin_panel.app_only ? (
                    <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                      {data.setup.admin_panel.app_name}
                    </span>
                  ) : undefined
                }
                message={
                  data.setup.admin_panel.app_only ? (
                    <span className="text-body font-body text-subtext-color">
                      Set up your modem using the {data.setup.admin_panel.app_name} app
                    </span>
                  ) : undefined
                }
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
            </StepCard>

            {/* Step 3: Update modem settings */}
            <StepCard
              stepNumber="3"
              stepTitle="Update connection settings"
              description="Update your modem's internet settings so it works with Belong."
              variant={getStepVariant(2, currentStep)}
              onClick={
                getStepVariant(2, currentStep) === "completed"
                  ? () => setCurrentStep(2)
                  : undefined
              }
              className={
                getStepVariant(2, currentStep) === "completed"
                  ? "cursor-pointer"
                  : undefined
              }
              primaryAction={
                <Button
                  variant="brand-primary"
                  size="medium"
                  icon={<FeatherCheck />}
                  hasLeftIcon={true}
                  onClick={handleAdvance}
                >
                  I've done this
                </Button>
              }
            >
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
                    Then click Save
                  </span>
                </div>
                {/* ISP switch conditional */}
                <StepCard.ConditionalBlock
                  variant="info"
                  title={
                    <span className="text-body-bold font-body-bold text-brand-800">
                      Coming from TPG, iiNet, or Internode?
                    </span>
                  }
                  body={
                    <span className="text-body font-body text-brand-700">
                      Before saving, clear the Username and Password fields if
                      they contain your old ISP's credentials.
                    </span>
                  }
                />
              </div>
            </StepCard>

            {/* Step 4: Check connection */}
            <StepCard
              stepNumber="4"
              stepTitle="Restart and check your connection"
              description="Wait 1-2 minutes for your modem to reconnect, then check that the Internet LED is solid green."
              variant={getStepVariant(3, currentStep)}
              primaryAction={
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
              }
            />
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
