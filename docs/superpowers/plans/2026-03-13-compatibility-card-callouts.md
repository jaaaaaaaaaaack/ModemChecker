# Compatibility Card Callouts & Speed Assessment — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blanket `yes_but → speed-warning` mapping with a runtime speed assessment and per-condition callout system, so the CompatibilityCard and ResultCard show meaningful, data-driven callouts.

**Architecture:** A new pure function `assessCompatibility()` in `src/lib/compatibility.ts` takes `(modem, techType, planSpeedMbps)` and returns a structured assessment. Consumers (BaseScreen, ResultCard) call it instead of doing ad-hoc status mapping. CompatibilityCard (sync-disabled Subframe component) gets new props to render dynamic speed warnings and condition callout rows.

**Tech Stack:** React, TypeScript, Vitest, @testing-library/react

**Spec:** `docs/superpowers/specs/2026-03-13-compatibility-card-callouts-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/compatibility.ts` | `assessCompatibility()` pure function |
| Create | `tests/lib/compatibility.test.ts` | Unit tests for assessment logic |
| Modify | `src/types.ts` | Add `SpeedWarning`, `CompatibilityAssessment` types |
| Modify | `src/constants.ts` | Add `DEFAULT_PLAN_SPEED_MBPS`, `SPEED_WARNING_COPY`, `SPEED_CONDITION_CODES` |
| Modify | `src/components/ConditionList.tsx` | Add `variant` prop (`"warning"` | `"callout"`) |
| Modify | `tests/components/ConditionList.test.tsx` | Tests for variant prop |
| Modify | `src/ui/components/CompatibilityCard.tsx` | Add `conditions` + `speedWarningType` props, dynamic callout rows |
| Create | `tests/ui/CompatibilityCard.test.tsx` | Rendering tests for sync-disabled CompatibilityCard |
| Modify | `src/components/BaseScreen.tsx` | Replace `VerifiedModem` with full `Modem`, use `assessCompatibility()` |
| Modify | `tests/components/BaseScreen.test.tsx` | Update to pass full `Modem` objects |
| Modify | `src/components/ResultCard.tsx` | Use `assessCompatibility()` for headline, accept `planSpeedMbps` |
| Modify | `tests/components/ResultCard.test.tsx` | Update tests for new headline logic |
| Modify | `src/components/ModemChecker.tsx` | Store full `Modem`, thread `planSpeedMbps` + `techType` |
| Unchanged | `tests/components/ModemChecker.test.tsx` | No changes needed — new props have defaults |
| Unchanged | `src/App.tsx` | No changes needed — `planSpeedMbps` defaults to 500 in `ModemChecker` |

---

## Chunk 1: Types, Constants, and Core Assessment Function

### Task 1: Add new types to `src/types.ts`

**Files:**
- Modify: `src/types.ts:1-73`

- [ ] **Step 1: Add `SpeedWarning` and `CompatibilityAssessment` types**

Append after the `SearchState` type at the end of the file:

```typescript
export interface SpeedWarning {
  type: "wan-bottleneck" | "wifi-bottleneck";
}

export interface CompatibilityAssessment {
  cardStatus: "compatible" | "not-compatible" | "speed-warning" | "callout";
  speedWarning: SpeedWarning | null;
  setupConditions: ConditionCode[];
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 2: Add new constants

**Files:**
- Modify: `src/constants.ts:1-62`

- [ ] **Step 1: Add `DEFAULT_PLAN_SPEED_MBPS`, `SPEED_CONDITION_CODES`, and `SPEED_WARNING_COPY`**

Add these imports and constants:

```typescript
// Add SpeedWarning to the import
import type { ConditionCode, CompatibilityStatus, SpeedWarning } from "./types";

// After CONDITION_LABELS:

export const DEFAULT_PLAN_SPEED_MBPS = 500;

/** Condition codes that are superseded by the runtime speed assessment */
export const SPEED_CONDITION_CODES: ReadonlySet<ConditionCode> = new Set([
  "WAN_PORT_LIMIT",
  "NEEDS_2_5G_WAN",
]);

export const SPEED_WARNING_COPY: Record<SpeedWarning["type"], { title: string }> = {
  "wan-bottleneck": {
    title: "This modem is not fast enough to support your plan's maximum speeds.",
  },
  "wifi-bottleneck": {
    title: "This modem may not be capable of supporting your plan's maximum speeds over Wi-Fi.",
  },
};
```

- [ ] **Step 2: Verify constants compile**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit types and constants**

```bash
git add src/types.ts src/constants.ts
git commit -m "feat: add speed assessment types and constants"
```

---

### Task 3: Write `assessCompatibility()` tests

**Files:**
- Create: `tests/lib/compatibility.test.ts`

- [ ] **Step 1: Write the full test suite**

```typescript
import { describe, it, expect } from "vitest";
import { assessCompatibility } from "../../src/lib/compatibility";
import type { Modem } from "../../src/types";

const makeModem = (overrides: Partial<Modem> = {}): Modem => ({
  id: "test-modem",
  brand: "TestBrand",
  model: "TestModel",
  alternative_names: null,
  device_type: "modem_router",
  isp_provided_by: null,
  is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
  wifi: {
    wifi_standard: "Wi-Fi 6",
    wifi_generation: 6,
    bands: ["2.4GHz", "5GHz"],
    max_speed_mbps: {
      theoretical_combined: 3000,
      per_band: { "2.4GHz": 574, "5GHz": 2402 },
    },
  },
  general: {
    release_year: 2021,
    still_sold: true,
    end_of_life: false,
    manufacturer_url: null,
  },
  ...overrides,
});

describe("assessCompatibility", () => {
  it("returns not-compatible for status 'no' regardless of speed data", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "no", conditions: [] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result).toEqual({
      cardStatus: "not-compatible",
      speedWarning: null,
      setupConditions: [],
    });
  });

  it("returns compatible when status is yes and no speed issues", () => {
    const modem = makeModem();
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result).toEqual({
      cardStatus: "compatible",
      speedWarning: null,
      setupConditions: [],
    });
  });

  it("returns speed-warning with wan-bottleneck when WAN < plan speed", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("speed-warning");
    expect(result.speedWarning).toEqual({ type: "wan-bottleneck" });
  });

  it("returns speed-warning with wifi-bottleneck when best band < plan speed * 2", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
      wifi: {
        wifi_standard: "Wi-Fi 5",
        wifi_generation: 5,
        bands: ["2.4GHz", "5GHz"],
        max_speed_mbps: {
          theoretical_combined: 1167,
          per_band: { "2.4GHz": 300, "5GHz": 867 },
        },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("speed-warning");
    expect(result.speedWarning).toEqual({ type: "wifi-bottleneck" });
  });

  it("returns callout when status is yes_but with setup conditions only", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE", "DISABLE_VLAN"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("callout");
    expect(result.speedWarning).toBeNull();
    expect(result.setupConditions).toEqual(["SWITCH_TO_IPOE", "DISABLE_VLAN"]);
  });

  it("returns speed-warning when both speed and setup conditions exist", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("speed-warning");
    expect(result.speedWarning).toEqual({ type: "wan-bottleneck" });
    expect(result.setupConditions).toEqual(["SWITCH_TO_IPOE"]);
  });

  it("wan-bottleneck takes precedence over wifi-bottleneck", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
      wifi: {
        wifi_standard: "Wi-Fi 5",
        wifi_generation: 5,
        bands: ["5GHz"],
        max_speed_mbps: {
          theoretical_combined: 867,
          per_band: { "5GHz": 867 },
        },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.speedWarning).toEqual({ type: "wan-bottleneck" });
  });

  it("filters speed condition codes from setup conditions", () => {
    const modem = makeModem({
      compatibility: {
        fttp: {
          status: "yes_but",
          conditions: ["WAN_PORT_LIMIT", "SWITCH_TO_IPOE", "NEEDS_2_5G_WAN"],
        },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.setupConditions).toEqual(["SWITCH_TO_IPOE"]);
  });

  it("handles empty per_band object without wifi warning", () => {
    const modem = makeModem({
      wifi: {
        wifi_standard: "Wi-Fi 6",
        wifi_generation: 6,
        bands: [],
        max_speed_mbps: { theoretical_combined: 0, per_band: {} },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.speedWarning).toBeNull();
  });

  it("handles per_band speed of 0 without wifi warning", () => {
    const modem = makeModem({
      wifi: {
        wifi_standard: "Wi-Fi 5",
        wifi_generation: 5,
        bands: ["5GHz"],
        max_speed_mbps: {
          theoretical_combined: 0,
          per_band: { "5GHz": 0 },
        },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.speedWarning).toBeNull();
  });

  it("fires no speed warnings when planSpeedMbps is 0", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
    });
    const result = assessCompatibility(modem, "fttp", 0);
    expect(result.speedWarning).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/compatibility.test.ts`
Expected: FAIL — `assessCompatibility` not found / cannot be imported

---

### Task 4: Implement `assessCompatibility()`

**Files:**
- Create: `src/lib/compatibility.ts`

- [ ] **Step 1: Write the implementation**

```typescript
import type { Modem, TechType, ConditionCode, CompatibilityAssessment, SpeedWarning } from "../types";
import { SPEED_CONDITION_CODES } from "../constants";

export function assessCompatibility(
  modem: Modem,
  techType: TechType,
  planSpeedMbps: number
): CompatibilityAssessment {
  const compat = modem.compatibility[techType];

  if (compat.status === "no") {
    return { cardStatus: "not-compatible", speedWarning: null, setupConditions: [] };
  }

  // Assess speed
  let speedWarning: SpeedWarning | null = null;
  const wanSpeed = modem.wan.wan_port_speed_mbps;
  const perBandValues = Object.values(modem.wifi.max_speed_mbps.per_band);
  const bestBand = perBandValues.length > 0 ? Math.max(...perBandValues) : 0;

  if (wanSpeed > 0 && wanSpeed < planSpeedMbps) {
    speedWarning = { type: "wan-bottleneck" };
  } else if (bestBand > 0 && bestBand < planSpeedMbps * 2) {
    speedWarning = { type: "wifi-bottleneck" };
  }

  // Filter out speed-related condition codes — the runtime assessment supersedes them
  const setupConditions: ConditionCode[] = compat.conditions.filter(
    (code) => !SPEED_CONDITION_CODES.has(code)
  );

  // Determine card status
  let cardStatus: CompatibilityAssessment["cardStatus"];
  if (speedWarning) {
    cardStatus = "speed-warning";
  } else if (setupConditions.length > 0) {
    cardStatus = "callout";
  } else {
    cardStatus = "compatible";
  }

  return { cardStatus, speedWarning, setupConditions };
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run tests/lib/compatibility.test.ts`
Expected: All 11 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/compatibility.ts tests/lib/compatibility.test.ts
git commit -m "feat: add assessCompatibility() with full test coverage"
```

---

## Chunk 2: ConditionList Variant and CompatibilityCard Updates

### Task 5: Add `variant` prop to ConditionList

**Files:**
- Modify: `src/components/ConditionList.tsx`
- Modify: `tests/components/ConditionList.test.tsx`

- [ ] **Step 1: Write the failing tests for variant prop**

Add to `tests/components/ConditionList.test.tsx`:

```typescript
it("renders StatusIte with option-1 status when variant is callout", () => {
  const { container } = render(
    <ConditionList conditions={["SWITCH_TO_IPOE"]} variant="callout" />
  );
  // StatusIte status="option-1" → IconWithBackground variant="brand" (default)
  // which uses bg-brand-100 background. The "warning" variant would use bg-warning-100.
  // Since bg-brand-100 is the base class on IconWithBackground, any instance with
  // variant="brand" will have it. We confirm it's NOT warning-styled.
  expect(container.querySelector('[class*="bg-warning-100"]')).not.toBeInTheDocument();
  // And verify the label still renders
  expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
});

it("renders StatusIte with warning status by default", () => {
  const { container } = render(
    <ConditionList conditions={["SWITCH_TO_IPOE"]} />
  );
  // Default variant="warning" → StatusIte status="warning" → IconWithBackground variant="warning"
  // which applies bg-warning-100
  expect(container.querySelector('[class*="bg-warning-100"]')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify the callout test fails**

Run: `npx vitest run tests/components/ConditionList.test.tsx`
Expected: The `option-1` / `brand-600` test fails (currently all StatusIte use `status="warning"`)

- [ ] **Step 3: Update ConditionList implementation**

Update `src/components/ConditionList.tsx`:

```typescript
import { StatusIte } from "@/ui/components/StatusIte";
import { CONDITION_LABELS } from "../constants";
import type { ConditionCode } from "../types";

interface ConditionListProps {
  conditions: ConditionCode[];
  variant?: "warning" | "callout";
}

export function ConditionList({ conditions, variant = "warning" }: ConditionListProps) {
  if (conditions.length === 0) return null;

  const statusIteStatus = variant === "callout" ? "option-1" as const : "warning" as const;

  return (
    <div className="flex w-full flex-col items-start gap-2">
      {conditions.map((code) => {
        const info = CONDITION_LABELS[code];
        return (
          <StatusIte
            key={code}
            title={info.label}
            description={info.description}
            status={statusIteStatus}
            hasDescription={true}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/ConditionList.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ConditionList.tsx tests/components/ConditionList.test.tsx
git commit -m "feat: add variant prop to ConditionList for callout vs warning styles"
```

---

### Task 6: Update CompatibilityCard (sync-disabled) with dynamic callout props

**Files:**
- Modify: `src/ui/components/CompatibilityCard.tsx`

This file is `@subframe/sync-disable`d — it's safe to hand-edit. No Subframe export needed.

- [ ] **Step 1: Update CompatibilityCallout props and rendering**

In `src/ui/components/CompatibilityCard.tsx`, make these changes:

**a) Add imports at the top (after existing imports):**

```typescript
import { ConditionList } from "../../components/ConditionList";
import { SPEED_WARNING_COPY } from "../../constants";
import type { ConditionCode, SpeedWarning } from "../../types";
```

**b) Update `CompatibilityCalloutProps` interface:**

The old `"callout"` status value was used to gate a hardcoded single StatusIte. Now that conditions are rendered dynamically via the `conditions` prop, `"callout"` is dead code — remove it.

```typescript
interface CompatibilityCalloutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: "compatible" | "not-compatible" | "speed-warning";
  modemName?: React.ReactNode;
  image?: string;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  className?: string;
}
```

**c) Destructure the new props in the CompatibilityCallout component:**

```typescript
  {
    status = "compatible",
    modemName,
    image,
    conditions = [],
    speedWarningType = null,
    className,
    ...otherProps
  }: CompatibilityCalloutProps,
```

**d) Replace the hardcoded Row 2 (speed) StatusIte** (the one that currently has `title={status === "speed-warning" ? "May not support..." : "Fast enough..."}`) with dynamic copy:

```typescript
<StatusIte
  className={SubframeUtils.twClassNames({
    hidden: status === "not-compatible",
  })}
  title={
    speedWarningType
      ? SPEED_WARNING_COPY[speedWarningType].title
      : "Fast enough for your selected plan"
  }
  status={speedWarningType ? "warning" : undefined}
/>
```

**e) Replace the hardcoded Row 3 (callout) StatusIte** with the dynamic ConditionList:

Remove the single hardcoded callout StatusIte and replace it with:

```typescript
{conditions.length > 0 && (
  <ConditionList conditions={conditions} variant="callout" />
)}
```

**f) Update `CompatibilityCardRootProps` interface:**

```typescript
interface CompatibilityCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state?: "default" | "option-1";
  modemName?: React.ReactNode;
  status?: "compatible" | "not-compatible" | "speed-warning";
  image?: string;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  className?: string;
}
```

**g) Destructure and forward the new props in CompatibilityCardRoot:**

```typescript
  {
    state = "default",
    modemName,
    status = "compatible",
    image,
    conditions = [],
    speedWarningType = null,
    className,
    ...otherProps
  }: CompatibilityCardRootProps,
```

And on the `<CompatibilityCallout>` inside the root:

```typescript
<CompatibilityCallout
  className={SubframeUtils.twClassNames({ hidden: state === "option-1" })}
  status={
    status === "speed-warning"
      ? "speed-warning"
      : status === "not-compatible"
      ? "not-compatible"
      : undefined
  }
  modemName={modemName}
  image={image}
  conditions={conditions}
  speedWarningType={speedWarningType}
/>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/ui/components/CompatibilityCard.tsx
git commit -m "feat: add dynamic speed warning and condition callout props to CompatibilityCard"
```

---

### Task 6b: Add CompatibilityCard rendering tests

**Files:**
- Create: `tests/ui/CompatibilityCard.test.tsx`

CompatibilityCard is sync-disabled and hand-edited, so it needs rendering tests to catch regressions.

- [ ] **Step 1: Write rendering tests**

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompatibilityCard } from "../../src/ui/components/CompatibilityCard";

describe("CompatibilityCard", () => {
  it("renders compatible status with green checkmark row", () => {
    render(
      <CompatibilityCard
        modemName="TP-Link Archer VR1600v"
        status="compatible"
      />
    );
    expect(screen.getByText("TP-Link Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
    expect(screen.getByText("Fast enough for your selected plan")).toBeInTheDocument();
  });

  it("renders speed warning with correct copy for wan-bottleneck", () => {
    render(
      <CompatibilityCard
        modemName="Old Router"
        status="speed-warning"
        speedWarningType="wan-bottleneck"
      />
    );
    expect(
      screen.getByText(/not fast enough to support your plan/i)
    ).toBeInTheDocument();
  });

  it("renders speed warning with correct copy for wifi-bottleneck", () => {
    render(
      <CompatibilityCard
        modemName="Slow WiFi Router"
        status="speed-warning"
        speedWarningType="wifi-bottleneck"
      />
    );
    expect(
      screen.getByText(/may not be capable of supporting.*over Wi-Fi/i)
    ).toBeInTheDocument();
  });

  it("renders individual callout items for each setup condition", () => {
    render(
      <CompatibilityCard
        modemName="Needs Setup Router"
        status="compatible"
        conditions={["SWITCH_TO_IPOE", "DISABLE_VLAN"]}
      />
    );
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
    expect(screen.getByText("Disable VLAN tagging")).toBeInTheDocument();
  });

  it("renders no callout rows when conditions is empty", () => {
    render(
      <CompatibilityCard
        modemName="Clean Router"
        status="compatible"
        conditions={[]}
      />
    );
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run tests/ui/CompatibilityCard.test.tsx`
Expected: All 5 tests PASS (these are written after the implementation in Task 6, validating correctness)

- [ ] **Step 3: Commit**

```bash
git add tests/ui/CompatibilityCard.test.tsx
git commit -m "test: add rendering tests for sync-disabled CompatibilityCard"
```

---

## Chunk 3: Consumer Component Updates

### Task 7: Update BaseScreen to use full Modem and assessCompatibility

**Files:**
- Modify: `src/components/BaseScreen.tsx`
- Modify: `tests/components/BaseScreen.test.tsx`

- [ ] **Step 1: Write updated test for BaseScreen passing full Modem**

Replace the existing `"shows verified modem info when provided"` test in `tests/components/BaseScreen.test.tsx` and add new tests. Update imports:

```typescript
import type { Modem } from "../../src/types";
```

Add a test helper at the top of `describe`:

```typescript
const makeModem = (overrides: Partial<Modem> = {}): Modem => ({
  id: "tp-link-archer-vr1600v",
  brand: "TP-Link",
  model: "Archer VR1600v",
  alternative_names: null,
  device_type: "modem_router",
  isp_provided_by: null,
  is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
  wifi: {
    wifi_standard: "Wi-Fi 5",
    wifi_generation: 5,
    bands: ["2.4GHz", "5GHz"],
    max_speed_mbps: { theoretical_combined: 1733, per_band: { "2.4GHz": 450, "5GHz": 1300 } },
  },
  general: { release_year: 2018, still_sold: false, end_of_life: false, manufacturer_url: null },
  ...overrides,
});
```

Replace the existing verified modem test with:

```typescript
it("shows verified modem info when provided", async () => {
  const modem = makeModem();
  render(
    <BaseScreen onCheckModem={() => {}} verifiedModem={modem} techType="fttp" planSpeedMbps={500} />
  );
  await userEvent.click(screen.getByText(/no, i.ll use my own/i));
  expect(screen.getByText("TP-Link Archer VR1600v")).toBeInTheDocument();
  expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
});

it("shows speed warning for modem with slow WAN", async () => {
  const modem = makeModem({
    wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 100 },
  });
  render(
    <BaseScreen onCheckModem={() => {}} verifiedModem={modem} techType="fttp" planSpeedMbps={500} />
  );
  await userEvent.click(screen.getByText(/no, i.ll use my own/i));
  expect(screen.getByText(/not fast enough to support/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify new tests fail**

Run: `npx vitest run tests/components/BaseScreen.test.tsx`
Expected: FAIL — `BaseScreen` doesn't accept `techType`/`planSpeedMbps` yet

- [ ] **Step 3: Update BaseScreen implementation**

Replace `src/components/BaseScreen.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "../ui/components/Button";
import { CompatibilityCard } from "../ui/components/CompatibilityCard";
import { RadioCardGroup } from "../ui/components/RadioCardGroup";
import { getModemImageUrl } from "../lib/supabase";
import { assessCompatibility } from "../lib/compatibility";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import type { Modem, TechType } from "../types";

interface BaseScreenProps {
  onCheckModem: () => void;
  verifiedModem?: Modem;
  techType?: TechType;
  planSpeedMbps?: number;
}

export function BaseScreen({
  onCheckModem,
  verifiedModem,
  techType = "fttp",
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
}: BaseScreenProps) {
  const [selection, setSelection] = useState<string>("");

  const renderModemCard = () => {
    if (!verifiedModem) {
      return (
        <div className="flex w-full flex-col items-start gap-3 rounded-md bg-color-primary-50 px-4 py-4">
          <span className="text-h3-700 font-h3-700 text-color-primary-700">
            Modem compatibility checker
          </span>
          <span className="text-body font-body text-default-font">
            Check that your modem can connect to Belong nbn® and that
            it's fast enough for your selected plan.
          </span>
          <Button
            className="rounded-full"
            variant="brand-secondary"
            onClick={onCheckModem}
          >
            Check your modem
          </Button>
        </div>
      );
    }

    const assessment = assessCompatibility(verifiedModem, techType, planSpeedMbps);

    // "callout" is visually "compatible" (green) — callout items render via conditions prop
    const cardStatus = assessment.cardStatus === "callout"
      ? "compatible" as const
      : assessment.cardStatus;

    return (
      <CompatibilityCard
        status={cardStatus}
        speedWarningType={assessment.speedWarning?.type ?? null}
        conditions={assessment.setupConditions}
        modemName={`${verifiedModem.brand} ${verifiedModem.model}`}
        image={getModemImageUrl(verifiedModem.id)}
      />
    );
  };

  return (
    <div className="flex w-full flex-col items-center bg-white px-4 py-6">
      <div className="flex w-full max-w-[384px] flex-col items-start gap-6">
        <span className="text-h2 font-h2 text-color-primary-700">
          Modem selection
        </span>
        <RadioCardGroup
          className="flex-col"
          label="Do you need a Belong Modem?"
          helpText=""
          value={selection}
          onValueChange={(value: string) => setSelection(value)}
        >
          <RadioCardGroup.RadioCard
            hideRadio={false}
            label="Yes, I need a Belong modem"
            value="belong"
          />
          <RadioCardGroup.RadioCard
            hideRadio={false}
            label="No, I'll use my own compatible modem"
            value="byo"
          />
        </RadioCardGroup>

        {selection === "byo" && (
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-h3-700 font-h3-700 text-color-primary-700">
              BYO Modem compatibility
            </span>
            <span className="text-body font-body text-default-font">
              Your choice of modem, and how you set it up, could cause
              connectivity issues or limit the speed of your internet.
            </span>
            {renderModemCard()}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update remaining BaseScreen tests that don't pass new props**

The first four tests that don't pass `verifiedModem` are unaffected — the new props have defaults. But update the existing verified modem test per step 1.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/components/BaseScreen.test.tsx`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/BaseScreen.tsx tests/components/BaseScreen.test.tsx
git commit -m "feat: BaseScreen uses assessCompatibility() with full Modem type"
```

---

### Task 8: Update ResultCard to use assessCompatibility

**Files:**
- Modify: `src/components/ResultCard.tsx`
- Modify: `tests/components/ResultCard.test.tsx`

- [ ] **Step 1: Write new tests for speed warning headlines**

Add to `tests/components/ResultCard.test.tsx`, after existing tests:

```typescript
it("shows speed warning headline for WAN bottleneck", () => {
  const modem = makeModem({
    wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 100 },
  });
  render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
  expect(
    screen.getByText(/not fast enough to support your plan/i)
  ).toBeInTheDocument();
});

it("shows speed warning headline for Wi-Fi bottleneck", () => {
  const modem = makeModem({
    wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
    wifi: {
      wifi_standard: "Wi-Fi 5",
      wifi_generation: 5,
      bands: ["5GHz"],
      max_speed_mbps: { theoretical_combined: 867, per_band: { "5GHz": 867 } },
    },
  });
  render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
  expect(
    screen.getByText(/may not be capable of supporting.*over Wi-Fi/i)
  ).toBeInTheDocument();
});

it("shows callout headline for setup conditions without speed issues", () => {
  const modem = makeModem({
    compatibility: {
      fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
      fttc: { status: "yes", conditions: [] },
      fttn: { status: "yes", conditions: [] },
      hfc: { status: "yes", conditions: [] },
    },
  });
  render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
  expect(screen.getByText("Compatible with some requirements")).toBeInTheDocument();
  expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify new tests fail**

Run: `npx vitest run tests/components/ResultCard.test.tsx`
Expected: FAIL — `ResultCard` doesn't accept `planSpeedMbps` or use assessment

- [ ] **Step 3: Update ResultCard implementation**

Replace `src/components/ResultCard.tsx`:

```typescript
import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { StatusIte } from "@/ui/components/StatusIte";
import { FeatherWifi } from "@subframe/core";
import { STATUS_CONFIG, DEFAULT_PLAN_SPEED_MBPS, SPEED_WARNING_COPY } from "../constants";
import { assessCompatibility } from "../lib/compatibility";
import { getModemImageUrl } from "../lib/supabase";
import { ModemImage } from "./ModemImage";
import { ConditionList } from "./ConditionList";
import type { Modem, TechType } from "../types";

interface ResultCardProps {
  modem: Modem;
  techType: TechType;
  planSpeedMbps?: number;
  onDone?: () => void;
  onReset?: () => void;
}

export function ResultCard({
  modem,
  techType,
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
  onDone,
  onReset,
}: ResultCardProps) {
  const assessment = assessCompatibility(modem, techType, planSpeedMbps);

  // Map assessment to headline StatusIte props
  let headlineTitle: string;
  let headlineStatus: "compatible" | "incompatible" | "warning" | "option-1";

  switch (assessment.cardStatus) {
    case "compatible":
      headlineTitle = STATUS_CONFIG.yes.heading;
      headlineStatus = "compatible";
      break;
    case "speed-warning":
      headlineTitle = SPEED_WARNING_COPY[assessment.speedWarning!.type].title;
      headlineStatus = "warning";
      break;
    case "callout":
      headlineTitle = STATUS_CONFIG.yes_but.heading;
      headlineStatus = "compatible";
      break;
    case "not-compatible":
      headlineTitle = STATUS_CONFIG.no.heading;
      headlineStatus = "incompatible";
      break;
  }

  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex h-40 w-40 flex-none items-center justify-center rounded-md bg-color-primary-100">
        <FeatherWifi className="font-['Plus_Jakarta_Sans'] text-[64px] font-[400] leading-[96px] text-color-primary-400" />
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-h2 font-h2 text-color-primary-700">
          Compatibility results
        </span>
        <div className="flex w-full items-center gap-3 rounded-md bg-white px-4 py-3 shadow-sm">
          <ModemImage
            src={getModemImageUrl(modem.id)}
            alt={`${modem.brand} ${modem.model}`}
            className="w-12 h-12 rounded-md"
          />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-caption font-caption text-subtext-color">
              {modem.brand}
            </span>
            <span className="text-body-bold font-body-bold text-default-font">
              {modem.model}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <StatusIte
            icon={null}
            title={headlineTitle}
            description=""
            status={headlineStatus}
          />
          {assessment.setupConditions.length > 0 && (
            <ConditionList conditions={assessment.setupConditions} />
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-between pt-2">
        <LinkButton
          variant="brand"
          icon={null}
          iconRight={null}
          onClick={onReset}
        >
          Check another modem
        </LinkButton>
        <Button
          className="rounded-full"
          variant="brand-primary"
          icon={null}
          iconRight={null}
          onClick={onDone}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/ResultCard.test.tsx`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultCard.tsx tests/components/ResultCard.test.tsx
git commit -m "feat: ResultCard uses assessCompatibility() for dynamic headlines"
```

---

### Task 9: Update ModemChecker to store full Modem and thread props

**Files:**
- Modify: `src/components/ModemChecker.tsx`
- Modify: `tests/components/ModemChecker.test.tsx`

- [ ] **Step 1: Update ModemChecker implementation**

Replace `src/components/ModemChecker.tsx`:

```typescript
import { useState } from "react";
import type { TechType, Modem } from "../types";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import { useModemSearch } from "../hooks/useModemSearch";
import { BaseScreen } from "./BaseScreen";
import { BottomSheet } from "./BottomSheet";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { ResultCard } from "./ResultCard";
import { NoMatch } from "./NoMatch";

interface ModemCheckerProps {
  techType: TechType;
  planSpeedMbps?: number;
}

export function ModemChecker({
  techType,
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
}: ModemCheckerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<Modem | undefined>();
  const { state, search, selectModem, reset } = useModemSearch();

  const handleClose = () => {
    setSheetOpen(false);
    reset();
  };

  const handleDone = () => {
    if (state.step === "single_match") {
      setVerifiedModem(state.modem);
    }
    setSheetOpen(false);
    reset();
  };

  const handleCheckAnother = () => {
    reset();
  };

  return (
    <>
      <BaseScreen
        onCheckModem={() => setSheetOpen(true)}
        verifiedModem={verifiedModem}
        techType={techType}
        planSpeedMbps={planSpeedMbps}
      />
      <BottomSheet open={sheetOpen} onClose={handleClose}>
        {state.step === "idle" && <SearchInput onSearch={search} />}
        {state.step === "searching" && <LoadingState />}
        {state.step === "multiple_matches" && (
          <MultipleMatches
            modems={state.modems}
            onSelect={selectModem}
            onBack={reset}
          />
        )}
        {state.step === "single_match" && (
          <ResultCard
            modem={state.modem}
            techType={techType}
            planSpeedMbps={planSpeedMbps}
            onDone={handleDone}
            onReset={handleCheckAnother}
          />
        )}
        {state.step === "no_match" && (
          <NoMatch
            onRetry={reset}
            query={state.query}
          />
        )}
      </BottomSheet>
    </>
  );
}
```

- [ ] **Step 2: Run ModemChecker tests**

Run: `npx vitest run tests/components/ModemChecker.test.tsx`
Expected: All 3 existing tests PASS (no test changes needed — props have defaults)

- [ ] **Step 3: Run the full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/ModemChecker.tsx
git commit -m "feat: ModemChecker stores full Modem and threads planSpeedMbps"
```

---

## Chunk 4: Final Verification

### Task 10: Full test suite and type check

- [ ] **Step 1: Run TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Run dev server and smoke test**

Run: `npx vite dev` (verify no console errors on load)

- [ ] **Step 4: Verify in browser** (optional — use webapp-testing skill)

Check that:
- Compatible modem shows green "Compatible with Belong nbn®" on the CompatibilityCard
- WAN-bottleneck modem shows amber speed warning with correct copy
- Modem with setup conditions shows individual condition callout rows
- ResultCard detail view shows matching headline and condition list
