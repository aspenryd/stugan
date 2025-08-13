const fs = require('fs');
const path = require('path');

// Helper function to load and execute a script in the test's context
const loadScript = (fileName) => {
    const scriptPath = path.resolve(__dirname, `../webfiles/${fileName}`);
    let scriptCode = fs.readFileSync(scriptPath, 'utf8');
    const varName = fileName.split('.')[0];
    scriptCode = scriptCode.replace(new RegExp(`^const ${varName}\\s*=\\s*`), `global.${varName} = `);
    eval(scriptCode);
};

// Load all game data scripts.
// The 'global' object is used to make the data available in the test environment.
loadScript('places.js');
loadScript('items.js');
loadScript('synonyms.js');
loadScript('actions.js');

describe('Playthrough Tests', () => {
    let DATA;

    beforeEach(() => {
        // Deep-clone the data for each test to ensure isolation.
        DATA = JSON.parse(JSON.stringify({
            places: global.places,
            items: global.items,
            synonyms: global.synonyms,
            actions: global.actions
        }));
        GameCore.buildSynonymMap(DATA.synonyms);
    });

    it('should start the game, display ASCII art, and allow movement', () => {
        const result = GameCore.init(DATA);
        expect(result.newState.loc).toBe('övergivet_torp');

        // Check for ASCII art in the initial output
        const initialOutput = result.output.join('\n');
        expect(initialOutput).toContain('小屋');

        // Test movement. The command for an exit is the exit key itself.
        const moveResult = GameCore.processCommand(result.newState, DATA, 'ut');
        expect(moveResult.newState.loc).toBe('glömda_stigen');
        const moveOutput = moveResult.output.join('\n');
        expect(moveOutput).toContain('Du befinner dig på en övervuxen och nästan osynlig stig.');
    });

    it('should allow taking an item', () => {
        const initState = GameCore.init(DATA).newState;
        // "ta" is a synonym for "take"
        const takeResult = GameCore.processCommand(initState, DATA, 'ta dagbok');
        expect(takeResult.newState.inventory).toContain('dagbok');
        const takeOutput = takeResult.output.join('\n');
        expect(takeOutput).toContain('Du plockar upp dagbok.');
    });

    it('should handle a multi-step navigation path', () => {
        let state = GameCore.init(DATA).newState;

        state = GameCore.processCommand(state, DATA, 'ut').newState;
        expect(state.loc).toBe('glömda_stigen');

        state = GameCore.processCommand(state, DATA, 'framåt').newState;
        expect(state.loc).toBe('uråldriga_eken');

        state = GameCore.processCommand(state, DATA, 'österut').newState;
        expect(state.loc).toBe('vattendragets_källa');
    });

    it('should show a different description based on a condition', () => {
        let state = GameCore.init(DATA).newState;
        // Navigate to the cave entrance
        state = GameCore.processCommand(state, DATA, 'ut').newState;
        state = GameCore.processCommand(state, DATA, 'framåt').newState;
        state = GameCore.processCommand(state, DATA, 'österut').newState;
        state = GameCore.processCommand(state, DATA, 'söderut').newState;
        state = GameCore.processCommand(state, DATA, 'österut').newState;

        expect(state.loc).toBe('murkna_grottan_ingång');

        // Enter the cave
        const moveResult = GameCore.processCommand(state, DATA, 'in');
        expect(moveResult.newState.loc).toBe('murkna_grottan_första_rummet');

        // Check for the "dark" description
        const moveOutput = moveResult.output.join('\\n');
        expect(moveOutput).toContain('Mörkret är kompakt');
    });
});
