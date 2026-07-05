const { generateWorld } = require('../tools/lib/generate');
const { validateWorld } = require('../tools/lib/validate');
const { solve, findUnreachablePlaces } = require('../tools/lib/solver');

// The generator must only ever produce valid, winnable worlds - across many
// seeds and sizes - and its plans must be executable through the real parser.
describe('World creator', () => {
    const SEEDS = [1, 7, 42, 1337, 20260704];

    it.each(SEEDS)('seed %i produces a valid world', (seed) => {
        const world = generateWorld({ seed, rooms: 8 });
        const { errors } = validateWorld(world);
        expect(errors).toEqual([]);
    });

    it.each(SEEDS)('seed %i produces a winnable world with no dead content', (seed) => {
        const world = generateWorld({ seed, rooms: 10 });
        const result = solve(world);
        expect(result.reachedGoal).toBe(true);
        expect(findUnreachablePlaces(world)).toEqual([]);
    });

    it('is deterministic for the same seed', () => {
        const a = generateWorld({ seed: 99, rooms: 8 });
        const b = generateWorld({ seed: 99, rooms: 8 });
        expect(a).toEqual(b);
    });

    it('produces different layouts for different seeds', () => {
        const a = generateWorld({ seed: 1, rooms: 8 });
        const b = generateWorld({ seed: 2, rooms: 8 });
        expect(JSON.stringify(a.places)).not.toEqual(JSON.stringify(b.places));
    });

    it.each(SEEDS)('seed %i: the solver plan is playable through the real engine', (seed) => {
        const world = generateWorld({ seed, rooms: 9 });
        const plan = solve(world);
        expect(plan.reachedGoal).toBe(true);

        // Replay the machine-found walkthrough command by command via GameCore.
        const DATA = JSON.parse(JSON.stringify(world));
        GameCore.buildSynonymMap(DATA.synonyms);
        let state = GameCore.init(DATA).newState;
        let lastResult = null;
        for (const command of plan.walkthrough) {
            lastResult = GameCore.processCommand(state, DATA, command);
            state = lastResult.newState;
        }
        expect(state.loc).toBe(world.meta.goal);
        expect(lastResult.shouldQuit).toBe(true);
    });

    it('respects the requested room count', () => {
        const world = generateWorld({ seed: 5, rooms: 6 });
        // rooms + the goal room
        expect(Object.keys(world.places).length).toBe(7);
        expect(world.places[world.meta.goal]).toBeDefined();
        expect(world.places[world.meta.start]).toBeDefined();
    });
});
