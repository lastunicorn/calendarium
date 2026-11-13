# 0010. Plain records and functions: no classes, no DI

- Status: Accepted
- Date: 2026-10-20

## Context

The domain model (projects, options, dates, plans) could be written with the object-oriented toolbox: entities and value objects as classes, a repository interface with dependency injection, domain events, branded number types. The options are stored as JSON, updated by spreading in the reducer, and compared by reference for React `memo`.

## Decision

The model is plain records plus pure functions. `storage.ts` is the repository, with one implementation and no interface. The only reaction to a change is saving it, which one effect does, so there is no event bus. Values are checked at the boundary (`copyValid`) and their invariants kept by `normalize`, so number types stay unbranded; `Weekday` is the one cheap exception. The page plan is the read model, a pure function.

## Consequences

- No (de)serialization code: a record is its own JSON.
- Immutable updates and reference equality work with React as is.
- Encapsulation comes from modules and the reducer's commands, not from private fields.
- Revisit an interface when a second implementation appears (another storage, say), not before.
