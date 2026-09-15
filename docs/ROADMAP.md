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

**Status: COMPLETE.** Production Club Overview is deployed and uses the locked Chairman visual language.

### J3 — Business & Finance
Replace placeholder financial controls with the real financial model: revenue, operating costs, wages, debt servicing, budgets, investment and financial consequences.

**Status: COMPLETE.** J3 now includes:
- Weekly operating revenue from matchday, broadcast, sponsorship and commercial activity.
- Weekly costs from actual player wages, club/stadium operations and debt service.
- Season revenue, costs and net tracking.
- Twelve-week cash-flow history and monthly financial review messages.
- Cash reserve target and financial pressure states.
- Wage-budget variance and board-confidence consequences.
- Transfer allocation versus cash-reserve controls.
- Indicative club-value calculation tied to cash, debt, reputation and stadium capacity.
- Transfer activity now feeds squad wages, transfer commitments and financial state.
- Migration for existing J1/J2 saves so the new finance state is added without discarding the career.
- Production Financial Control screen using the same responsive Chairman UI system.

**J3 acceptance test:** open Finances → verify Week 1 state → advance one week → verify revenue/cost/net close → verify cash changes → verify history → refresh/load save → verify finance state persists → test reserve/budget controls → complete a transfer and verify wages/commitments.

### J4 — Football Operations
**Status: IN PROGRESS.** J4 is now the active build stage.

Build the production squad, youth pathway, staff, manager and football-operations layers around the chairman/manager separation. Squad ownership must remain connected to transfer movement and wage costs.

**J4 player model requirements:**
- Keep the player model deliberately chairman-level: no granular Football Manager-style ability attributes such as pace, heading, strength or technical sub-attributes.
- Use a compact performance record: appearances, minutes, goals, assists, key passes, average match rating, form, development, fitness and morale.
- Treat **potential** as a relatively stable ceiling, **development** as progress toward that ceiling, **overall** as current ability and **form** as short-term performance.
- Overall rating moves gradually from performance, development and age; a single match must not cause wild changes.
- Player value is derived from overall, potential, age, form, contract and transfer demand.
- Performance statistics provide evidence behind changes to form, development, overall and value.
- The system remains outcome-based rather than tactical. No pace, heading, strength, finishing, passing or other granular ability grid is exposed to the chairman.
- Player performance eventually feeds transfer interest, wages, squad status and club finances.

**J4 squad lifecycle:**
- **First team:** senior players aged 20+.
- **Youth squad:** players aged 19 or under.
- Youth players develop over time and can be promoted into the first team at 20.
- Strong youth prospects can be used in first-team/cup football; the system should reward meaningful playing time without requiring tactical management.
- Players age naturally each season.
- Players approaching their late 30s decline rather than suddenly becoming unusable.
- Current retirement target is **37**; retirement removes the player from the active squad and records the career milestone.
- New-generation players enter the youth pathway at roughly **15–17**, with lower starting OVR and potentially high potential.
- The long-term lifecycle is: **youth → development → first team → performance/value growth → peak → decline → retirement → new generation**.
- Loans are deliberately deferred to a later stage and are not part of the core J4 mobile loop.

**J4 matchday foundation:**
- A normal week should still advance the season efficiently, but a league match must no longer be represented only by numbers.
- `Advance Week` remains the primary calendar action, with a matchday choice before the result is finalised.
- The player can **Skip Match** for an immediate simulated result.
- The player can **Attend Match** for a cinematic chairman matchday flow.
- Home matches use a reusable executive/director's-box scene rather than a unique stadium for every club.
- Away matches use a small set of reusable stadium/travel scenes rather than building 100 bespoke grounds.
- Matchday should have a short sequence: pre-match → first-half/half-time situation → chairman decision → second-half → full-time → post-match consequence.
- Chairman decisions are high-level institutional choices, not tactics, formations or minute-by-minute football management.
- The matchday experience must update the same underlying result, player performance, confidence, finances and news systems used by a skipped match.
- The user must be able to leave/skip the live experience without corrupting or duplicating the result.

**J4 acceptance test:** open Squad → inspect player performance record → advance a week → choose Skip Match and verify a coherent result/stats/state update → repeat and choose Attend Match → verify the matchday sequence, chairman decision points and final result feed the same finance/confidence/player systems → refresh/load and verify persistence → advance through a season boundary and verify youth promotion, retirement and new-generation creation.

### J5 — Transfer Room
Build the transfer lifecycle as a simple but consequential chairman system:
- Eight monitored targets at a time.
- Market refreshes weekly; normally all eight rotate randomly, while an active negotiation remains visible until completed or abandoned so a player never vanishes mid-decision.
- Every target shows market value, wage and key player information before negotiation.
- Offer buttons show the exact proposed fee; there are no hidden “fair” amounts.
- Low, fair and aggressive offers have different outcomes.
- Important transfer actions use a two-step flow: proposal → clear confirmation screen → completed transfer.
- Confirmation shows fee, immediate cash effect, future commitment, wage effect, resulting transfer budget and any wage-budget pressure.
- Confirmed purchases move the player into the club squad and remove them from the active market.
- Squad players can be considered for sale through the same chairman confirmation pattern.
- Confirmed sales remove the player from the squad, increase cash, reduce weekly wages and create new transfer allocation.
- Transfer spending, income, commitments and wages stay connected to the finance model.
- The system remains deliberately simpler than a full manager simulator: no tactics or minute-by-minute football decisions are added to the chairman transfer flow.
- Later iterations can add transfer windows, dates, selling-club negotiation personalities, agents, counteroffers and competing clubs without changing the core lifecycle.

### J6 — Chairman Experiences
Build boardroom, stadium visit, training-ground visit, manager meeting, matchday/director's box, media and major-club-moment flows.

**Matchday note:** the live matchday experience defined in J4 is the football-facing cinematic layer; J6 should turn it into a polished reusable chairman experience with executive presentation, scene transitions and meaningful high-level decisions rather than tactical gameplay.

### J7 — Competitions & Football World
Implement league tables, fixtures/results, other-club activity, transfer-market activity, rivalries and competition progression.

### J8 — Dynamic World & Consequences
Implement the event/consequence engine, relationships, fan/board/sponsor/media reactions and ownership legacy. Add living-world player movement so players can move between clubs, other clubs can buy/sell, and the transfer market reflects those changes.

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
