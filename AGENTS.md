<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
# Level Up Planner — Agent Instructions

These instructions apply to all AI-assisted work in this repository.

## Read before working

Before planning, editing, or generating code, read:
1. `PRD.md` — product scope, requirements, user flows, data model, acceptance criteria.
2. `DESIGN.md` — brand identity, visual tokens, component rules, screen specifications, accessibility, and responsive behavior.

If a request conflicts with these documents, explain the conflict and ask before changing product scope or design direction. Do not silently invent requirements.

## Anti-Slop

Use the installed Anti-Slop plugin and its applicable rules/skills throughout planning, implementation, and review. Treat Anti-Slop as a quality filter, not as the product's visual style guide. `DESIGN.md` is the source of truth for Level Up Planner's visual direction.

Do not use generic AI-generated UI patterns without a clear product reason. Avoid gratuitous gradients, excessive cards, decorative icons, arbitrary animations, placeholder copy, and unnecessary visual complexity.

## Product context

- Product: Level Up Planner
- Purpose: personal life planner connecting long-term goals to milestones, tasks, habits, notes, and journaling.
- Platforms: Android-first, with iOS compatibility.
- Framework: React Native + Expo + TypeScript.
- Visual direction: minimalist, warm, calm, personal; warm cream, sage, forest green, beige, and charcoal.

## Engineering rules

- Inspect the existing codebase before making changes.
- Preserve working behavior unless the task explicitly requires changing it.
- Prefer small, incremental changes over broad rewrites.
- Use reusable, typed components and keep UI separate from domain/data logic.
- Do not add dependencies without explaining why they are needed.
- Do not claim a feature is implemented or tested unless it actually is.
- Keep platform-specific behavior compatible with Android and iOS.
- Handle loading, empty, success, validation, and error states where relevant.
- Protect user data; never hardcode credentials or secrets.

## Design and accessibility

- Follow the tokens and component specifications in `DESIGN.md`.
- Use accessible labels and adequate touch targets.
- Do not communicate status through color alone.
- Support text scaling and smaller phone layouts.
- Respect safe areas, keyboard behavior, and system back navigation.
- Keep interactions clear and avoid guilt-inducing language or streak-shaming.

## Definition of done

For each meaningful change:
1. Summarize the implementation plan before substantial architectural changes.
2. Implement the requested behavior.
3. Run relevant checks/tests when available.
4. Review Android layout and note any iOS implications.
5. Apply Anti-Slop review rules.
6. Report what changed, what was tested, and any known limitations.

## Scope control

The PRD defines MVP versus later features. Do not silently pull future features into the MVP. If requirements are ambiguous, state assumptions or ask one focused question.
