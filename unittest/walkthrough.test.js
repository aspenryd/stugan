const path = require('path');
const { loadWorld, cloneWorld } = require('../tools/lib/load-world');

const WEBFILES = path.resolve(__dirname, '../webfiles');
const sourceWorld = loadWorld(WEBFILES);

// Plays the whole game through the real parser, command by command, and
// asserts the player can win. If a content change breaks the golden path,
// this test fails with the offending command.
describe('The Cabin - full walkthrough', () => {
    it('can be played from start to victory', () => {
        const DATA = cloneWorld(sourceWorld);
        GameCore.buildSynonymMap(DATA.synonyms);

        let state = GameCore.init(DATA).newState;
        expect(state.loc).toBe('cabin');

        const play = (command, expectSubstring) => {
            const result = GameCore.processCommand(state, DATA, command);
            state = result.newState;
            const text = result.output.join('\n');
            if (expectSubstring) {
                expect(text.toLowerCase()).toContain(expectSubstring.toLowerCase());
            }
            return result;
        };

        // Gear up in the cabin.
        play('take flashlight', 'you pick up');
        play('take diary', 'you pick up');
        play('read diary', 'only light will find');

        // The cellar is dark; the flashlight reveals the key.
        play('down', 'cellar');
        play('search', 'pitch black');
        play('turn on flashlight', 'you turn on');
        play('search', 'rusty key');
        play('take key', 'you pick up');

        // Head to the fox den for the rope.
        play('up', 'cabin');
        play('south', 'clearing');
        play('west', 'damp moss');
        play('take rope', 'you pick up');

        // Down through the roots to the engine shed.
        play('down', 'labyrinth of roots');
        play('east', 'locomotive');

        // The shaft is blocked until the rope is tied.
        play('down', 'need to fasten it');
        play('open toolbox', 'folded map');
        play('take map', 'you pick up');
        play('read map', 'tie the rope');
        play('tie rope', 'iron beam');

        // Victory.
        const finale = play('down', 'heart of the forest');
        expect(state.loc).toBe('forestheart');
        expect(finale.output.join('\n')).toContain('Congratulations');
        expect(finale.shouldQuit).toBe(true);
    });

    it('blocks the shaft without a rope', () => {
        const DATA = cloneWorld(sourceWorld);
        GameCore.buildSynonymMap(DATA.synonyms);

        let state = GameCore.init(DATA).newState;
        for (const cmd of ['south', 'west', 'down', 'east']) {
            state = GameCore.processCommand(state, DATA, cmd).newState;
        }
        expect(state.loc).toBe('engineshed');

        const result = GameCore.processCommand(state, DATA, 'down');
        expect(result.newState.loc).toBe('engineshed');
        expect(result.output.join(' ')).toContain('too steep');
    });

    it('keeps the toolbox locked without the key', () => {
        const DATA = cloneWorld(sourceWorld);
        GameCore.buildSynonymMap(DATA.synonyms);

        let state = GameCore.init(DATA).newState;
        for (const cmd of ['south', 'west', 'down', 'east']) {
            state = GameCore.processCommand(state, DATA, cmd).newState;
        }

        const result = GameCore.processCommand(state, DATA, 'open toolbox');
        expect(result.output.join(' ')).toContain('locked');
        expect(DATA.places.engineshed.items).not.toContain('map');
    });
});
