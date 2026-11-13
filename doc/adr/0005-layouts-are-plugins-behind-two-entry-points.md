# 0005. Layouts are plugins behind two entry points

- Status: Accepted
- Date: 2026-10-22

## Context

Each layout has its own options, migrations, page plan, components, form sections and printed text. Spread across shared folders by kind (all options here, all components there), learning one layout meant opening several unrelated places, and nothing stopped one layout from depending on another's internals, so a change to one could break another.

## Decision

Everything one layout has, domain and UI, is in its one folder, `layouts/<layout-id>/`. Its files import only its own files and the host's (everything outside the layouts' folders), never another layout's. The host knows a layout only through two entry points, `layouts/<layout-id>/index.ts` (`defineLayout(id, spec)`) and `layouts/<layout-id>/ui/index.ts` (a `LayoutView`), imported by the registries alone (`layouts/index.ts`, `ui/layouts/registry.ts`). What several layouts share stays in the host. `src/layers.test.ts` fails on any import that breaks these rules, and on a folder not named after a layout id.

## Consequences

- A layout can be read, changed or removed as one unit; adding one is a folder and two registry entries, compile-enforced.
- Shared parts must be lifted into the host before a second layout uses them, rather than imported across.
- Some duplication is accepted on purpose, like each layout's own messages table ([0006](0006-printed-text-per-layout-per-locale.md)).
