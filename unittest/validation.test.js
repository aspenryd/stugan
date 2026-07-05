const path = require('path');
const { loadWorld, cloneWorld } = require('../tools/lib/load-world');
const { validateWorld } = require('../tools/lib/validate');
const { solve, findUnreachablePlaces } = require('../tools/lib/solver');

const WEBFILES = path.resolve(__dirname, '../webfiles');
const sourceWorld = loadWorld(WEBFILES);

// Content-integrity gate: any change to places/items/actions/synonyms that
// introduces a broken reference or makes the game unwinnable fails here.
describe('World validation', () => {
    it('has no structural errors', () => {
        const { errors } = validateWorld(cloneWorld(sourceWorld));
        expect(errors).toEqual([]);
    });

    it('has no warnings (unknown action keys, shadowed actions, ...)', () => {
        const { warnings } = validateWorld(cloneWorld(sourceWorld));
        expect(warnings).toEqual([]);
    });

    it('goal is reachable from the start', () => {
        const result = solve(cloneWorld(sourceWorld));
        expect(result.reachedGoal).toBe(true);
        expect(result.walkthrough.length).toBeGreaterThan(0);
    });

    it('every place can be visited', () => {
        expect(findUnreachablePlaces(cloneWorld(sourceWorld))).toEqual([]);
    });

    it('solver walkthrough matches the intended puzzle chain', () => {
        const result = solve(cloneWorld(sourceWorld));
        const commands = result.walkthrough.join(' | ');
        // The winning plan must involve the rope being tied in the engine shed.
        expect(commands).toContain('take rope');
        expect(commands).toContain('tie rope');
    });

    // Regression guards: the validator itself must catch common mistakes.
    describe('validator self-checks', () => {
        it('detects exits to unknown places', () => {
            const broken = cloneWorld(sourceWorld);
            broken.places.cabin.exits.east = 'atlantis';
            const { errors } = validateWorld(broken);
            expect(errors.join(' ')).toContain('atlantis');
        });

        it('detects actions revealing unknown items', () => {
            const broken = cloneWorld(sourceWorld);
            broken.actions.cellar[1].reveals = ['excalibur'];
            const { errors } = validateWorld(broken);
            expect(errors.join(' ')).toContain('excalibur');
        });

        it('detects invalid regex patterns', () => {
            const broken = cloneWorld(sourceWorld);
            broken.actions['*'][0].pattern = '([unclosed';
            const { errors } = validateWorld(broken);
            expect(errors.join(' ')).toContain('invalid regex');
        });

        it('detects engine-unknown action keys (e.g. old unlock_exits)', () => {
            const broken = cloneWorld(sourceWorld);
            broken.actions.engineshed[2].unlock_exits = { down: 'forestheart' };
            const { warnings } = validateWorld(broken);
            expect(warnings.join(' ')).toContain('unlock_exits');
        });

        it('solver detects an unwinnable world', () => {
            const broken = cloneWorld(sourceWorld);
            // Remove the rope: the shaft can never be opened.
            broken.places.foxden.items = [];
            const result = solve(broken);
            expect(result.reachedGoal).toBe(false);
        });
    });
});
