# ModemChecker — Agent Instructions

## UI Component Workflow

- **NEVER** hand-code component markup (JSX/TSX) for visual UI components
- ALL visual components must be designed in Subframe first, then exported via `subframe:develop`
- Use the `figma-to-subframe` skill when translating Figma designs into implementation
- Code-only components (BottomSheet shell, hooks, data layer) are exempt from this rule
- Tests validate behavior and props, not markup structure

## Key References

- UX flow: `docs/ux-flow.md`
- Backend/data context: `docs/frontend-context.md`
- Figma node IDs: `memory/figma-nodes.md` (in project memory dir)
- Subframe project: `c141bce6134a`
- Figma file: `yyeLxpgLuFDjWj7325id9s`
