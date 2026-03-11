# Belong nbn Modem Compatibility Checker — UI/UX Flow

## Overview

This document outlines the visual user flow and interaction states for the Modem Compatibility Checker widget, based on the provided flow-map diagram.

While `frontend-context.md` defines data structures and business logic, this document defines how the user moves through the interface.

---

## Core UI Paradigm: The Bottom Sheet

The entire compatibility checking process takes place within a **Bottom Sheet (Modal)** that slides up over the primary page content. This ensures the user does not lose their place in the checkout or support flow. The sheet can be dismissed at any time via the **×** close button or by tapping outside it.

---

## Step-by-Step Flow

### 1. Base Screen

- A form section titled **"Modem selection"**
- The user is asked: *"Do you rent a Belong modem?"* with two radio options:
  - Yes, I have a Belong modem
  - No, I have my own compatible modem
- Selecting **"No, I have my own compatible modem"** expands a subsection titled **"Modem compatibility"**, with explainer text and a **"Check my modem"** button
- Tapping **"Check my modem"** opens the Bottom Sheet

### 2. Search Input (Bottom Sheet — Step 1)

- Large 3D graphic/icon at the top of the sheet
- Title: *"Find your modem's model name/number"*
- Subtext: advises user to check the sticker on the back/bottom of their device
- Text input field for brand + model (e.g. "TP-Link Archer")
- **"Continue"** button executes the full-text search against Supabase

### 3. Loading State

- Pulsing or spinning 3D modem graphic
- Text: *"Finding your modem..."*
- Widget executes the Supabase `search_vector` full-text query

### 4. Search Result Routing

Results branch into three paths:

#### Path A — Multiple matches (2+ results)

- Title: *"Multiple matches found"*
- Radio group listing returned models (e.g. Archer VR1600v, Archer C7)
- User selects exact model → taps **"Continue"** → proceeds to Path B evaluation

#### Path B — Single match / model selected

Evaluates compatibility against the known nbn tech type. Displays device details (brand, model) in a white card. Three possible outcome states:

| State | Icon | Heading |
|-------|------|---------|
| **yes** | ✅ Green checkmark | "Compatible with Belong nbn" |
| **yes_but** | 🟡 Amber warning triangle | Compatible with caveats — lists human-readable condition codes |
| **no** | ❌ Red × | "Not compatible with Belong nbn" — explains why |

#### Path C — No match (0 results)

- Title: *"No modem found"*
- Advises user to double-check spelling or the sticker on their device
- **"Try again"** button loops back to Step 2 (Search Input)

### 5. Completion & Dismissal

- All three Path B result screens show a **"Done"** button
- Tapping **"Done"** (or dismissing the sheet) closes it and returns to the Base Screen
- **Base Screen updates:** beneath the selected radio option, confirmation text appears:
  > *"You have verified your modem is compatible. (TP-Link Archer VR1600v)"*

---

## Tech Type Resolution

The compatibility logic requires knowing the user's nbn technology type (FTTP, FTTC, FTTN/B, HFC) to evaluate the correct `compatibility` field from the database.

**MVP assumption:** The tech type is always known by the time the widget is rendered — passed in as a prop from the host page (which has already performed an address lookup). The Bottom Sheet flow does not need to ask for it.

**Dev/testing:** A small dev-only panel will be added (outside the widget UI) to toggle between tech types and verify that compatibility advice adjusts correctly. This will not be visible in production.

**Future consideration:** If the widget is ever used in a context where the tech type is unknown (e.g. a standalone support page), a selection step can be added — either on the Base Screen or as the first step inside the Bottom Sheet before the search input.
