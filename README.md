# The Cabin: Heart of the Forest

A retro browser text adventure with a data-driven engine, a content-validation
test framework, and a procedural world creator.

Play it by opening `webfiles/index.html` in a browser.

## Architecture

```
webfiles/
  places.js     World content: rooms, descriptions, exits        (data)
  items.js      Items: names, descriptions, portability, state   (data)
  synonyms.js   Words the parser accepts, per verb/item/direction (data)
  actions.js    Declarative puzzles: pattern + conditions -> effects (data)
  strings.js    Engine UI messages, per language                 (data)
  meta.js       Language, title, start location, goal location   (data)
  core.js       GameCore: the pure game engine (no DOM). Used by the
                browser AND the test suite - one engine, tested for real.
  engine.js     Thin DOM wrapper: input field, viewport, stats bar.
  index.html    Landing page + game UI. Loads data files, then the engine.
```

The engine is language-agnostic:

- Internal ids are canonical tokens (`north`, `take`, `flashlight`...).
- Everything the player *types* is mapped through `synonyms.js`.
- Everything the engine *prints* comes from `strings.js` (keyed by `meta.lang`)
  or from the content files.

**To add a language:** translate `strings.js` (a `sv` table is already included
as a template) plus the four content files, and set `meta.lang`.

### Dynamic room descriptions (places.js)

A place may define `descVariants`: a list of `{conditions, desc}` entries
(same condition syntax as actions). The first variant whose conditions hold
replaces the default `desc` - e.g. the cellar reads differently once your
flashlight is lit.

### Action format (actions.js)

Each action is matched against raw player input (regex, case-insensitive),
guarded by conditions, and applies effects:

| Key            | Meaning                                              |
|----------------|------------------------------------------------------|
| `pattern`      | Regex tested against the raw input                   |
| `conditions`   | All must hold: `has:item`, `not_has:item`, `item:id:state`, `has_flag:x`, `not_has_flag:x`, `at_location:place` |
| `response`     | Text printed when the action fires                   |
| `state_change` | `{item, state}` - set an item's state                |
| `reveals`      | Item ids added to the current room                   |
| `reveals_exit` | `{direction, destination}` - open a new exit here    |
| `set_flag` / `add_item` / `consume_item` / `remove_from_room` / `go` / `game_ending` | Further effects |
| `hint`         | A sample command a player could type (used by the solver for walkthroughs) |

Location-specific actions run before global (`*`) ones; the first match wins,
so put the most-conditioned variant first.

## Test framework

`npm test` runs four suites in `unittest/`:

- **play.test.js** - parser and command behavior (take/drop/look/move/light,
  synonyms, error messages).
- **walkthrough.test.js** - plays the entire game start-to-victory through the
  real parser; fails on the exact command that broke the golden path.
- **validation.test.js** - content-integrity gate powered by `tools/lib`:
  - `validate.js` - static checks: exits to unknown rooms, unknown items,
    invalid regexes, action keys the engine ignores, contradictory synonyms,
    shadowed (unreachable) actions.
  - `solver.js` - a breadth-first planner that simulates movement, item
    pickup and action effects to *prove* the goal is reachable and every room
    is visitable. Change the content however you like: if the game becomes
    unwinnable, this test fails.
- **worldcreator.test.js** - the generator must only emit valid, winnable
  worlds, deterministically per seed, and every machine-found walkthrough must
  replay successfully through the real engine.

## World creator

Generate a new, guaranteed-winnable world:

```sh
node tools/create-world.js --random --seed 2026 --rooms 10 \
  --name "The Whispering Pines" --out generated/pines --playable
```

- Rooms are carved on a 3D grid (consistent, bidirectional exits), the goal is
  gated behind a tool, and the tool is hidden in a dark room that requires a
  lit lantern - so every world has a real puzzle chain.
- Every world is validated and machine-solved **before** it is written;
  unwinnable output is impossible. A `WALKTHROUGH.md` with the solution and a
  `world.json` spec are written next to the data files.
- `--playable` copies `index.html` + engine files so the output folder is a
  complete game.

Build a hand-written world from a JSON spec instead
(`{places, items, synonyms, actions, meta}` - same shape as `world.json`):

```sh
node tools/create-world.js --spec myworld.json --out generated/custom --playable
```

To make a generated world the shipped one, copy its `.js` files into
`webfiles/` - the tests will then validate that world.

## Deployment

The site is deployed to Azure Static Web Apps via a `StaticSites` folder that
lives next to this repo (the old GitHub Actions deploy was removed when its
Azure credentials expired):

1. Copy the contents of `webfiles/` to `..\StaticSites\source\stugan`
2. Run `..\StaticSites\deploy_staticweb.bat` (uses the SWA CLI with the
   deployment token from `..\StaticSites\.env`)

Or just run **`deploy.bat`** in the repo root, which does both - and runs the
test suite first, aborting the deploy if anything fails. Note that the copy
mirrors `webfiles/` exactly (stale files in the target are removed).
