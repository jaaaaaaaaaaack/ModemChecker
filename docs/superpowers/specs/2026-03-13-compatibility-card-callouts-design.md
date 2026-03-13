# Compatibility Card Callouts & Speed Assessment

## Overview

Upgrade the CompatibilityCard and ResultCard to show meaningful, data-driven callouts about speed limitations and setup requirements. Replace the current blanket `yes_but -> speed-warning` mapping with a nuanced system that distinguishes WAN bottlenecks, Wi-Fi limitations, and setup conditions.

## Design Decisions

### Speed assessment is computed at runtime

Speed warnings depend on `planSpeedMbps` (a runtime prop), so they cannot be pre-stored as condition codes. The assessment compares the modem's WAN port speed and best single-band Wi-Fi PHY rate against the plan speed.

### Two tiers of speed warning, same visual treatment

Both use the `speed-warning` variant on CompatibilityCard (amber Wi-Fi icon). The copy differs:

- **WAN bottleneck** (hard ceiling — affects all traffic): "This modem is not fast enough to support your plan's maximum speeds."
- **Wi-Fi bottleneck** (practical limit — Ethernet is fine): "This modem may not be capable of supporting your plan's maximum speeds over Wi-Fi."

No specific Mbps numbers are shown. This avoids false precision about real-world Wi-Fi throughput.

### Wi-Fi bottleneck threshold: 2x plan speed

If the modem's best single-band theoretical PHY rate is below `planSpeedMbps * 2`, a Wi-Fi warning fires. At the default 500 Mbps plan, this catches 11 modems (867 Mbps and 1200 Mbps tiers) whose real-world Wi-Fi throughput is unlikely to reach plan speed. Modems at 1300+ Mbps theoretical generally deliver ~500 Mbps in practice and don't trigger a warning.

### Setup conditions render as individual callout items

Each condition from the `conditions[]` array renders as its own StatusIte with `status="option-1"` and `hasDescription={true}`. This replaces the single hardcoded "Some setup required" message and gives users specific, actionable information drawn from `CONDITION_LABELS`.

### Data quality is a separate concern

The UI faithfully renders whatever the data says. Known data issues (Telstra Gen 3 ISP_LOCK contradiction, Arcadyan SWITCH_TO_IPOE error, false-vs-null SOS/ROC) are flagged for a data-layer fix pass and are out of scope for this spec.

## Architecture

### New: `assessCompatibility()` function

Location: `src/lib/compatibility.ts`

Types exported from `src/types.ts`:

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

Pure function:

```typescript
function assessCompatibility(
  modem: Modem,
  techType: TechType,
  planSpeedMbps: number
): CompatibilityAssessment
```

Logic:
1. Get `compat = modem.compatibility[techType]`
2. If `compat.status === "no"` -> `{ cardStatus: "not-compatible", speedWarning: null, setupConditions: [] }`
3. Assess speed:
   - `wanSpeed = modem.wan.wan_port_speed_mbps`
   - `bestBand = Math.max(...Object.values(modem.wifi.max_speed_mbps.per_band), 0)` (the trailing `0` guards against empty `per_band` objects returning `-Infinity`)
   - If `wanSpeed > 0 && wanSpeed < planSpeedMbps` -> `wan-bottleneck`
   - Else if `bestBand > 0 && bestBand < planSpeedMbps * 2` -> `wifi-bottleneck`
   - Else -> no speed warning
4. Partition conditions into speed vs setup:
   - Speed conditions (`WAN_PORT_LIMIT`, `NEEDS_2_5G_WAN`) are superseded by the runtime speed assessment and filtered out
   - Remaining conditions are setup conditions
5. Determine card status:
   - If speed warning exists -> `"speed-warning"`
   - Else if setup conditions exist -> `"callout"`
   - Else -> `"compatible"`

### New: `DEFAULT_PLAN_SPEED_MBPS` constant

Added to `src/constants.ts`:

```typescript
export const DEFAULT_PLAN_SPEED_MBPS = 500;
```

Referenced wherever `planSpeedMbps` defaults are needed, avoiding scattered magic numbers.

### New: `planSpeedMbps` prop

Threaded from `App` -> `ModemChecker` -> `BaseScreen` / `ResultCard`. Default: `DEFAULT_PLAN_SPEED_MBPS`.

### Modified: `ModemChecker.tsx`

The `VerifiedModem` type (defined locally, duplicated across `ModemChecker.tsx` and `BaseScreen.tsx`) is replaced with the full `Modem` type.

Changes:
- Remove local `VerifiedModem` interface
- Change state: `useState<VerifiedModem | undefined>()` -> `useState<Modem | undefined>()`
- `handleDone`: store the full `state.modem` instead of extracting `{ id, brand, model, status }`
- Accept `planSpeedMbps` prop (default `DEFAULT_PLAN_SPEED_MBPS`), pass to `BaseScreen` and `ResultCard`
- Pass `techType` to `BaseScreen` (currently not passed)

### Modified: `CompatibilityCard.tsx` (sync-disabled)

Both `CompatibilityCardRoot` and `CompatibilityCallout` need changes.

**`CompatibilityCallout` changes:**
- Add `conditions` prop (`ConditionCode[]`, default `[]`)
- Add `speedWarningType` prop (`SpeedWarning["type"] | null`, default `null`)
- Row 1 (compatibility): unchanged logic
- Row 2 (speed): title driven by `speedWarningType`:
  - `null` -> "Fast enough for your selected plan" (green check, `status` default)
  - `"wan-bottleneck"` -> "This modem is not fast enough to support your plan's maximum speeds." (`status="warning"`)
  - `"wifi-bottleneck"` -> "This modem may not be capable of supporting your plan's maximum speeds over Wi-Fi." (`status="warning"`)
- Row 3+ (callouts): replace the single hardcoded callout StatusIte with a dynamic loop over `conditions`. Each renders a StatusIte with `status="option-1"`, `hasDescription={true}`, title and description from `CONDITION_LABELS[code]`. When `conditions` is empty, no callout rows render.

**`CompatibilityCardRoot` changes:**
- Add `conditions` and `speedWarningType` to root props interface (same types as callout)
- Forward these props to the inner `<CompatibilityCallout>` alongside existing `status`, `modemName`, `image`

Note: The root also renders hardcoded content (heading, description, button) that serves as the "checker prompt" state. This content remains unchanged — it's visually overridden when a `CompatibilityCallout` is shown with modem data.

### Modified: `BaseScreen.tsx`

Replace the `VerifiedModem` type and `STATUS_TO_COMPAT_CARD` mapping with `assessCompatibility()`:

- Remove local `VerifiedModem` interface
- Accept full `Modem | undefined` as `verifiedModem` prop
- Accept `techType` and `planSpeedMbps` props
- When `verifiedModem` is set, call `assessCompatibility(verifiedModem, techType, planSpeedMbps)` and map the result to `CompatibilityCard` props:

```typescript
const assessment = assessCompatibility(verifiedModem, techType, planSpeedMbps);

// Map assessment.cardStatus to CompatibilityCard's visual status.
// "callout" is visually "compatible" (green) — the callout items render via the conditions prop.
const cardStatus = assessment.cardStatus === "callout"
  ? "compatible" as const
  : assessment.cardStatus;

<CompatibilityCard
  status={cardStatus}
  speedWarningType={assessment.speedWarning?.type ?? null}
  conditions={assessment.setupConditions}
  modemName={`${verifiedModem.brand} ${verifiedModem.model}`}
  image={getModemImageUrl(verifiedModem.id)}
/>
```

### Modified: `ResultCard.tsx`

Uses `assessCompatibility()` for the headline StatusIte. Receives `planSpeedMbps` prop.

Headline StatusIte mapping:
- `cardStatus === "compatible"` -> StatusIte `status="compatible"`, title: `STATUS_CONFIG["yes"].heading` ("Compatible with Belong nbn")
- `cardStatus === "speed-warning"` -> StatusIte `status="warning"`, title: `SPEED_WARNING_COPY[assessment.speedWarning.type].title`
- `cardStatus === "callout"` -> StatusIte `status="compatible"`, title: `STATUS_CONFIG["yes_but"].heading` ("Compatible with some requirements"). Preserves existing messaging for modems that are compatible but have setup needs.
- `cardStatus === "not-compatible"` -> StatusIte `status="incompatible"`, title: `STATUS_CONFIG["no"].heading`

The existing `ConditionList` renders setup conditions from the assessment. It continues using `status="warning"` (the default variant) — conditions in the detail view are informational warnings, not branded callout items.

### Modified: `ConditionList.tsx`

Add a `variant` prop to support different StatusIte styles depending on context:

```typescript
interface ConditionListProps {
  conditions: ConditionCode[];
  variant?: "warning" | "callout";  // default: "warning"
}
```

When `variant="callout"`, StatusIte uses `status="option-1"` (brand-colored asterisk icon). Default `"warning"` retains current behavior.

Used as `variant="callout"` inside `CompatibilityCallout` (summary card) and default `"warning"` inside `ResultCard` (detail view).

### Constants updates

Speed condition codes (`WAN_PORT_LIMIT`, `NEEDS_2_5G_WAN`) remain defined but are effectively superseded by the runtime speed assessment. They stay in the `ConditionCode` type for backward compatibility with existing database records.

Add speed warning copy to constants:

```typescript
export const SPEED_WARNING_COPY: Record<SpeedWarning["type"], { title: string }> = {
  "wan-bottleneck": {
    title: "This modem is not fast enough to support your plan's maximum speeds.",
  },
  "wifi-bottleneck": {
    title: "This modem may not be capable of supporting your plan's maximum speeds over Wi-Fi.",
  },
};
```

## Data Flow

```
App (planSpeedMbps=500, techType="fttp")
  -> ModemChecker (stores full Modem in state, threads props)
    -> BaseScreen (verifiedModem: Modem, techType, planSpeedMbps)
      -> assessCompatibility(modem, techType, planSpeedMbps)
      -> CompatibilityCardRoot (status, speedWarningType, conditions)
        -> CompatibilityCallout (status, speedWarningType, conditions)
          -> StatusIte (row 1: compatibility)
          -> StatusIte (row 2: speed — driven by speedWarningType)
          -> ConditionList variant="callout" (row 3+: setup conditions)
    -> BottomSheet
      -> ResultCard (modem, techType, planSpeedMbps)
        -> assessCompatibility(modem, techType, planSpeedMbps)
        -> StatusIte (headline — status + title from assessment)
        -> ConditionList variant="warning" (conditions from assessment)
```

## Testing

### `assessCompatibility()` unit tests (new file: `tests/lib/compatibility.test.ts`)
- `status: "no"` -> returns `"not-compatible"` regardless of speed data
- `status: "yes"`, no speed issues -> returns `"compatible"`
- `status: "yes"`, WAN < plan speed -> returns `"speed-warning"` with `wan-bottleneck`
- `status: "yes"`, best band < plan speed * 2 -> returns `"speed-warning"` with `wifi-bottleneck`
- `status: "yes_but"`, setup conditions only -> returns `"callout"` with conditions
- `status: "yes_but"`, speed + setup conditions -> returns `"speed-warning"` (speed takes precedence), setup conditions still populated
- WAN bottleneck takes precedence over Wi-Fi bottleneck
- Speed condition codes (`WAN_PORT_LIMIT`, `NEEDS_2_5G_WAN`) filtered from setup conditions
- Edge case: empty per_band object (no bands) -> no Wi-Fi warning fires (bestBand = 0)
- Edge case: per-band speed of 0 (Telstra Smart Modem 4 data gap) -> no Wi-Fi warning fires
- Edge case: `planSpeedMbps = 0` -> no speed warnings fire

### Component tests (update existing test files)
- CompatibilityCard renders correct StatusIte variant per assessment status
- CompatibilityCard renders individual callout items for each setup condition
- ConditionList `variant="callout"` renders StatusIte with `status="option-1"`
- ConditionList default variant renders StatusIte with `status="warning"` (existing behavior preserved)
- BaseScreen passes full Modem to CompatibilityCard with assessment props
- ResultCard shows correct headline for each assessment type:
  - `"compatible"` -> "Compatible with Belong nbn"
  - `"callout"` -> "Compatible with some requirements"
  - `"speed-warning"` -> speed warning copy from SPEED_WARNING_COPY
  - `"not-compatible"` -> "Not compatible with Belong nbn"
- Update existing ResultCard tests that reference `STATUS_TO_STATUSITE` mapping
- Update existing BaseScreen tests that reference `VerifiedModem` type

## Out of Scope

- Data quality fixes (Telstra Gen 3 ISP_LOCK, Arcadyan SWITCH_TO_IPOE, false/null SOS/ROC)
- Populating `callout_text` field
- Dynamic plan speed selection UI (prop is hardcoded for now)
- Speed warning descriptions with specific Mbps numbers
