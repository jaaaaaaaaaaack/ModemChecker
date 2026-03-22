import type { SetupGuideData } from "../types";

import tpLinkData from "../../data/setup-guides/tp-link-archer-vr1600v.json";
import asusData from "../../data/setup-guides/asus-rt-ax86u.json";
import eeroData from "../../data/setup-guides/amazon-eero-6-plus.json";
import nestData from "../../data/setup-guides/google-nest-wifi-pro.json";
import dlinkData from "../../data/setup-guides/d-link-dsl-2888a.json";
import linksysData from "../../data/setup-guides/linksys-velop-mx4200.json";
import netgearData from "../../data/setup-guides/netgear-nighthawk-rax50.json";
import telstraData from "../../data/setup-guides/telstra-smart-modem-gen-3.json";
import netcommData from "../../data/setup-guides/netcomm-nf18acv.json";
import draytekData from "../../data/setup-guides/draytek-vigor-2862.json";
import synologyData from "../../data/setup-guides/synology-rt6600ax.json";
import decoData from "../../data/setup-guides/tp-link-deco-x60.json";
import huaweiData from "../../data/setup-guides/huawei-hg659.json";
import sagemcomData from "../../data/setup-guides/sagemcom-fast-5366-tn.json";
import vr2100Data from "../../data/setup-guides/tp-link-archer-vr2100v.json";

export interface GuideEntry {
  id: string;
  brand: string;
  model: string;
  device_type: string;
  setup: SetupGuideData;
}

const ALL_GUIDES: GuideEntry[] = [
  tpLinkData,
  asusData,
  eeroData,
  nestData,
  dlinkData,
  linksysData,
  netgearData,
  telstraData,
  netcommData,
  draytekData,
  synologyData,
  decoData,
  huaweiData,
  sagemcomData,
  vr2100Data,
] as unknown as GuideEntry[];

export const SETUP_GUIDE_MAP: Record<string, GuideEntry> = Object.fromEntries(
  ALL_GUIDES.map((g) => [g.id, g]),
);

export function hasSetupGuide(modemId: string): boolean {
  return modemId in SETUP_GUIDE_MAP;
}

export function getSetupGuide(modemId: string): GuideEntry | undefined {
  return SETUP_GUIDE_MAP[modemId];
}
