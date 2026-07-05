const path = require('path');
const { loadWorld, cloneWorld } = require('../tools/lib/load-world');

const WEBFILES = path.resolve(__dirname, '../webfiles');
const sourceWorld = loadWorld(WEBFILES);

describe('The Cabin - gameplay', () => {
    let DATA;

    beforeEach(() => {
        // Deep-clone the data for each test to ensure isolation.
        DATA = cloneWorld(sourceWorld);
        GameCore.buildSynonymMap(DATA.synonyms);
    });

    it('starts at the cabin and shows the long description on first visit', () => {
        const result = GameCore.init(DATA);
        expect(result.newState.loc).toBe('cabin');
        const output = result.output.join(' ').toLowerCase();
        expect(output).toContain('firewood');
        expect(output).toContain('you see');
    });

    it('shows the short description on the second visit', () => {
        let state = GameCore.init(DATA).newState;
        state = GameCore.processCommand(state, DATA, 'south').newState;
        const back = GameCore.processCommand(state, DATA, 'north');
        expect(back.newState.loc).toBe('cabin');
        expect(back.output.join(' ')).toContain('familiar cabin');
        expect(back.output.join(' ')).not.toContain('Firewood is stacked');
    });

    it('allows movement with directions, shortcuts and verbs', () => {
        let state = GameCore.init(DATA).newState;

        let result = GameCore.processCommand(state, DATA, 'south');
        expect(result.newState.loc).toBe('clearing');

        result = GameCore.processCommand(result.newState, DATA, 'n');
        expect(result.newState.loc).toBe('cabin');

        result = GameCore.processCommand(result.newState, DATA, 'go south');
        expect(result.newState.loc).toBe('clearing');

        result = GameCore.processCommand(result.newState, DATA, 'walk west');
        expect(result.newState.loc).toBe('foxden');
    });

    it('refuses movement through walls with a helpful message', () => {
        const state = GameCore.init(DATA).newState;
        const result = GameCore.processCommand(state, DATA, 'go west');
        expect(result.newState.loc).toBe('cabin');
        expect(result.output.join(' ')).toContain("can't go west");
    });

    it.each([
        ['take flashlight'],
        ['take the flashlight'],
        ['pick up flashlight'],
        ['pick up the torch'],
        ['get lamp'],
        ['grab flashlight']
    ])('supports taking items via "%s"', (command) => {
        const state = GameCore.init(DATA).newState;
        const result = GameCore.processCommand(state, DATA, command);
        expect(result.newState.inventory).toContain('flashlight');
        expect(result.output.join(' ')).toContain('You pick up');
    });

    it('refuses to take items that are absent or fixed', () => {
        const state = GameCore.init(DATA).newState;

        let result = GameCore.processCommand(state, DATA, 'take rope');
        expect(result.newState.inventory).not.toContain('rope');
        expect(result.output.join(' ')).toContain('no rope here');

        // The toolbox is in the engine shed and not portable.
        result = GameCore.processCommand(state, DATA, 'take gold');
        expect(result.output.join(' ')).toContain("don't know what");
    });

    it('supports dropping items', () => {
        let state = GameCore.init(DATA).newState;
        state = GameCore.processCommand(state, DATA, 'take diary').newState;
        const result = GameCore.processCommand(state, DATA, 'drop diary');
        expect(result.newState.inventory).not.toContain('diary');
        expect(DATA.places.cabin.items).toContain('diary');
    });

    it('describes items with "look at"', () => {
        let state = GameCore.init(DATA).newState;
        let result = GameCore.processCommand(state, DATA, 'look at flashlight');
        expect(result.output.join(' ')).toContain('scratched glass');

        // Also from the inventory, with synonyms.
        state = GameCore.processCommand(state, DATA, 'take flashlight').newState;
        result = GameCore.processCommand(state, DATA, 'examine the torch');
        expect(result.output.join(' ')).toContain('scratched glass');
    });

    it('toggles the flashlight with state tracking', () => {
        let state = GameCore.init(DATA).newState;

        // Not carrying it yet.
        let result = GameCore.processCommand(state, DATA, 'turn on flashlight');
        expect(result.output.join(' ')).toContain("don't have a flashlight");

        state = GameCore.processCommand(state, DATA, 'take flashlight').newState;
        result = GameCore.processCommand(state, DATA, 'turn on flashlight');
        expect(result.output.join(' ')).toContain('You turn on the flashlight');
        expect(DATA.items.flashlight.state).toBe('on');

        result = GameCore.processCommand(result.newState, DATA, 'turn on the flashlight');
        expect(result.output.join(' ')).toContain('already on');

        result = GameCore.processCommand(result.newState, DATA, 'turn off flashlight');
        expect(DATA.items.flashlight.state).toBe('off');
    });

    it('lists inventory and survey information', () => {
        let state = GameCore.init(DATA).newState;
        let result = GameCore.processCommand(state, DATA, 'inventory');
        expect(result.output.join(' ')).toContain('nothing');

        state = GameCore.processCommand(state, DATA, 'take flashlight').newState;
        result = GameCore.processCommand(state, DATA, 'inv');
        expect(result.output.join(' ')).toContain('Flashlight');

        result = GameCore.processCommand(state, DATA, 'look around');
        expect(result.output.join(' ')).toContain('south');
        expect(result.output.join(' ')).toContain('down');
    });

    it('cellar description reflects whether the flashlight is lit', () => {
        let state = GameCore.init(DATA).newState;
        state = GameCore.processCommand(state, DATA, 'take flashlight').newState;
        state = GameCore.processCommand(state, DATA, 'down').newState;

        let result = GameCore.processCommand(state, DATA, 'look');
        expect(result.output.join(' ')).toContain('pitch dark');

        state = GameCore.processCommand(state, DATA, 'turn on flashlight').newState;
        result = GameCore.processCommand(state, DATA, 'look');
        expect(result.output.join(' ')).toContain('a good place to search');
        expect(result.output.join(' ')).not.toContain('if you had some light');

        // Turning it off brings the darkness back.
        state = GameCore.processCommand(state, DATA, 'turn off flashlight').newState;
        result = GameCore.processCommand(state, DATA, 'look');
        expect(result.output.join(' ')).toContain('pitch dark');
    });

    it('responds helpfully to unknown commands', () => {
        const state = GameCore.init(DATA).newState;
        const result = GameCore.processCommand(state, DATA, 'dance wildly');
        expect(result.output.join(' ')).toContain("I don't understand");
    });

    it('gives location-flavored responses (window, lakeside melody)', () => {
        let state = GameCore.init(DATA).newState;
        let result = GameCore.processCommand(state, DATA, 'look at window');
        expect(result.output.join(' ')).toContain('grimy');

        state = GameCore.processCommand(state, DATA, 'south').newState;
        state = GameCore.processCommand(state, DATA, 'go east').newState;
        result = GameCore.processCommand(state, DATA, 'listen');
        expect(result.output.join(' ')).toContain('melody');
    });

    it('quits on request', () => {
        const state = GameCore.init(DATA).newState;
        const result = GameCore.processCommand(state, DATA, 'quit');
        expect(result.shouldQuit).toBe(true);
    });
});
