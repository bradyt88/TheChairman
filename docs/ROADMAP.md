# The Chairman — Production Roadmap

## Locked design blueprint
The Chairman is a chairman/ownership simulation, not a manager simulator. The player owns the institution and makes strategic decisions while football staff run the football operation.

The visual and gameplay blueprint is locked through Phase I:

- **Phase A — Visual Language:** dark executive aesthetic, metallic gold/silver accents, cinematic football-business presentation.
- **Phase B — UI Shell:** consistent navigation, top status bar, responsive layouts and reusable cards/panels.
- **Phase C — Chairman HQ:** ownership dashboard, club pulse, decisions, news and chairman experiences.
- **Phase D — Club Management:** club identity, ownership, manager, facilities and strategic direction.
- **Phase E — Business & Finance:** cash, debt, budgets, revenue/costs, investment and financial consequences.
- **Phase F — Football Operations:** squad, staff, manager, recruitment and football decisions.
- **Phase G — Chairman Experiences:** boardroom, transfer room, stadium visit, training ground, manager meeting, matchday/director's box, media and major club moments.
- **Phase H — Competitions & Football World:** league tables, fixtures, results, other clubs, transfer market and competition progression.
- **Phase I — Dynamic World & Consequences:** events, relationships, fans, board pressure, sponsors, media, ownership legacy and butterfly effects.

## Phase J — Implementation
Implementation is now the active phase. Work in controlled stages and test each stage before moving forward.

### J1 — Production Foundation
1. Bring the A–I blueprint into the repository documentation.
2. Establish the production component/layout conventions.
3. Make responsive behaviour deliberate for desktop and mobile rather than treating mobile as a compressed desktop.
4. Remove obsolete prototype assumptions and dead controls.
5. Ensure the selected fictional club drives the interface consistently.
6. Keep GitHub as the source of truth and GitHub Pages as the live development beta.
7. Rebuild **Chairman HQ** as the first production-quality screen.
8. Verify navigation, save/load, selected-club persistence and the existing weekly simulation still function.

**J1 acceptance test:** desktop HQ → mobile HQ → navigate between core views → select a different club → refresh/load the career → advance one week → confirm state remains coherent.

### J2 — Club Overview
Implement the production Club area: identity, ownership, manager relationship, reputation, expectations, facilities and strategic direction.

### J3 — Business & Finance
Replace placeholder financial controls with the real financial model: revenue, operating costs, wages, debt servicing, budgets, investment and financial consequences.

### J4 — Football Operations
Build the production squad, staff, manager and football-operations layers around the chairman/manager separation.

### J5 — Transfer Room
Replace the prototype offer buttons with the full negotiation experience: selling club, sporting director/representative, agent, player information, offer structure, counteroffers, walk-away decisions, stakeholder reactions and consequences.

### J6 — Chairman Experiences
Build boardroom, stadium visit, training-ground visit, manager meeting, matchday/director's box, media and major-club-moment flows.

### J7 — Competitions & Football World
Implement league tables, fixtures/results, other-club activity, transfer-market activity, rivalries and competition progression.

### J8 — Dynamic World & Consequences
Implement the event/consequence engine, relationships, fan/board/sponsor/media reactions and ownership legacy.

### J9 — Polish & Release
Accessibility, performance, mobile QA, save-state integrity, fictional branding audit, onboarding, error handling and GitHub Pages release checks.

## Product constraints
- Fictional clubs, players and production branding only.
- No real-club logos or copied competition branding in production.
- No paid backend/API is required for the initial build.
- GitHub is the source of truth.
- GitHub Pages is the development beta.
- Approved generated visuals are design references unless explicitly added as production assets.
- Do not carry the previously rejected multi-screen concept image into production.
