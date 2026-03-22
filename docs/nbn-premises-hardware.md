# NBN Customer Premises Hardware Reference

Comprehensive inventory of all NBN (National Broadband Network) hardware devices installed at customer premises, organized by technology type. This document covers every device variant a customer might encounter when setting up a third-party modem/router.

**Last updated:** 2026-03-22

---

## 1. FTTP (Fibre to the Premises) — Connection Box / ONT

FTTP uses a wall-mounted connection box (formally called an NTD — Network Termination Device, or ONT — Optical Network Terminal) that terminates the fibre optic cable inside the premises. An external utility box is mounted on the outside of the building where the fibre enters.

### 1A. Legacy 4-Port NTD — Nokia (Alcatel-Lucent) G-240G-P

**Status:** Legacy. Deployed 2012–2024. No longer installed on new connections. Still in the field at the majority of existing FTTP premises.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Nokia (originally Alcatel-Lucent, acquired by Nokia Networks) |
| **Model** | 7368 ISAM ONT G-240G-P (nbn variant); related models G-240G-A, G-240G-E |
| **Part number** | 3FE56159AAA |
| **Technology** | GPON (ITU-T G.984) — 2.5 Gbps downstream, 1.25 Gbps upstream on the fibre |
| **Ethernet ports** | 4x UNI-D (Gigabit Ethernet 10/100/1000, RJ-45). Each port can be provisioned as a separate service |
| **Voice ports** | 2x UNI-V (POTS/RJ-11) for analogue phone services |
| **Optical port** | 1x SC/APC fibre connector (small form-factor SFF) |
| **Max throughput** | ~1.0 Gbps aggregate across all ethernet ports (individual ports capped at 1 Gbps). Internal bus limit ~1.4 Gbps |
| **Dimensions** | 33 mm (H) x 208 mm (W) x 142 mm (D) |
| **Weight** | 0.26 kg (without power adapter) |
| **Color** | White |
| **Form factor** | Flat rectangular slab. Wall-mountable or desktop. Often mounted inside a Nokia universal SFU enclosure (white plastic weatherproof box) for outdoor/garage installations |
| **Power** | +12V DC via external AC/DC adapter. Power consumption < 8W. Dying gasp support |
| **LEDs** | Power, PON (Optical), Alarm, LAN 1–4, Phone 1–2 |
| **Operating temp** | -40°C to 60°C |
| **Port labels** | Ports labeled UNI-D1 through UNI-D4 on the underside/rear. Only UNI-D1 is active by default; additional ports can be activated by the RSP |

**Setup-relevant notes:**
- Customer connects their router's WAN port to UNI-D1 via ethernet cable
- No authentication required (IPoE — the connection is authenticated at the network level, not by PPPoE)
- The 1 Gbps port speed is the bottleneck for plans above 1000 Mbps — this NTD cannot support the new Hyperfast tier
- UNI-V ports deliver analogue phone (VoIP is handled by the RSP's router, not the NTD)

---

### 1B. New 1-Port NTD — Nokia G-010G-D / Sercomm FG1000ANB

**Status:** Active. Deployed from September 2025. Default for all new FTTP connections and Hyperfast upgrades.

| Attribute | Detail |
|---|---|
| **Manufacturers** | Nokia (model G-010G-D) and Sercomm (model FG1000ANB) — dual supply arrangement, functionally identical |
| **Technology** | XGS-PON and GPON (backward compatible). Supports multi-gigabit speeds |
| **Ethernet ports** | 1x 2.5 Gbps RJ-45 (orange, labeled "Port") |
| **Voice ports** | None |
| **Optical port** | 1x fibre connector (under removable cover) |
| **Max throughput** | 2.5 Gbps (limited by the single ethernet port) |
| **Dimensions** | 200 mm (H) x 110 mm (W) x 45.5 mm (D) — approximately one-third the size of the legacy NTD |
| **Color** | White |
| **Form factor** | Compact wall-mounted unit with removable cover for cable management. Fits the legacy mounting bracket |
| **Power** | 12V DC, 1.5A (18W max). 1.5m cable. ~40% less power consumption than legacy |
| **LEDs** | Power, Optical, Alarm, Port. Lights On/Off button |
| **Materials** | 85% post-consumer recycled plastics |
| **Reset** | Paperclip-activated reset button |

**Setup-relevant notes:**
- Single ethernet port — customer connects their router's WAN port directly
- Supports plans up to 2000/400 Mbps (Hyperfast) — requires a router with a 2.5GbE WAN port to get full speed
- Minimal difference between Nokia and Sercomm variants (LED button design and port ordering differ slightly)
- When upgrading from legacy NTD, the technician removes the old unit and slides the new one into the same bracket (~15 min swap)

---

### 1C. New 4-Port NTD — Nokia U-040X-A / Sercomm CG4000A

**Status:** Active. Deployed from September 2025. For business premises or multi-service residential (e.g., separate ISPs per port).

| Attribute | Detail |
|---|---|
| **Manufacturers** | Nokia (model U-040X-A) and Sercomm (model CG4000A) — dual supply |
| **Technology** | XGS-PON and GPON |
| **Ethernet ports** | 1x 10 Gbps RJ-45 (Port 1, grey) + 3x 2.5 Gbps RJ-45 (Ports 2–4, orange) |
| **Voice ports** | None (UNI-V removed from new generation) |
| **Optical port** | 1x fibre connector |
| **Max throughput** | 10 Gbps on Port 1; each of Ports 2–4 supports up to 2.5 Gbps. Up to 4 separate services |
| **Dimensions** | 250 mm (H) x 180 mm (W) x 48 mm (D) |
| **Color** | White |
| **Form factor** | Wall-mounted with removable cover |
| **Power** | 12V DC, 1.5A |
| **LEDs** | Power, Optical, Alarm, Ports 1–4 |
| **Reset** | Paperclip-activated |

**Setup-relevant notes:**
- Port 1 (10G) is the primary high-speed port — requires a 10GbE NIC or router to use at full speed
- Ports 2–4 can each be provisioned to different RSPs for separate services
- Nokia also produced a test/display unit U-010Y-A (seen at nbn HQ) — not deployed to customers

---

### FTTP Upgrade Path

| Scenario | What happens |
|---|---|
| Existing FTTP, staying on plans ≤1000 Mbps | Keep legacy G-240G-P. No change needed |
| Ordering Hyperfast (2000/400) | nbn technician swaps legacy NTD for new 1-port or 4-port (~15 min, same bracket) |
| New FTTP connection (greenfield or FTTC/FTTN→FTTP upgrade) | New 1-port NTD installed by default |
| Business needing multiple services | 4-port NTD installed |

---

## 2. FTTC (Fibre to the Curb) — NCD (Network Connection Device)

FTTC uses a small box at the customer premises called an NCD (Network Connection Device). Fibre runs from the exchange to a DPU (Distribution Point Unit) in a pit on the street near the premises. The NCD connects to the DPU via the existing copper phone line and provides an ethernet handoff to the customer's router. Critically, the NCD also reverse-powers the DPU through the phone line.

### 2A. Netcomm NDD-0300 (primary model)

**Status:** Active. The original and most widely deployed FTTC NCD. Two known revisions in the field.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Netcomm Wireless (now CASA Systems) |
| **Model** | NDD-0300 |
| **Revisions** | NDD-0300-01 (early), NDD-0300-02 (current production, Rev 02.1). NDD-0301-01 also exists with updated chipset |
| **Technology** | VDSL2 + G.fast capable (G.fast support present in hardware but not enabled by nbn). NDD-0300-02 supports 106 MHz G.fast profile; NDD-0301-01 supports 212 MHz |
| **Processor** | Intel GRX350 (MIPS 32-bit) |
| **Ethernet port** | 1x Gigabit Ethernet RJ-45 (yellow, labeled "C" / "GATEWAY") — connects to customer's router WAN port |
| **Phone line port** | 1x RJ-11/RJ-45 (grey, labeled "B") — connects to telephone wall socket (copper pair to DPU) |
| **Power port** | 1x IEC connector (black, labeled "A") — mains powered AC 200–250V 50/60Hz, outputs 60V DC 350mA to reverse-power the DPU |
| **Other** | RESET button (recessed, on side of unit) |
| **Dimensions** | 183.5 mm (L) x 183.5 mm (W) x 51.2 mm (H) — square footprint |
| **Weight** | 533 g |
| **Color** | White |
| **Form factor** | Compact square desktop unit. Wall-mountable via 2 screw holes on the back. Standalone (not wall-mounted by default) |
| **LEDs** | 4 indicators on top: Power (blue), Connection (blue/red), DSL (blue), LAN (blue/amber) |
| **Surge protection** | Gas arrestors rated 350V, fuses, protection circuits (vulnerability to lightning is a known issue) |

**LED meanings (from official nbn troubleshooting guide):**

| LED | Colour | Meaning |
|---|---|---|
| Power | None | Device off |
| Power | Blue | Normal operation |
| Connection | None | Not connected to DPU |
| Connection | Blue (blinking) | Starting up (wait up to 20 min) |
| Connection | Solid blue | Connected to DPU — normal |
| Connection | Solid red / blinking | Line fault — contact provider |
| Connection | Alternating red/blue | Line fault (possible off-hook phone on socket) |
| DSL | None | Broadband link down |
| DSL | Solid blue | DSL synchronised — normal |
| DSL | Blue (blinking) | DSL syncing or firmware update in progress |
| LAN | None | No ethernet connection to router |
| LAN | Blue/amber (solid or blinking) | Data flowing to router — normal |

**Port connections (from nbn official guide):**
1. Port A (black) → nbn power cord → power outlet
2. Port B (grey) → nbn telephone cable → telephone wall socket
3. Port C (yellow) → ethernet cable → router's WAN/Internet/nbn port

**Setup-relevant notes:**
- The NCD is a modem + reverse power feed only — no Wi-Fi, no routing, no firewall
- The customer's router must be a standard ethernet WAN router (not a VDSL modem-router — the NCD handles the DSL)
- ADSL filters must be removed — they will block the FTTC connection
- Older 600-series wall sockets (yellow, 3-prong) need an RJ-11 adapter
- The NCD runs warm/hot — this is normal due to the reverse power feed. Should not be covered
- Known issue: some NCDs fail during lightning storms due to surge damage to the reverse power circuit

### 2B. Adtran 423GN

**Status:** Active. Deployed as replacement for failed Netcomm NCDs and in some new installations.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Adtran |
| **Model** | 423GN |
| **Technology** | VDSL2 + G.fast capable |
| **Ethernet port** | 1x Gigabit Ethernet RJ-45 |
| **Phone line port** | 1x RJ-11/RJ-45 |
| **Power** | Mains powered, reverse-powers the DPU |
| **Color** | White |
| **Form factor** | Similar footprint to Netcomm NDD-0300, slightly different ventilation pattern on top |

**Setup-relevant notes:**
- Functionally identical to the Netcomm NCD from the customer's perspective
- Self-identifies to the nbn network — plug and play, no manual configuration
- Same port layout and connection method as the Netcomm NDD-0300

### FTTC Future

nbn has cancelled plans to enable G.fast on FTTC (which would have enabled gigabit speeds). Instead, FTTC premises will eventually be upgraded to FTTP. No new NCD models with 2.5G or multi-gigabit ethernet ports are planned — the upgrade path is FTTP.

---

## 3. HFC (Hybrid Fibre Coaxial) — NTD (Network Termination Device)

HFC uses a cable modem (NTD) at the customer premises. A coaxial cable (the same type used by Foxtel/pay TV) runs from the street into the premises and connects to the NTD, which provides an ethernet handoff to the customer's router.

### 3A. Arris CM8200 / CM8200B

**Status:** Legacy (still active, but no longer installed for new connections as of ~2025). The most widely deployed HFC NTD — the vast majority of HFC customers have this device.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Arris (now CommScope) |
| **Model** | CM8200 (original), CM8200B (revision), CM8200B P2 (second production run) |
| **Chipset** | Broadcom BCM3390 (dual-core 1.5 GHz MIPS) |
| **Technology** | DOCSIS 3.1 (backward compatible with DOCSIS 3.0) |
| **Ethernet ports** | 2x Gigabit Ethernet RJ-45 (10/100/1000). Only UNI-D1 is active; UNI-D2 is blanked out / reserved for future use |
| **Coaxial port** | 1x F-type connector (rear) — white coaxial cable with locking connectors at both ends |
| **Max throughput** | ~1.0 Gbps (limited by 1 Gbps ethernet port) |
| **Dimensions** | ~132 mm (H) x 132 mm (W) x 44 mm (D) — compact cube-like form |
| **Color** | Black |
| **Form factor** | Compact standalone desktop unit. Can be wall-mounted with optional bracket (3D-printable designs available). Not wall-mounted by default |
| **Power** | 12V DC 2A via external adapter |
| **LEDs (front)** | Power, Downstream (DS), Upstream (US), Online |
| **LEDs (rear)** | Ethernet link/speed indicator on the UNI-D1 port (green = gigabit, orange/amber = 100 Mbps — indicates older CAT5 cable) |
| **Web interface** | 192.168.100.1 — accessible before HFC connection is established, locked out afterward |
| **Default IP** | 192.168.100.1 |

**Setup-relevant notes:**
- Customer connects their router's WAN port to UNI-D1 (the active ethernet port) via ethernet cable
- The white coaxial cable is fixed / pre-installed — runs from the street/wall plate to the NTD
- No authentication required (IPoE)
- Cannot support plans above 1000 Mbps due to the 1 Gbps ethernet port
- The device has no power button — it must remain powered on
- CM8200 vs CM8200B: minor hardware revisions, functionally identical from the customer's perspective
- Spare/replaced CM8200s cannot be reactivated — the serial number is de-registered from nbn's network when replaced

### 3B. Arris CM3500 / CM3500B

**Status:** Active. Deployed from February 2025 for new HFC connections and Hyperfast plan upgrades.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Arris (CommScope) |
| **Model** | CM3500B/AU |
| **Technology** | DOCSIS 3.1 (2x2 OFDM/OFDMA, 32x8 SC-QAM EuroDOCSIS 3.0) |
| **Ethernet ports** | 1x 2.5 Gbps RJ-45 |
| **Coaxial port** | 1x F-type connector — white coaxial cable with locks |
| **Max throughput** | 2.5 Gbps (limited by ethernet port). Supports Hyperfast 2000/100 Mbps plan |
| **Dimensions** | ~435 mm (L) x 135 mm (H) x 150 mm (D) — noticeably larger/bulkier than CM8200 |
| **Color** | White (distinct from the black CM8200) |
| **Form factor** | Standalone desktop unit |
| **Power consumption** | ~10–12W (slightly higher than CM8200's ~8W) |
| **DS frequency range** | 108/258–1218 MHz |
| **US filter** | Switchable: 5–85 MHz or 5–204 MHz |

**Setup-relevant notes:**
- Customer connects their router's WAN port to the 2.5G ethernet port
- Requires a router with a 2.5GbE WAN port to benefit from speeds above 1 Gbps
- Self-installation available for eligible customers
- Visually distinct from the CM8200 (white vs black, larger form factor)
- Future DOCSIS 4.0-capable modems are anticipated but not yet deployed

### 3C. Arris CM820 (retired)

**Status:** Retired. Deployed before March 2017. Should have been replaced by CM8200 during the DOCSIS 3.1 upgrade program.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Arris |
| **Model** | CM820 / CM820A |
| **Technology** | DOCSIS 3.0 (8x4 bonded channels) |
| **Ethernet ports** | 1x Gigabit Ethernet RJ-45 |
| **Max throughput** | ~343 Mbps |

**Note:** Any customer still with a CM820 should request a replacement from their RSP. These units do not support current speed tiers.

---

## 4. FTTN / FTTB (Fibre to the Node / Fibre to the Building)

### FTTN (Fibre to the Node)

**No nbn hardware is installed at the customer's premises.** The nbn network terminates at the node (a street cabinet), and the existing copper phone line carries the VDSL2 signal from the node to the premises.

| Component | Detail |
|---|---|
| **nbn hardware at premises** | None |
| **Connection point** | Existing telephone wall socket (RJ-11) |
| **What the customer needs** | A VDSL2-compatible modem/router (supplied by RSP or BYO) |
| **Connection method** | Modem's DSL/Line port → telephone wall socket via phone cable |
| **Authentication** | PPPoE (username and password provided by RSP) |

**Setup-relevant notes:**
- The customer plugs their VDSL2 modem directly into the phone wall socket — no intermediate nbn device
- ADSL filters must be removed — they block VDSL2 signals
- Older 600-series wall sockets (yellow, 3-prong) need an RJ-11 adapter
- No other devices should be connected between the modem and the wall socket (no splitters, no filters)
- Performance depends on copper line length and quality from the node

### FTTB (Fibre to the Building)

**No nbn hardware is installed in the customer's apartment/unit.** The nbn fibre terminates at equipment in the building's communications room / MDF (Main Distribution Frame), typically in the basement or a utility area. From there, the existing internal copper wiring carries the VDSL2 signal to each unit.

| Component | Detail |
|---|---|
| **nbn hardware in building** | VDSL DSLAM (in basement/MDF room) — maintained by nbn, not accessible to customers |
| **nbn hardware in unit** | None |
| **Connection point** | Existing telephone wall socket (RJ-11) in the apartment |
| **What the customer needs** | A VDSL2-compatible modem/router (supplied by RSP or BYO) |
| **Connection method** | Modem's DSL/Line port → telephone wall socket via phone cable |
| **Authentication** | PPPoE |

**Setup-relevant notes:**
- Identical to FTTN from the customer's perspective — same modem, same setup process
- The building's internal wiring (from MDF to apartment) may need jumpering — this is the body corporate's responsibility, not nbn's
- Cabling beyond the MDF is owned by the body corporate or lot owner
- A technician visit may be required for a line test, but generally no new hardware is installed in the unit

### FTTN/FTTB Key Difference from Other Tech Types

Unlike FTTP, FTTC, HFC, and Fixed Wireless, there is no nbn-supplied device at the premises. The customer's own modem/router is the only device. This means:
- The modem must support VDSL2 (not just ADSL2+)
- PPPoE credentials are required (unlike FTTP/HFC/FTTC which use IPoE)
- The modem handles both the DSL connection and routing

---

## 5. Fixed Wireless — Outdoor Antenna (ODU) + Indoor Unit (NTU/IDU)

Fixed Wireless uses a two-part system: an outdoor antenna (ODU — Outdoor Unit) mounted on the roof or wall, connected via ethernet cable to an indoor unit (NTU — Network Termination Unit, also called IDU — Indoor Unit) mounted on an internal wall.

### Outdoor Antenna (ODU) Versions

| Version | Shape | Frequencies | Manufacturer | Max Speed (Down/Up) | Deployment Period | Status |
|---|---|---|---|---|---|---|
| **V1** | Square (mounted in square orientation) | 2300 MHz only | Netcomm/Ericsson | 56/18 Mbps | 2012 – Feb 2014 | **Retired** (no longer deployed) |
| **V2** | Diamond (mounted in diamond orientation) | 2300 MHz or 3500 MHz | Netcomm/Ericsson | 75/20 Mbps | 2014 – ~2018 | **Legacy** (still in field) |
| **V3** | Rectangle (oblong, sharper edges) | 2300 MHz + 3500 MHz (carrier aggregation) | Netcomm/Ericsson | 250/25 Mbps | ~2018 – ~2023 | **Legacy** (most widely deployed, still in field) |
| **V4.1** | Rectangle (vertical) | 4G + 5G mmWave (28 GHz) | Nokia | Up to 2000/200 Mbps (close range) | ~2023 – 2024 | **Active** (being revised to V4.2) |
| **V4.2** | Rectangle (horizontal) | 4G + 5G mmWave (28 GHz) | Nokia | Up to 2000/200 Mbps | 2024+ | **Active** (current deployment) |

**V1 specs:** Transmit power 23 dBm, antenna gain 13 dBi. CAT 3 LTE.
**V2 specs:** Transmit power 26 dBm, antenna gain 16 dBi. CAT 4 LTE.
**V3 specs:** CAT 6+ LTE. Supports carrier aggregation across both nbn 4G bands.
**V4 specs:** Nokia-manufactured. 5G mmWave (Non-Standalone mode, paired with cmWave 4G). mmWave range up to ~11 km. V4.2 revised from V4.1 to reduce side-lobe interference.

### Indoor Unit (NTU/IDU) — Legacy (Netcomm)

**Status:** Legacy. Used with V1–V3 outdoor antennas.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Netcomm Wireless (subcontracted from Ericsson) |
| **Models** | WNTD-CLI-1, WNTD-TD-LTE-1H |
| **Ethernet ports** | 4x Gigabit Ethernet RJ-45 (labeled UNI-D1 through UNI-D4). Each port is for a separate service — the NTU is NOT a router or switch |
| **Form factor** | Wall-mounted indoor unit, mounted adjacent to a GPO (power outlet) |
| **Color** | White |
| **Connection to antenna** | Ethernet cable (CAT5e) running through the wall/roof. The NTU provides PoE (Power over Ethernet) to power the outdoor antenna |
| **Power** | 12V DC via Micro-Fit 3.0 connector (3mm). Powers both the indoor unit and the outdoor antenna via PoE |
| **Function** | Primarily a PoE injector + ethernet distribution. All radio/modem electronics are in the outdoor antenna on the roof |

**Setup-relevant notes:**
- Customer connects their router's WAN port to UNI-D1 via ethernet cable
- Only UNI-D1 is typically provisioned for internet — the other ports are for additional services
- The NTU is not a router — it just passes through the ethernet connection from the antenna
- No authentication required (IPoE)
- The ethernet cable between indoor and outdoor units is typically CAT5e, run during professional installation

### Indoor Unit (IDU) — New (Nokia, V4)

**Status:** Active. Used with V4 outdoor antennas.

| Attribute | Detail |
|---|---|
| **Manufacturer** | Nokia |
| **Connection to antenna** | 2.5 Gbps Power over Ethernet (to outdoor unit on roof) |
| **Form factor** | Wall-mounted indoor unit |
| **Color** | White |

**Setup-relevant notes:**
- The V4 indoor unit connects to the outdoor antenna via a 2.5 Gbps PoE link
- Supports the new high-speed Fixed Wireless tiers (100/20, 250/25, and potentially higher with mmWave)
- When a V4 antenna is installed as an upgrade, the indoor unit is also replaced

### Fixed Wireless Upgrade Program

nbn is upgrading Fixed Wireless by:
1. Adding 4G and 5G mmWave equipment to towers
2. Replacing customer premises antennas (V2/V3 → V4)
3. Extending the Fixed Wireless footprint by ~50%, bringing ~120,000 former satellite-only premises onto Fixed Wireless
4. Enabling new speed tiers: 100/20 and 250/25 Mbps

---

## 6. Summary: What's at the Customer's Premises by Tech Type

| Tech Type | nbn Device at Premises | Customer Connects Router To | Authentication | Customer Needs |
|---|---|---|---|---|
| **FTTP** (legacy) | Nokia G-240G-P (white wall-mounted box, 4 GbE ports) | UNI-D1 port via ethernet | IPoE (none) | Any router with ethernet WAN |
| **FTTP** (new 1-port) | Nokia G-010G-D or Sercomm FG1000ANB (white, compact, 1x 2.5G port) | Single ethernet port | IPoE | Router with 2.5GbE WAN for full speed |
| **FTTP** (new 4-port) | Nokia U-040X-A or Sercomm CG4000A (white, 1x 10G + 3x 2.5G) | Port 1 (10G) or Ports 2–4 (2.5G) | IPoE | Router with 2.5GbE or 10GbE WAN |
| **FTTC** | Netcomm NDD-0300 or Adtran 423GN (white square box, 1 GbE port) | Yellow "C" / "GATEWAY" port via ethernet | IPoE | Any router with ethernet WAN |
| **HFC** (legacy) | Arris CM8200/B (black box, 1 active GbE port) | UNI-D1 port via ethernet | IPoE | Any router with ethernet WAN |
| **HFC** (new) | Arris CM3500B (white box, 1x 2.5G port) | Single ethernet port | IPoE | Router with 2.5GbE WAN for full speed |
| **FTTN** | None | Phone wall socket via phone cable | PPPoE | VDSL2 modem-router |
| **FTTB** | None (DSLAM in building basement) | Phone wall socket via phone cable | PPPoE | VDSL2 modem-router |
| **Fixed Wireless** (legacy) | Netcomm NTU (white wall-mounted, 4 GbE ports) + roof antenna | UNI-D1 port via ethernet | IPoE | Any router with ethernet WAN |
| **Fixed Wireless** (V4) | Nokia IDU (white wall-mounted) + Nokia roof antenna | Ethernet port | IPoE | Router with 2.5GbE WAN for full speed |

---

## 7. Key Differences That Matter for Setup Instructions

### Port speed requirements by plan tier

| Plan Tier | Required NTD Port Speed | Router WAN Port Needed |
|---|---|---|
| Basic (25/10) to Standard Plus (100/20) | 1 Gbps sufficient | Any gigabit ethernet |
| Premium (250/25) | 1 Gbps sufficient | Any gigabit ethernet |
| Ultrafast (500/200) | 1 Gbps sufficient | Any gigabit ethernet |
| Superfast (1000/50) | 1 Gbps sufficient | Gigabit ethernet |
| Hyperfast (2000/400 FTTP, 2000/100 HFC) | 2.5G or 10G (new NTD required) | 2.5GbE or 10GbE |

### Authentication differences

| Tech Type | Auth Method | What Customer Needs |
|---|---|---|
| FTTP, FTTC, HFC, Fixed Wireless | IPoE (automatic) | Nothing — connection is authenticated by the network using the NTD's serial number |
| FTTN, FTTB | PPPoE | Username and password from RSP, entered in modem/router settings |

### Cable types

| Connection | Cable Type |
|---|---|
| NTD/NCD → Router | Ethernet (CAT5e or CAT6 recommended) |
| FTTC NCD → Wall socket | Telephone cable (RJ-11, nbn-supplied) |
| FTTN/FTTB Modem → Wall socket | Telephone cable (RJ-11) |
| HFC NTD → Wall plate | Coaxial (F-type, pre-installed white cable) |
| Fixed Wireless ODU → IDU | Ethernet (CAT5e, through wall/roof) |

---

## Sources

- [nbn FTTP one-port connection box](https://www.nbnco.com.au/learn/network-technology/fibre-to-the-premises-explained-fttp/connection-box/1-port)
- [nbn FTTP four-port connection box](https://www.nbnco.com.au/learn/network-technology/fibre-to-the-premises-explained-fttp/connection-box/4-port)
- [nbn FTTC explained](https://www.nbnco.com.au/learn/network-technology/fibre-to-the-curb-explained-fttc)
- [nbn FTTN explained](https://www.nbnco.com.au/learn/network-technology/fibre-to-the-node-explained-fttn)
- [nbn FTTB explained](https://www.nbnco.com.au/learn/network-technology/fibre-to-the-building-explained-fttb)
- [nbn Fixed Wireless explained](https://www.nbnco.com.au/learn/network-technology/fixed-wireless-explained)
- [nbn selects Nokia next-gen fibre solutions](https://www.nbnco.com.au/corporate-information/media-centre/media-statements/nbn-selects-nokias-next-generation-fibre-solutions)
- [nbn FTTC troubleshooting guide (PDF)](https://www.nbnco.com.au/content/dam/nbnco2/documents/Connect-Kits/res/1930120-fttc-troubleshooting-10pp-online-fa.pdf.coredownload.pdf)
- [Nokia 7368 ISAM ONT G-240G-A data sheet (PDF)](http://www.psitec.com/assets/nokia/Nokia-7368-ISAM-ONT-G-240G-A-Data-Sheet-EN.pdf)
- [Whirlpool: Next-gen FTTP NTDs](https://forums.whirlpool.net.au/thread/3yqmw11m)
- [Whirlpool: HFC multi-gigabit discussion](https://forums.whirlpool.net.au/archive/9pxj8v6p)
- [Whirlpool: Inside an NBN FTTC NCD](https://forums.whirlpool.net.au/archive/3rp51z53)
- [Whirlpool: Fixed Wireless discussion highlights](https://whirlpool.net.au/wiki/highlights_from_the__fixed_wireless_discussion__nbn___thread)
- [Whirlpool: Differences in NBN HFC boxes](https://forums.whirlpool.net.au/archive/988l42jx)
- [Whirlpool: Arris CM8200 hardware entry](https://bc.whirlpool.net.au/bc/hardware/?action=h_view&model_id=1737)
- [Arris CM8200 status lights guide](https://www.1cloud.com.au/blog/arris-cm8200-for-nbn-hfc-status-lights)
- [Nokia 5G mmWave FWA for nbn](https://www.nokia.com/about-us/news/releases/2022/10/18/nokia-5g-mmwave-fwa-technology-selected-for-nbn-fixed-wireless-broadband/)
- [NBN Co to use Nokia CPE in fixed wireless upgrade](https://www.itnews.com.au/news/nbn-co-to-use-nokia-cpe-in-750m-fixed-wireless-upgrade-586637)
- [Real experience going multi-gigabit on NBN](https://oztechsolutions.au/the-real-experience-of-going-gigabit-on-nbn-plus-a-look-at-the-new-ntd/)
- [Launtel: FTTP 1-port or 4-port](https://www.launtel.net.au/news/fttp-1-port-or-4-port)
